import { DeepgramClient, DeepgramError, createClient } from "@deepgram/sdk";
import { Languages } from "lucide-react";
import { NextResponse } from "next/server";

const model = {
  model: "nova-2-medical",
  // interim_results: true,
  smart_format: true,
  diarize: true,
  utterances: true,
  // punctuate: true,
  // summarize: 'v2',

};
export async function GET(request: Request) {
  // gotta use the request object to invalidate the cache every request :vomit:
  const url = request.url;

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  let { result: projectsResult, error: projectsError } =
    await deepgram.manage.getProjects();

  if (projectsError) {
    return NextResponse.json(projectsError);
  }

  const project = projectsResult?.projects[0];

  if (!project) {
    return NextResponse.json(
      new DeepgramError(
        "Cannot find a Deepgram project. Please create a project first."
      )
    );
  }

  let { result: newKeyResult, error: newKeyError } =
    await deepgram.manage.createProjectKey(project.project_id, {
      comment: "Temporary API key",
      scopes: ["usage:write"],
      tags: ["next.js"],
      time_to_live_in_seconds: 10,
    });

  if (newKeyError) {
    return NextResponse.json(newKeyError);
  }

  return NextResponse.json({ ...newKeyResult, url });
}

export async function POST(request: Request) {
   // transcribe Remote file and Summarize
  
  const body = await request.json();
  const {url} = body;
  console.log('received request for ', url);
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  const {result, error} = await transcribeUrl(deepgram, url)

  if(error)
      return NextResponse.json(error.message);
  else
      return NextResponse.json(result);
}

const transcribeUrl = async (deepgram: DeepgramClient, fileUrl: string) => {

    console.log('getting utterance result')
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        { url: fileUrl },
        model,
    );

    if (error) {
        console.error(error);
    } else {
        console.dir(result, {depth: null});
    }

    return {result, error}
}