'use client'

import {createContext, FC, ReactNode, useState} from "react";
import {Doc} from "@/convex/_generated/dataModel";

export interface IGeneralContext {
  current: Doc<"documents"> | null
  setCurrentNote: (current: Doc<"documents">) => void

  summary: string | null,

  setSummary: (summary: string) => void

  documentId: string | null

  setDocumentId: (doc: string) => void

  editorBridge: string | null
  setEditorBridge: (value: string) => void

}
export const GeneralContext = createContext<IGeneralContext | null>(null)

const ContextProvider: FC<{children: ReactNode}> = ({children}) => {
  const [current, setCurrent] = useState<Doc<"documents"> | null>(null)
  const [summary, setSummaryState] = useState<string | null>(null)
  const [documentId, setDocument] = useState<string | null>(null)
  const [bridge, setBridge] = useState<string | null>(null)

  const setCurrentNote = (_note: Doc<"documents">) => {
    setCurrent(_note);
  }

  const setEditorBridge = (value: string) => {
    setBridge(value)
  }

  const setDocumentId = (doc: string) => {
    console.log(doc)
    setDocument(doc)
  }
  const setSummary = (summary: string) => {
    setSummaryState(summary)
  }
  return <GeneralContext.Provider value={
    {
      editorBridge: bridge,
      setEditorBridge,
      setDocumentId,
      documentId,
      current,
      setCurrentNote,
      summary,
      setSummary
    }
  }>
            {children}
        </GeneralContext.Provider>
}

export default ContextProvider;
