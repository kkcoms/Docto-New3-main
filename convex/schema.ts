//schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    actionPoints: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    noteCreationDateTime: v.optional(v.string()), // Add this line
    summarizationResult: v.optional(v.string()), // Add this line for summary
    summaryNote: v.optional(v.string()),
    audioFileRef: v.optional(v.string()), // Add this line for the audio file reference
    audioFileUrl: v.optional(v.string()),
    folderId: v.optional(v.string()),
  })
  .index("by_user", ["userId"])
  .index("by_user_parent", ["userId", "parentDocument"])
  .index("by_user_folder", ["userId", "folderId"]),
  comments: defineTable({
    documentId: v.id("documents"),
    data: v.string()
  }).index("by_document",["documentId"])

  ,
  folder: defineTable({
    title: v.string(),
    coverimage:v.optional(v.string()),
    description:v.optional(v.string()),
    userId: v.string(),
  }).index("by_user", ["userId"])
});
