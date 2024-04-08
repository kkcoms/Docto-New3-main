'use client';

import React, {useEffect} from 'react';
import { cn } from '@udecode/cn';
import {
  CommentNewSubmitButton,
  CommentNewTextarea,
  useCommentsSelectors,
} from '@udecode/plate-comments';

import { buttonVariants } from './button';
import { CommentAvatar } from './comment-avatar';
import { inputVariants } from './input';
import {api} from "@/convex/_generated/api";
import {useMutation} from "convex/react";
import {Id} from "@/convex/_generated/dataModel";

export function CommentCreateForm() {
  const myUserId = useCommentsSelectors().myUserId();

  const updateNoteComments = useMutation(api.comments.addOrUpdate)

  const comment = useCommentsSelectors().comments()


  useEffect(() => {
    if (comment)
      updateNoteComments({
        documentId: "j57dwjdcrddbc5z8hxjdfae21d6pjyn5" as Id<"documents">,
        data: JSON.stringify(comment)
      }).then(resp => console.log("UPDATED!", resp))
  }, [comment])

  return (
    <div className="flex w-full space-x-2">
      <CommentAvatar userId={myUserId} />

      <div className="flex grow flex-col items-end gap-2">
        <CommentNewTextarea className={inputVariants()} />

        <CommentNewSubmitButton
          className={cn(buttonVariants({ size: 'sm' }), 'w-[90px]')}
        >
          Comment
        </CommentNewSubmitButton>
      </div>
    </div>
  );
}
