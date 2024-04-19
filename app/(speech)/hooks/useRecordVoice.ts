//new "fixed"
import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { useQueue } from "@uidotdev/usehooks";
import TranscriptionContext from "../app/components/TranscriptionContext";
import {useAction, useMutation} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Transcription } from "@/app/types";
import { formatTimestamp } from "@/app/(speech)/utils";
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import useSummarize from "@/hooks/use-summarize";
import useStringToPlate from "@/hooks/use-string-to-plate";

const model = {
  model: "nova-2-medical",
  interim_results: true,
  smart_format: true,
  diarize: true,
};

async function connectWavEncoder() {
  await register(await connect());
}


let connected = false
let connection : LiveClient | null = null
let listening = false
let encoder: void | null = null
let started = false;
let temp_timer = 0
let previous_timer = 0

export const useRecordVoice = (
  documentId: Id<"documents">,
  onTranscriptionComplete: any
) => {
  const { add, remove, first, size, queue } = useQueue<any>([]);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const chunks = useRef<Blob[]>([]);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const updateNoteWithAudio = useMutation(api.documents.updateNoteWithAudio);
  const updateDocument = useMutation(api.documents.update);
  const summarize = useSummarize()
  const stringToPlate = useStringToPlate()
  const {
    setLiveTranscription,
    addFinalTranscription,
    setFinalTranscription,
    generateNewSessionId,
    clearFinalTranscriptions,
    setIsTranscribed,
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

    connection = deepgram.listen.live(model);

    connection.on(LiveTranscriptionEvents.Open, () => {
      connected = true;
      console.log("connection established");
      listening = true;
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("connection closed");
      connection?.finish()
      listening = false;
      connection = null
      connected = false
      previous_timer += temp_timer
      temp_timer = 0
    });

    connection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error("Transcription error:", error);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const alternatives = data.channel.alternatives[0];
      const words = alternatives.words;
      if (words && words.length > 0) {
        const speaker = words[0].speaker;
        const startSeconds = words[0].start;
        temp_timer = startSeconds
        const formattedTimestamp = formatTimestamp(previous_timer + temp_timer);

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
  };

  const setRecorder : () => Promise<{microphone: MediaRecorder, stream: MediaStream} | null> = async () => {
    if (encoder === null)
      encoder = await connectWavEncoder();
    const _userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    generateNewSessionId();

    const mediaRecorder = new MediaRecorder(_userMedia, {
      mimeType: 'audio/wav',
    });

    mediaRecorder.onstart = () => {
      setMicOpen(true);
      if (started === false)
        chunks.current = [];
      started = true
      console.log("useRecordVoice.js - MediaRecorder started");
      setupDeepgramConnection();
    };



    mediaRecorder.ondataavailable = (e) => {
      add(e.data);
      chunks.current.push(e.data);
    };

    return {
      microphone: mediaRecorder as MediaRecorder,
      stream: _userMedia as MediaStream
    }
  }

  const startRecording = useCallback(async () => {
    setRecorder().then((response) => {
      if (response === null) {
        return
      }
      setUserMedia(response.stream);
      setMicrophone(response.microphone);
      console.log(microphone)
      response.microphone.start(500);
    })
  }, [connection, microphone, userMedia]);

  const pauseRecording = useCallback(() => {
    if (microphone && userMedia && microphone.state === "recording") {
      microphone.pause();
      // const keepAliveInterval = () => setInterval(() => {
      //   if (listening) {
      //     const silentBuffer = new ArrayBuffer(1024);
      //     connection?.send(silentBuffer);
      //     console.log("sending silent audio data");
      //   }
      //   keepAliveInterval()
      // }, 2000);
      console.log("pausing", connected, connection)
    }
  }, [microphone, userMedia]);

  const resumeRecording = useCallback(() => {
    startRecording().then(() => console.log("resuming recording"))
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
        const buffer = await wavBlob.arrayBuffer()

        const mp3 = await fetch("/api/compressMp3", {
          method: "POST",
          body: buffer,
        }).then(r => r.arrayBuffer())

        const mp3Blob = new Blob([mp3])

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

        if (!uploadResult?.success)
          return

        setAudioFileUrl(uploadResult.fileUrl);
        debugger
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

        if (!summary)
          return
        let _summary = await summarize(summary)

        _summary = _summary?.choices[0]?.message?.content

        _summary = stringToPlate(_summary)

        _summary = JSON.stringify(_summary)

        setSummarizationResult(_summary);
        setSummaryNote(_summary);

        await updateDocument({
          id: documentId,
          content: JSON.stringify(utterances),
          summarizationResult: _summary,
          summaryNote: _summary,
        });
        setIsTranscribed(true);
        setisDisabledRecordButton(false);

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

        if (listening) {
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
  }, [connection, queue, remove, first, size, isProcessing, listening]);

  return {
    micOpen,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
};
