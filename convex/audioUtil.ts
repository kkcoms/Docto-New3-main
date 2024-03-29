"use node";

import lamejs from "@breezystack/lamejs";
import {action} from "./_generated/server";
import {v} from "convex/values";
const fs = require("fs")

export const wavToMP3 = action({
  args: {data: v.bytes()},
  handler: async (ctx, {data}) => {
    let dataBlob = new Blob([data])

    const arrayBuffer = await fs.readFile(dataBlob);
    const wavDecoder = (lamejs.WavHeader as any).readHeader(new DataView(arrayBuffer.buffer));
    const wavSamplesLength = (arrayBuffer.byteLength - wavDecoder.dataOffset) / 2;
    const wavSamples = new Int16Array(arrayBuffer.buffer, wavDecoder.dataOffset, wavSamplesLength);
    const mp3Encoder = new lamejs.Mp3Encoder(wavDecoder.channels, wavDecoder.sampleRate, 128);
    const mp3Buffer = mp3Encoder.encodeBuffer(wavSamples);
    const mp3Data = mp3Encoder.flush();
    const mp3BufferWithHeader = new Uint8Array(mp3Buffer.length + mp3Data.length);
    mp3BufferWithHeader.set(mp3Buffer, 0);
    mp3BufferWithHeader.set(mp3Data, mp3Buffer.length);
    const mp3Blob = new Blob([mp3BufferWithHeader], { type: 'audio/mp3' });
    return mp3Blob;

  }
})
