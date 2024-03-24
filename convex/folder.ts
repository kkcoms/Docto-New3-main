import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

import { mutationWithUser } from "./utils";


// to create folders

export const create = mutation({
    args: {
      title: v.string(),  
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const userId = identity.subject;
  
      const folder = await ctx.db.insert("folder", {
        title: args.title,
        userId,
      });
  
      return folder
    }
  });


// to retrieve all folders on sidebar

export const getAllFolders = query({
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
          }
      
        const userId = identity.subject;

        const folders = await ctx.db
            .query("folder")
            .withIndex("by_user", (q) =>
                q
                .eq("userId", userId)
            )
            .order("desc")
            .collect();

            return folders
    },
})

// delete the folder

export const deleteFolder = mutation({
    args: {
      folderId:v.id("folder"),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
      const deletefolder = await ctx.db.delete(args.folderId);
  
      return 
    }
  });


// update folder title

// update note title 

export const updateTitleFolder = mutation({
    args: {
      folderId:v.id("folder"),
      title:v.string()
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
      const movenote = await ctx.db.patch(args.folderId, {title:args.title});
  
      return 
    }
  });

