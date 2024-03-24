import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { useQueue } from "@uidotdev/usehooks";
import TranscriptionContext from "../app/components/TranscriptionContext";
import { createMediaStream } from "../utils/createMediaStream";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Transcription } from "@/app/types";
import { formatTimestamp } from "@/app/(speech)/utils";
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import * as lamejs from '@breezystack/lamejs';

const model = {
  model: "nova-2-medical",
  interim_results: true,
  smart_format: true,
  diarize: true,
};

async function connectWavEncoder() {
  await register(await connect());
}

async function convertWavToMp3(wavBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const wavDecoder = (lamejs.WavHeader as any).readHeader(new DataView(arrayBuffer));
      const wavSamplesLength = (arrayBuffer.byteLength - wavDecoder.dataOffset) / 2;
      const wavSamples = new Int16Array(arrayBuffer, wavDecoder.dataOffset, wavSamplesLength);
      const mp3Encoder = new lamejs.Mp3Encoder(wavDecoder.channels, wavDecoder.sampleRate, 128);
      const mp3Buffer = mp3Encoder.encodeBuffer(wavSamples);
      const mp3Data = mp3Encoder.flush();
      const mp3BufferWithHeader = new Uint8Array(mp3Buffer.length + mp3Data.length);
      mp3BufferWithHeader.set(mp3Buffer, 0);
      mp3BufferWithHeader.set(mp3Data, mp3Buffer.length);
      const mp3Blob = new Blob([mp3BufferWithHeader], { type: 'audio/mp3' });
      resolve(mp3Blob);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(wavBlob);
  });
}



