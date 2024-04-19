"use client";
import React, {useContext, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BlockNoteView,
  useCreateBlockNote
} from "@blocknote/react";
import "@blocknote/core/style.css";
import { Block } from "@blocknote/core";
import usePlateSerializer from "@/hooks/use-plate-serializer";
import "@blocknote/react/style.css";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";
import useUpdateSummary from "@/hooks/use-update-summary";
import {GeneralContext, IGeneralContext} from "@/context/context";

interface EditorProps {
  editable?: boolean;
}

const Editor = ({ editable = true }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const {
    summarizationResult
  } = useContext(TranscriptionContext);

  const { documentId } = useContext(GeneralContext) as IGeneralContext

  const { plateToBlock, blocksToPlate } = usePlateSerializer()

  const { updateSummarizationResult } = useUpdateSummary(documentId as string)

  const getSummaryData = (data: string | undefined) => {
    const initial : any = data ? JSON.parse(data) : undefined

    let initialData : Block[] | undefined = plateToBlock(initial)

    if (Array.isArray(initialData) && initialData.length === 0)
      initialData = undefined

    return initialData
  }

  const editor = useCreateBlockNote();

  useEffect(() => {
    setTimeout(() => {
      const data = getSummaryData(summarizationResult)
      editor.replaceBlocks(editor.document, data ? data : [])
    }, 100)

  }, [summarizationResult])

  editor.onChange(() => {
    if (editor.isFocused() === false)
      return

    const blocks = blocksToPlate(editor.document)
    const data = JSON.stringify(blocks)

    updateSummarizationResult(data);
  })

  return (
    <div>
      <BlockNoteView editor={editor}
                     editable={editable}
                     theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default Editor;
