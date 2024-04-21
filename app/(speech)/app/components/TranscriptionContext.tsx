//TranscriptionContext.tsx
import {ActionPoint, Transcription} from "@/app/types";
import React, { createContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

interface TranscriptionContextType {
  liveTranscription: Transcription | null;
  setLiveTranscription: (transcription: Transcription | null) => void;
  finalTranscriptions: Transcription[];
  addFinalTranscription: (transcription: Transcription) => void;
  clearFinalTranscriptions: () => void;
  finalTranscription: Transcription | null;
  setFinalTranscription: (transcription: Transcription | null) => void;
  summarizationResult: string; // Added summarizationResult property
  setSummarizationResult: (result: string) => void; // Added setSummarizationResult method
  actionPoints: ActionPoint[]
  setActionPoints: (value: ActionPoint[]) => void
  summaryNote: string;
  setSummaryNote: (note: string) => void;
  generateNewSessionId: () => void;
  currentSessionId: string;
  isTranscribed: boolean;
  setIsTranscribed: (isTranscribed: boolean) => void;
  audioFileUrl: string;
  setAudioFileUrl: (url: string) => void;
  audioCurrentTime: number;
  setAudioCurrentTime: (time: number) => void;
  isDisabledRecordButton: boolean;
  setisDisabledRecordButton: (isDisabledRecordButton: boolean) => void;

  transcriptionCompleted: boolean

  setTranscriptionCompleted: (value: boolean) => void
}

const defaultState: TranscriptionContextType = {
  liveTranscription: null,
  setLiveTranscription: () => { },
  finalTranscriptions: [],
  addFinalTranscription: () => { },
  clearFinalTranscriptions: () => { },
  finalTranscription: null,
  setFinalTranscription: () => { },
  summarizationResult: "", // Added default value for summarizationResult
  setSummarizationResult: () => {}, // Added default value for setSummarizationResult
  summaryNote: "", // Added default value for summarizationResult
  setSummaryNote: () => {}, // Added default value for setSummarizationResult
  generateNewSessionId: () => {},
  currentSessionId: "",
  isTranscribed: false,
  setIsTranscribed: () => { },
  audioFileUrl: "",
  setAudioFileUrl: () => { },
  audioCurrentTime: 0,
  setAudioCurrentTime: () => { },
  isDisabledRecordButton: false,
  setisDisabledRecordButton: () => { },
  transcriptionCompleted: false,
  setTranscriptionCompleted: () => {},
  actionPoints: [],
  setActionPoints: (value) => {}
};

const TranscriptionContext =
  createContext<TranscriptionContextType>(defaultState);

export const TranscriptionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [liveTranscription, setLiveTranscription] =
    useState<Transcription | null>(null);
  const [finalTranscriptions, setFinalTranscriptions] = useState<
    Transcription[]
  >([]);
  const [finalTranscription, setFinalTranscription] =
    useState<Transcription | null>(null);
  const [summarizationResult, setSummarizationResult] = useState(""); // Added summarizationResult state
  const [summaryNote, setSummaryNote] = useState(""); // Added summarizationResult state
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [audioFileUrl, setAudioFileUrl] = useState("");
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isDisabledRecordButton, setisDisabledRecordButton] = useState(false);
  const [transcriptionCompleted, setTranscriptionCompleted] = useState(false)
  const [actionPoints, setActionPoints] = useState<ActionPoint[]>([])

  const generateNewSessionId = () => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
  };

  const addFinalTranscription = (transcription: Transcription) => {
    setFinalTranscriptions((transcriptions) => [
      ...transcriptions,
      transcription,
    ]);
  };

  const clearFinalTranscriptions = () => {
    setFinalTranscriptions([]);
  }

  const contextValue = {
    liveTranscription,
    setLiveTranscription,
    finalTranscriptions,
    addFinalTranscription,
    clearFinalTranscriptions,
    finalTranscription,
    setFinalTranscription,
    summarizationResult, // Added summarizationResult to contextValue
    setSummarizationResult, // Added setSummarizationResult to contextValue
    summaryNote,
    setSummaryNote,
    generateNewSessionId,
    currentSessionId,
    setIsTranscribed,
    isTranscribed,
    audioFileUrl,
    setAudioFileUrl,
    audioCurrentTime,
    setAudioCurrentTime,
    setisDisabledRecordButton,
    isDisabledRecordButton,
    transcriptionCompleted,
    setTranscriptionCompleted,
    actionPoints,
    setActionPoints
  };

  return (
    <TranscriptionContext.Provider value={contextValue}>
      {children}
    </TranscriptionContext.Provider>
  );
};

export default TranscriptionContext;
