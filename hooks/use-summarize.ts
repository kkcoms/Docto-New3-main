import {useAction} from "convex/react";
import {api} from "@/convex/_generated/api";

const useSummarize = () => {
  const summarize = useAction(api.openAI.summarize)

  return async (text: string) => {
    const doSummary = await summarize({
      text: text
    })

    return doSummary
  }
}

export default useSummarize
