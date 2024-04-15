"use client";
import React, { useContext, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BlockNoteView,
  useCreateBlockNote
} from "@blocknote/react";
import "@blocknote/core/style.css";
import { Value } from "@udecode/plate-common";
import {Block, BlockIdentifier, BlockNoteEditor, PartialBlock} from "@blocknote/core";
import usePlateSerializer from "@/hooks/use-plate-serializer";
import "@blocknote/react/style.css";
import { useBridge } from "@/hooks/use-bridge";
import { BridgeContext, IBridgeContext } from "@/context/bridgeContext";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";
import useUpdateSummary from "@/hooks/use-update-summary";
import {GeneralContext, IGeneralContext} from "@/context/context";

interface EditorProps {
  editable?: boolean;
}

const Editor = ({ editable = true }: EditorProps) => {
  const { resolvedTheme } = useTheme();

  const {
    summarizationResult, transcriptionCompleted
  } = useContext(TranscriptionContext);

  const { documentId } = useContext(GeneralContext) as IGeneralContext

  const { plateToBlock, blocksToPlate } = usePlateSerializer()

  const { updateSummarizationResult } = useUpdateSummary(documentId as string)

  const getSummaryData = () => {
    const initial : any = summarizationResult ? JSON.parse(summarizationResult) : undefined

    let initialData : Block[] | undefined = plateToBlock(initial)

    if (Array.isArray(initialData) && initialData.length === 0)
      initialData = undefined

    return initialData
  }

  const initial = getSummaryData()

  const editor = useCreateBlockNote({ initialContent: initial });

  useEffect(() => {
    if (!summarizationResult || !transcriptionCompleted)
      return

    const data = getSummaryData()
    if (data)
      editor.replaceBlocks(editor.document, data)

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
