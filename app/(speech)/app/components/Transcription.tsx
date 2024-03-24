"use client";
import React, { useContext, useEffect } from "react";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext"; // This is the corrected import path
import VoiceItem from "@/app/(main)/_components/voice-item";

const Transcription = () => {
  const { liveTranscription, finalTranscriptions, audioCurrentTime } =
    useContext(TranscriptionContext);

  return (
    <div className="flex flex-col gap-[16px]">
      {finalTranscriptions.map((transcription, index) => (
        <VoiceItem key={index} isSelected={transcription.start <= audioCurrentTime && transcription.end >= audioCurrentTime} transcription={transcription} />
      ))}
      {liveTranscription && <VoiceItem isSelected={false} transcription={liveTranscription} />}
    </div>
  );
};
export default Transcription;
