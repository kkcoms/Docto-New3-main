// //whisper.ts
// ('use node');

// import { internalAction, internalMutation } from './_generated/server';
// import { v } from 'convex/values';
// import Replicate from 'replicate';
// import { api, internal } from './_generated/api';



// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_KEY,
// });

// interface WhisperChunk {
//   text: string;
//   timestamp: [number, number]; // Adjusted to match the JSON output
// }

// interface WhisperOutput {
//   chunks: WhisperChunk[];
//   text: string;
// }

// export const chat = internalAction({
//   args: {
//     fileUrl: v.string(),
//     id: v.id('notes'),
//   },
//   handler: async (ctx, args) => {
//     const replicateOutput = await replicate.run(
//       'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c',
//       {
//         input: {
//           audio: args.fileUrl,
//           task: "transcribe",
//           language: "None",
//           timestamp: "chunk",
//           batch_size: 64,
//           diarise_audio: false
//         },
//       },
//     ) as WhisperOutput;

//     let transcriptWithTimestamps = '';
//     replicateOutput.chunks.forEach((chunk) => {
//       const [start, end] = chunk.timestamp.map(t => Math.round(t));
//       // Convert timestamps to minutes:seconds format
//       const startTime = `${Math.floor(start / 60).toString().padStart(2, '0')}:${(start % 60).toString().padStart(2, '0')}`;
//       const endTime = `${Math.floor(end / 60).toString().padStart(2, '0')}:${(end % 60).toString().padStart(2, '0')}`;
//       // Format the timestamps and insert two line breaks after each chunk
//       transcriptWithTimestamps += `${startTime}-${endTime}\n${chunk.text}\n\n`; // Added two '\n' for double line breaks
//     });

//     await ctx.runMutation(internal.whisper.saveTranscript, {
//       id: args.id,
//       transcript: transcriptWithTimestamps.trim() || 'error', // Trim any trailing space or new lines
//     });
//   },
// });


// export const saveTranscript = internalMutation({
//   args: {
//     id: v.id('notes'),
//     transcript: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const { id, transcript } = args;

//     await ctx.db.patch(id, {
//       transcription: transcript,
//       generatingTranscript: false,
//     });

//     await ctx.scheduler.runAfter(0, internal.together.chat, {
//       id: args.id,
//       transcript,
//     });

//     await ctx.scheduler.runAfter(0, internal.together.embed, {
//       id: args.id,
//       transcript: transcript,
//     });
//   },
// });
