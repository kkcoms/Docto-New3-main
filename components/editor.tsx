"use client";
import React, {ChangeEvent, useCallback, useContext, useEffect} from "react";
import { useTheme } from "next-themes";
import {
  BlockNoteView,
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote
} from "@blocknote/react";
import "@blocknote/core/style.css";
import { useEdgeStore } from "@/lib/edgestore";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";
import {IGeneralContext, GeneralContext} from "@/context/context";
import {Value} from "@udecode/plate-common";
import {BlockNoteEditor, PartialBlock} from "@blocknote/core";
import usePlateSerializer from "@/hooks/use-plate-serializer";
import "@blocknote/react/style.css";
import {difference} from "lodash";
import {useBridge} from "@/hooks/use-bridge";
import {BridgeContext, IBridgeContext} from "@/context/bridgeContext";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

function insertHelloWorldItem(editor: BlockNoteEditor) {
  return undefined;
}

const getCustomSlashMenuItems = (
  editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
];
const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();

  const {plateToBlock, blocksToPlate} = usePlateSerializer()

  const { bridgeA, updateB, updateA } = useContext(BridgeContext) as IBridgeContext

  const setBridge = useBridge("B")

  const editor = useCreateBlockNote();

  let update = true
  useEffect(() => {
    // console.log("B:", bridgeA, updateB, updateA)
    // if (!bridgeA || !updateA)
    //   return
    //
    // const _data : Value = JSON.parse(bridgeA as string)
    // const deserialized = plateToBlock(_data)
    //
    // editor.replaceBlocks(editor.document, deserialized)
    // setTimeout(() => {
    //   update = false
    // }, 300)
  }, [bridgeA])

  editor.onChange(() => {

    const blocks = blocksToPlate(editor.document)
    const data = JSON.stringify(blocks)
    setBridge(data)
  })

  return (
    <div>
      <BlockNoteView editor={editor}
                     onChange={async () => {
                       const markdown = await editor.blocksToMarkdownLossy()
                     }}
                     theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default Editor;
