// Microphone.tsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { useRecordVoice } from "@/app/(speech)/hooks/useRecordVoice";
import { IconMicrophone } from "@/app/(speech)/app/components/IconMicrophone";
import TranscriptionContext from "./TranscriptionContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import SummarizationComponent from "./SummarizationComponent";
import { RecordingBanner } from "./RecordingBanner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import ProcessingModal from "./ProcessingModal";

interface MicrophoneProps {
  documentId: Id<"documents">; // Assuming documentId is a string. Adjust the type as necessary.
}
const Microphone: React.FC<MicrophoneProps> = ({ documentId }) => {
  const [, setSummarizationResult] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Add state for processing

  const {
    finalTranscription,
    setLiveTranscription,
    setFinalTranscription,
    generateNewSessionId,
    clearFinalTranscriptions,
    isDisabledRecordButton,
  } = useContext(TranscriptionContext);

  const {
    micOpen,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useRecordVoice(documentId, setFinalTranscription);

  const handleStartRecording = () => {
    setIsRecording(true);
    clearFinalTranscriptions(); // Clear and start listening again
    generateNewSessionId(); // Generate a new session ID for each new recording
    startRecording();
    setFinalTranscription(null); // Clear the final transcription
  };

  const handlePauseRecording = () => {
    setIsPaused(true);
    pauseRecording();
  };

  const handleResumeRecording = () => {
    setIsPaused(false);
    resumeRecording();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    stopRecording();
    setLiveTranscription(null);
    setFinalTranscription(null); // Clear the final transcription
    setIsProcessing(true); // Set processing state to true when recording stops
  };

  useEffect(() => {
    if (finalTranscription) {
      setIsProcessing(false); // Set processing state to false when finalTranscription is available
    }
  }, [finalTranscription]);

  const handleCloseProcessingModal = () => {
    setIsProcessing(false);
  };

  const buttonClass = `cursor-not-allowed record-button fixed  bottom-[60px] transform  w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer z-50 ${
    isRecording
      ? isPaused
        ? "bg-gray-400" // Muted background color when paused
        : "bg-red-500 animate-smooth-pulse" // Pulsing animation when recording is active
      : isDisabledRecordButton
      ? "bg-slate-300 dark:bg-slate-600"
      : "bg-[#1EAFB3] dark:bg-[#1EAFB3] animate-smooth-pulse" // Pulsing animation when not recording
  }`;

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes gentlePulse {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateX(-50%) scale(1.05);
              opacity: 0.9;
            }
            100% {
              transform: translateX(-50%) scale(1);
              opacity: 1;
            }
          }

          .visuallyHidden {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: -1px;
            padding: 0;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
          }
        `}
      </style>
      <RecordingBanner isRecording={isRecording} isPaused={isPaused} />
      <div className="fixed left-1/2 bottom-[60px] transform -translate-x-1/2 flex items-center justify-center w-full">
        <div className="flex items-center justify-center">
          {isRecording && !isPaused && (
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400 transition duration-300 ease-in-out flex items-center justify-center w-12 h-12"
              style={{ transform: "translateY(-60px) translateX(-110px)" }}
              onClick={handlePauseRecording}
            >
              <FontAwesomeIcon icon={faPause} />
            </button>
          )}
          <button
            className={buttonClass}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isDisabledRecordButton}
          >
            <ProcessingModal
              isVisible={isProcessing}
              onClose={handleCloseProcessingModal}/>
            <IconMicrophone />
          </button>
          {isRecording && isPaused && (
            <button
              className="bg-[#1EAFB3] text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-[#17a2a9] transition duration-300 ease-in-out flex items-center justify-center w-12 h-12"
              style={{ transform: "translateY(-60px) translateX(110px)" }}
              onClick={handleResumeRecording}
            >
              <FontAwesomeIcon icon={faPlay} />
            </button>
          )}
        </div>
      </div>
      <div className="visuallyHidden">
        <SummarizationComponent
          documentId={documentId}
          finalTranscription={finalTranscription}
        />
      </div>
    </>
  );
};

export { Microphone };