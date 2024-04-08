import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

export const addOrUpdate = mutation({
  args: {
    documentId: v.id("documents"),
    data: v.string()
  },
  handler: async (ctx, { documentId, data }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.query("comments")
      .filter(q => q.eq(q.field("documentId"), documentId))
      .first()

    if (comment) {
      await ctx.db.patch(comment._id, { data: data})
      return
    }

    await ctx.db.insert("comments", {
      documentId: documentId,
      data: data
    })
  }
})

export const getById = query({
  args: {
    documentId: v.id("documents")
  },
  handler: async (ctx, { documentId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.query("comments")
      .filter(q => q.eq(q.field("documentId"), documentId))
      .first()

    return comment
  }
})
