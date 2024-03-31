"use client";
import { ElementRef, useRef, useState, useEffect } from "react";
import { ImageIcon, Smile, Calendar, TimerIcon } from "lucide-react";
import { useMutation } from "convex/react";
import TextareaAutosize from "react-textarea-autosize";
import { useCoverImage } from "@/hooks/use-cover-image";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { IconPicker } from "./icon-picker";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);
  const [isHovering, setIsHovering] = useState(false);
  const update = useMutation(api.documents.update);
  const removeIcon = useMutation(api.documents.removeIcon);

  // State to hold the note creation date and time
  const noteCreationDateTime = initialData.noteCreationDateTime
    ? new Date(initialData.noteCreationDateTime)
    : null;

  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) return;
    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    setValue(value);
    update({ id: initialData._id, title: value || "Name your note" });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    update({ id: initialData._id, icon });
  };

  const onRemoveIcon = () => {
    removeIcon({ id: initialData._id });
  };


return (
  <div
    className="relative"
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
  >
    <div
      className={`hidden md:flex md:flex-row md:items-center gap-x-1 gap-y-2 py-4 transition-opacity ${
        isHovering ? "opacity-100" : "opacity-0"
      }`}
    >
      <IconPicker asChild onChange={onIconSelect}>
        <Button
          className="text-muted-foreground text-sm"
          variant="outline"
          size="sm"
        >
          <Smile className="h-4 w-4 mr-2" />
          Add icon
        </Button>
      </IconPicker>
      <Button
        onClick={coverImage.onOpen}
        className="text-muted-foreground text-sm"
        variant="outline"
        size="sm"
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Add cover
      </Button>
    </div>
    {isEditing && !preview ? (
      <TextareaAutosize
        ref={inputRef}
        onBlur={disableInput}
        onKeyDown={onKeyDown}
        value={value}
        onChange={(e) => onInput(e.target.value)}
        className="text-3xl md:text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
      />
    ) : (
      <div
        onClick={enableInput}
        className="flex flex-col md:flex-row md:items-center gap-x-[32px] gap-y-2 pb-[11.5px] text-3xl md:text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
      >
        {initialData.title && <div className="mb-1">{initialData.title}</div>}
        {noteCreationDateTime && (
          <div className="flex flex-row items-center text-xs md:text-sm text-gray-500 dark:text-[#CFCFCF]">
            <Calendar className="h-4 w-4 mr-2" />
            Created on: {noteCreationDateTime.toLocaleDateString()} at{" "}
            {noteCreationDateTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        )}
        {noteCreationDateTime && (
          <div className="flex flex-row items-center text-xs md:text-sm text-gray-500 dark:text-[#CFCFCF]">
            <TimerIcon className="h-4 w-4 mr-2" />
            {/* 24:13 */}
          </div>
        )}
      </div>
    )}
  </div>
);
}
