// SummarizationComponent.tsx
import React from "react";
import { Transcription } from "@/app/types";

interface SummarizationComponentProps {
  documentId?: string;
  finalTranscription: Transcription | null;
}

const SummarizationComponent: React.FC<SummarizationComponentProps> = ({
  documentId,
  finalTranscription,
}) => {
  return <div />;
};

export default SummarizationComponent;


// // SummarizationComponent.tsx
// import React, { useState, useEffect } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import TranscriptionContext from "./TranscriptionContext";
// import { Transcription } from "@/app/types";

// interface SummarizationComponentProps {
//   documentId?: string;
//   finalTranscription: Transcription | null;
// }

// const SummarizationComponent: React.FC<SummarizationComponentProps> = ({
//   documentId,
//   finalTranscription,
// }) => {
//   const [summarizationResult, setSummarizationResult] = useState("");
//   const saveSummaryNote = useMutation(
//     api.documents.saveSummaryNote
//   );

//   useEffect(() => {
//     const sendTranscriptionForSummarization = async () => {
//       if (
//         finalTranscription &&
//         finalTranscription.transcript.trim().length > 0
//       ) {
//         try {
//           const response = await fetch("/api/summarize", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               messages: [{ content: finalTranscription.transcript }],
//             }),
//           });
//           if (!response.ok) throw new Error("Network response was not ok");
//           const data = await response.json();
//           // console.log('Summarization result:', data);
//           setSummarizationResult(data); // Update the summarization result
//           if (documentId) {
//             saveSummaryNote({
//               id: documentId as Id<"documents">,
//               summaryNote: data.data,
//             });
//           }
//         } catch (error) {
//           console.error(
//             "Error sending transcription for summarization:",
//             error
//           );
//         }
//       }
//     };

//     sendTranscriptionForSummarization();
//   }, [finalTranscription, documentId]);

//   // console.log("Summarization result:", summarizationResult);
//   return <div />;
// };

// export default SummarizationComponent;
