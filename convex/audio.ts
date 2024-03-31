"use node";

import {action} from "./_generated/server";
import {v} from "convex/values";
import {api} from "./_generated/api";
import {Id} from "./_generated/dataModel";
import lamejs from "@breezystack/lamejs";

export const uploadNoteAudio = action({
  args: {data: v.bytes(), documentId: v.string()},
  handler: async (ctx, args) => {
    try {
      const { data, documentId } = args

      const mp3Data = wavToMP3(data)

      const uploadUrl = await ctx.storage.generateUploadUrl()

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "audio/mp3" },
        body: mp3Data,
      }).then(response => response.json());

      const upload : any = await ctx.runMutation(api.documents.updateNoteWithAudio, {
        noteId: documentId as Id<"documents">,
        audioFileRef: result.storageId,
        storageId: result.storageId,
      })

      return upload
    } catch {
      return null
    }
  }
})

const wavToMP3 = (data: ArrayBuffer) => {

  const wavDecoder = (lamejs.WavHeader as any).readHeader(new DataView(data));
  const wavSamplesLength = (data.byteLength - wavDecoder.dataOffset) / 2;
  const wavSamples = new Int16Array(data, wavDecoder.dataOffset, wavSamplesLength);
  const mp3Encoder = new lamejs.Mp3Encoder(wavDecoder.channels, wavDecoder.sampleRate, 128);
  const mp3Buffer = mp3Encoder.encodeBuffer(wavSamples);
  const mp3Data = mp3Encoder.flush();
  const mp3BufferWithHeader = new Uint8Array(mp3Buffer.length + mp3Data.length);
  mp3BufferWithHeader.set(mp3Buffer, 0);
  mp3BufferWithHeader.set(mp3Data, mp3Buffer.length);
  const mp3Blob = new Blob([mp3BufferWithHeader], { type: 'audio/mp3' });

  return mp3Blob
}
