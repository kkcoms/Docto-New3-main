import {NextRequest, NextResponse} from "next/server";
import lamejs from "@breezystack/lamejs";

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
export async function POST(req: NextRequest) {
  try {
    const buffer = await req.arrayBuffer();
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ",buffer)
    const mp3 = wavToMP3(buffer)

    const mp3Buffer = await mp3.arrayBuffer()
    return new Response(mp3Buffer, {status: 200})
  } catch (error) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>> err: ", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: error
    }, { status: 500 })
  }
}