export const useRecordVoice = (
  documentId: Id<"documents">,
  onTranscriptionComplete: any
) => {
  const { add, remove, first, size, queue } = useQueue<any>([]);
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isListening, setListening] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const chunks = useRef<Blob[]>([]);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const updateNoteWithAudio = useMutation(api.documents.updateNoteWithAudio);
  const updateDocument = useMutation(api.documents.update);
  const updateSummaryNote = useMutation(api.documents.saveSummaryNote);

  const {
    setLiveTranscription,
    addFinalTranscription,
    setFinalTranscription,
    generateNewSessionId,
    clearFinalTranscriptions,
    setIsTranscribed,
    isDisabledRecordButton,
    setisDisabledRecordButton,
    setAudioFileUrl,
    setSummarizationResult,
    setSummaryNote,
  } = useContext(TranscriptionContext);

  const sendSummaryForBlocknote = async (summary: string) => {
    if (summary.length > 0) {
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ content: summary }],
          }),
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = (await response.json()).data;
        console.log("Summary Note result:", data);
        return data;
      } catch (error) {
        console.error("Error sending transcription for summarization:", error);
      }
      return null;
    }
  };

  let retryTimeout: NodeJS.Timeout | null = null;

  const setupDeepgramConnection = () => {
    console.log("connecting to deepgram");

    const deepgram = createClient(
      `${process.env.NEXT_PUBLIC_VOICELY_API_SECRET}`
    );

    const connection = deepgram.listen.live(model);
    let keepAliveInterval: NodeJS.Timeout | null = null;

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log("connection established");
      setListening(true);

      // Start sending silent audio data periodically
      keepAliveInterval = setInterval(() => {
        if (isListening) {
          const silentBuffer = new ArrayBuffer(1024);
          connection?.send(silentBuffer);
          console.log("sending silent audio data");
        }
      }, 2000);
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("connection closed");
      setListening(false);
      setConnection(null);

      // Clear the keep-alive interval when the connection closes
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }

      // Retry the connection only if the microphone is still open
      if (micOpen) {
        retryTimeout = setTimeout(() => {
          console.log("Retrying the connection...");
          startRecording();
        }, 100);
      }
    });

    connection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error("Transcription error:", error);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const alternatives = data.channel.alternatives[0];
      const words = alternatives.words;
      console.log("words detected", words);
      if (words && words.length > 0) {
        const speaker = words[0].speaker;
        const startSeconds = words[0].start;

        const formattedTimestamp = formatTimestamp(startSeconds);

        const isFinal = data.is_final;

        if (isFinal) {
          addFinalTranscription({
            ...alternatives,
            timestamp: formattedTimestamp,
            speaker: speaker,
          });
          setFinalTranscription({
            ...alternatives,
            timestamp: formattedTimestamp,
            speaker: speaker,
          });
          setLiveTranscription(null);
          console.log("final transcript: ", alternatives);
        } else {
          console.log("live transcript", alternatives);
          setLiveTranscription({
            ...alternatives,
            timestamp: formattedTimestamp,
            speaker: speaker,
          });
        }
      }
    });

    setConnection(connection);
  };

  const startRecording = useCallback(async () => {
    if (!microphone && !userMedia) {
      await connectWavEncoder();
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      generateNewSessionId();

      const mediaRecorder = new MediaRecorder(userMedia, {
        mimeType: 'audio/wav',
      });
      mediaRecorder.start(500);

      mediaRecorder.onstart = () => {
        setMicOpen(true);
        chunks.current = [];
        console.log("useRecordVoice.js - MediaRecorder started");
        setupDeepgramConnection();
      };

      mediaRecorder.ondataavailable = (e) => {
        add(e.data);
        chunks.current.push(e.data);
      };

      setUserMedia(userMedia);
      setMicrophone(mediaRecorder as MediaRecorder);
    }
  }, [connection, microphone, userMedia]);

  const pauseRecording = useCallback(() => {
    if (microphone && userMedia && microphone.state === "recording") {
      microphone.pause();
      console.log("Recording paused");
    }
  }, [microphone, userMedia]);

  const resumeRecording = useCallback(() => {
    if (microphone && userMedia && microphone.state === "paused") {
      microphone.resume();
      console.log("Recording resumed");
    }
  }, [microphone, userMedia]);

  const stopRecording = useCallback(async () => {
    if (microphone && userMedia) {
      microphone.stop();
      userMedia.getTracks().forEach((track) => track.stop());
      setUserMedia(null);
      setMicrophone(null);
      console.log("Recording stopped");

      if (connection) {
        connection.finish();
        setConnection(null);
      }

      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }

      setMicOpen(false);
      setisDisabledRecordButton(true);
      const wavBlob = new Blob(chunks.current, { type: "audio/wav" });
      console.log("useRecordVoice.js - MediaRecorder stopped");

      try {
        const mp3Blob = await convertWavToMp3(wavBlob);
        const postUrl = await generateUploadUrl();
        console.log("is transcribing audio file, postUrl is", postUrl);

        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "audio/mp3" },
          body: mp3Blob,
        });
        const audioFileRef = await result.json();

        const uploadResult = await updateNoteWithAudio({
          noteId: documentId,
          audioFileRef: audioFileRef.storageId,
          storageId: audioFileRef.storageId,
        });
        if (uploadResult.success) {
          setAudioFileUrl(uploadResult.fileUrl);
          const transcribeResponse = await fetch("/api/deepgram/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: uploadResult.fileUrl,
            }),
          });
          const utteranceResult = await transcribeResponse.json();
          console.log("utteranceResult", utteranceResult);

          clearFinalTranscriptions();

          const utterances = utteranceResult.results.utterances;
          utterances.map(function (transcription: Transcription, index: any) {
            transcription.timestamp = formatTimestamp(transcription.start);
            addFinalTranscription(transcription);
          });

          const summary =
            utteranceResult.results.channels[0].alternatives[0].transcript;
          if (summary) {
            const summaryNote = await sendSummaryForBlocknote(summary);
            if (summaryNote) {
              setSummarizationResult(summaryNote);
              setSummaryNote(summaryNote);
              await updateDocument({
                id: documentId,
                content: JSON.stringify(utterances),
                summarizationResult: summaryNote,
                summaryNote: summaryNote,
              });
              setIsTranscribed(true);
              setisDisabledRecordButton(false);
            }
          }
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
      }
    }
  }, [
    microphone,
    userMedia,
    connection,
    generateUploadUrl,
    updateNoteWithAudio,
    documentId,
    clearFinalTranscriptions,
    addFinalTranscription,
    setAudioFileUrl,
    sendSummaryForBlocknote,
    setSummarizationResult,
    setSummaryNote,
    updateDocument,
    setIsTranscribed,
    setisDisabledRecordButton,
  ]);

  useEffect(() => {
    const processQueue = async () => {
      if (size > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const blob = first;
          connection?.send(blob);
          remove();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 250);
      }
    };

    processQueue();
  }, [connection, queue, remove, first, size, isProcessing, isListening]);

  return {
    micOpen,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
};