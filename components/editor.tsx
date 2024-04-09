"use client";
import React, { useContext, useEffect } from "react";
import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { useEdgeStore } from "@/lib/edgestore";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";
import {INotesContext, NotesContext} from "@/context/context";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const { currentSessionId } = useContext(TranscriptionContext);

  let initialBlocks: PartialBlock[] | undefined;
  let isError = false;

  const { summary } = useContext(NotesContext) as INotesContext

  const editor = useBlockNote({
    editable,
    onEditorContentChange: (editor) => {
      console.log(editor.topLevelBlocks)
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: async (file: File) => {
      const response = await edgestore.publicFiles.upload({ file });
      return response.url;
    },
  });


  return (
    <div>
      <BlockNoteView editor={editor} theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default Editor;
