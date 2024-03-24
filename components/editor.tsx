"use client";
import React, { useContext, useEffect } from "react";
import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { useEdgeStore } from "@/lib/edgestore";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";

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

  // Attempt to parse the initial content outside of the hook
  if (initialContent) {
    try {
      initialBlocks = JSON.parse(initialContent);
    } catch (error) {
      isError = true;
    }
  }

  const editor = useBlockNote({
    editable,
    initialContent: initialBlocks,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: async (file: File) => {
      const response = await edgestore.publicFiles.upload({ file });
      return response.url;
    },
  });

  // If there was an error parsing initialContent, handle it after the hook
// If there was an error parsing initialContent, handle it after the hook
useEffect(() => {
  const fetchBlocks = async () => {
    if (isError) {
      const transcriptionBlockId = `transcription-${currentSessionId}`;
      const arrayContent = initialContent?.split('\n');
      console.log('arrayContent', arrayContent);

      const blocksFromMarkdown = await editor.markdownToBlocks(arrayContent?.join('\n') || '');
      editor.insertBlocks(
        blocksFromMarkdown,
        editor.topLevelBlocks[editor.topLevelBlocks.length - 1] || null,
        "after"
      );
    }
  };

  fetchBlocks();
}, [editor, isError, initialContent, currentSessionId]);


  return (
    <div>
      <BlockNoteView editor={editor} theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default Editor;