import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

import { mutationWithUser } from "./utils";

// create a note

export const create = mutation({
    args: {
      title: v.string(),
      folderId:v.optional(v.string())
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error("Not authenticated");
      }

      const userId = identity.subject;

      const document = await ctx.db.insert("documents", {
        title: args.title,
        userId,
        folderId: args.folderId,
        isArchived: false,
        isPublished: false,
      });
      return document;
    }
  });

  // get note by folderId


  export const getNotesById = query({
    args:{
        folderId:v.optional(v.string())
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
          }

        const userId = identity.subject;
        const folderId = args.folderId;

        const notes = await ctx.db
            .query("documents")
            .withIndex("by_user_folder", (q) =>
                q
                .eq("userId", userId)
                .eq("folderId", folderId)
            )
            .filter((q) =>
                q.eq(q.field("isArchived"), false)
            )
            .order("desc")
            .collect()

            return notes
    },
})


// delete note

export const deleteNote = mutation({
    args: {
      noteId:v.id("documents"),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error("Not authenticated");
      }
      const deletenote = await ctx.db.delete(args.noteId);

      return
    }
  });


// move note


export const moveNote = mutation({
    args: {
      noteId:v.id("documents"),
      folderId:v.id("folder"),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error("Not authenticated");
      }
      const movenote = await ctx.db.patch(args.noteId, {folderId:args.folderId});

      return
    }
  });


// update note title

export const updateTitleNote = mutation({
    args: {
      noteId:v.id("documents"),
      title:v.string()
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error("Not authenticated");
      }
      const movenote = await ctx.db.patch(args.noteId, {title:args.title});

      return
    }
  });


  export const updateNoteWithAudio = mutationWithUser({
    args: {
      noteId: v.id("documents"),
      audioFileRef: v.string(),
      storageId: v.id('_storage'),
    },
    handler: async (ctx, { noteId, audioFileRef, storageId }) => {
      let fileUrl = (await ctx.storage.getUrl(storageId)) as string;
      // Ensure the document is updated with both the reference and the URL
      await ctx.db.patch(noteId, { audioFileRef, audioFileUrl: fileUrl });
      console.log('fileUrl:', fileUrl);
      return { success: true, fileUrl };
    },
  });



  export const generateUploadUrl = mutationWithUser({
    args: {},
    handler: async (ctx) => {
      return await ctx.storage.generateUploadUrl();
    },
  });

  // update note

  export const update = mutation({
    args: {
      id: v.id("documents"),
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      icon: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error("Unauthenticated");
      }

      const userId = identity.subject;

      const { id, ...rest } = args;

      const existingDocument = await ctx.db.get(args.id);

      if (!existingDocument) {
        throw new Error("Not found");
      }

      if (existingDocument.userId !== userId) {
        throw new Error("Unauthorized");
      }

      const document = await ctx.db.patch(args.id, {
        ...rest,
      });

      return document;
    },
  });


  // remove Icon
  export const removeIcon = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error("Unauthenticated");
      }

      const userId = identity.subject;

      const existingDocument = await ctx.db.get(args.id);

      if (!existingDocument) {
        throw new Error("Not found");
      }

      if (existingDocument.userId !== userId) {
        throw new Error("Unauthorized");
      }

      const document = await ctx.db.patch(args.id, {
        icon: undefined
      });

      return document;
    }
  });


  // get note by Id

  export const getById = query({
    args: { noteId: v.id("documents") },
    handler: async (ctx, args) => {

      const identity = await ctx.auth.getUserIdentity();

      const document = await ctx.db.get(args.noteId);

      if (!document) {
        throw new Error("Not found");
      }

      if (document.isPublished && !document.isArchived) {
        return document;
      }

      if (!identity) {
        throw new Error("Not authenticated");
      }

      const userId = identity.subject;

      if (document.userId !== userId) {
        throw new Error("Unauthorized");
      }

      return document;
    }
  });

// notes in folder By Id

export const FolderNotes = query({
    args:{
        folderId:v.id("folder"),
        isArchived:v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
          throw new Error("Not authenticated");
        }
        const notes = await ctx.db.query('documents')
        .filter((q) => q.eq(q.field("folderId"), args.folderId))
        .filter((q) => q.eq(q.field("isArchived"), args.isArchived))
        .collect();

        return notes
    }
})
