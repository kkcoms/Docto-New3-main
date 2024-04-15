import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {Id} from "@/convex/_generated/dataModel";
import {useContext} from "react";
import {GeneralContext, IGeneralContext} from "@/context/context";

type UseUpdateSummary = {
  updateSummaryNote: (text: string) => void
  updateSummarizationResult: (text: string) => void

  updateNote: (text: string) => void
}

function characterDifference(str1: string, str2: string) {
  const difference = Math.abs(str1.length - str2.length);
  return difference;
}
const useUpdateSummary = (id: string) : UseUpdateSummary => {
  let cached : string = ""
  let summaryCache = ""
  let noteCache = ""
  const updateDocument = useMutation(api.documents.update);

  const updateSummaryNote = async (text: string) => {

    const difference = characterDifference(text, noteCache)

    if (difference < 5)
      return

    console.log("updated!")
    noteCache = text

    await updateDocument({
      id: id as Id<"documents">,
      summaryNote: text,
    })

  }

  const updateSummarizationResult = async (text: string) => {
    console.log("summarization!")
    const difference = characterDifference(text, summaryCache)

    if (difference < 5)
      return

    console.log("updated!")
    summaryCache = text

    await updateDocument({
      id: id as Id<"documents">,
      summarizationResult: text,
    })

  }

  const updateNote =  async (text: string) => {

    const difference = characterDifference(text, cached)

    if (difference < 5)
      return

    console.log("updated!")
    cached = text

    await updateDocument({
      id: id as Id<"documents">,
      summaryNote: text,
      summarizationResult: text,
    })
  }

  return {
    updateNote,
    updateSummarizationResult,
    updateSummaryNote
  }
}

export default useUpdateSummary
