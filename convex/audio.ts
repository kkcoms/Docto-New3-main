"use node";

import {action} from "./_generated/server";
import {v} from "convex/values";
import {api} from "./_generated/api";
import {Id} from "./_generated/dataModel";

export const uploadNoteAudio = action({
  args: {data: v.bytes(), documentId: v.string()},
  handler: async (ctx, args) => {
    const { data, documentId } = args

    const mp3Data = await ctx.runAction(api.audioUtil.wavToMP3, {
      data: data
    })

    const uploadUrl = await ctx.storage.generateUploadUrl()

    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "audio/mp3" },
      body: mp3Data,
    }).then(response => response.json());

    const upload : any = await ctx.runMutation(api.documents.updateNoteWithAudio, {
      noteId: documentId as Id<"documents">,
      audioFileRef: result.storageId,
      storageId: result.storageId,
    })

    return upload
  }
})
