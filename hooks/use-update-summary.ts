import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {Id} from "@/convex/_generated/dataModel";

type UseUpdateSummary = (text: string) => void

function characterDifference(str1: string, str2: string) {
  const difference = Math.abs(str1.length - str2.length);
  return difference;
}
const useUpdateSummary = (id: string) : UseUpdateSummary => {
  let cached : string = ""
  const updateDocument = useMutation(api.documents.update);
  return async (text) => {
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
}

export default useUpdateSummary
