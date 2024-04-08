'use client'

import {createContext, FC, ReactNode, useState} from "react";
import {Doc} from "@/convex/_generated/dataModel";

export interface INotesContext {
  current: Doc<"documents"> | null
  setCurrentNote: (current: Doc<"documents">) => void

  summary: string | null,

  setSummary: (summary: string) => void
}
export const NotesContext = createContext<INotesContext | null>(null)

const ContextProvider: FC<{children: ReactNode}> = ({children}) => {
  const [current, setCurrent] = useState<Doc<"documents"> | null>(null)
  const [summary, setSummaryState] = useState<string | null>(null)

  const setCurrentNote = (_note: Doc<"documents">) => {
    setCurrent(_note);
  }
  const setSummary = (summary: string) => {
    setSummaryState(summary)
  }
  return <NotesContext.Provider value={{current, setCurrentNote, summary, setSummary}}>
            {children}
        </NotesContext.Provider>
}

export default ContextProvider;
