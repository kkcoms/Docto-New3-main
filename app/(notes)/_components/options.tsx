import React, { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/confirm-modal";

const Options = React.memo(function Options({
  folder = true,
  folderId,
  deleteOptions = false,
  showOption = false,
  note = true,
  noteId,
}: {
  folder?: boolean;
  folderId?: Id<"folder">;
  deleteOptions?: boolean;
  showOption: boolean;
  note?: boolean;
  noteId?: Id<"documents">;
}) {
  const router = useRouter();
  const params = useParams();
  const folders = useQuery(api.folder.getAllFolders, {});
  const createfolder = useMutation(api.folder.create);
  const createnote = useMutation(api.note.create);
  const deletefolder = useMutation(api.folder.deleteFolder);
  const deletenote = useMutation(api.note.deleteNote);
  const archive = useMutation(api.documents.archive);
  const movenote = useMutation(api.note.moveNote);
  const updatefoldertitle = useMutation(api.folder.updateTitleFolder);
  const updatenotetitle = useMutation(api.note.updateTitleNote);
  const [selectedFolder, setSelectedFolder] = useState<Id<"folder">>();
  const [title, setTitle] = useState<string>("");

  const handleCreateFolder = useCallback(() => {
    const promise = createfolder({ title: "New Clinical Note" });

    toast.promise(promise, {
      loading: "Creating a New Patient...",
      success: "New Patient created!",
      error: "Failed to create a New Patient.",
    });
  }, [createfolder]);

  const handleCreateNote = useCallback(() => {
    const promise = createnote({
      title: "New Clinical Note",
      folderId: folderId,
    });

    toast.promise(promise, {
      loading: "Creating a New Clinical Note...",
      success: "New Clinical Note created!",
      error: "Failed to create a New Clinical Note.",
    });
  }, [createnote, folderId]);

  const handleDeleteFolder = useCallback(() => {
    if (!folderId) return;
    const promise = deletefolder({ folderId: folderId });

    toast.promise(promise, {
      loading: "Deleting the folder...",
      success: "Deleted folder successfully",
      error: "Failed to delete folder",
    });
  }, [deletefolder, folderId]);

  const handleDeleteNote = useCallback(() => {
    if (!noteId) return;
    const promise = deletenote({ noteId });

    toast.promise(promise, {
      loading: "Deleting the note...",
      success: "Deleted note successfully",
      error: "Failed to delete note",
    });

    promise.then(() => {
      router.push("/documents");
    });
  }, [deletenote, noteId, router]);

  const handleArchive = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      if (!noteId) return;

      const promise = archive({ id: noteId });

      toast.promise(promise, {
        loading: "Moving to trash...",
        success: "Note moved to trash!",
        error: "Failed to archive note.",
      });

      promise.then(() => {
        if (params.documentId === noteId) {
          router.push("/documents");
        }
      });
    },
    [archive, noteId, params, router]
  );

  const handleMoveNote = useCallback(() => {
    if (!noteId || !selectedFolder) return;
    const promise = movenote({ noteId, folderId: selectedFolder });

    toast.promise(promise, {
      loading: "Moving note...",
      success: "Moved note successfully",
      error: "Failed to move note",
    });
  }, [movenote, noteId, selectedFolder]);

  const handleEditFolder = useCallback(() => {
    if (!folderId) return;
    const promise = updatefoldertitle({ folderId: folderId, title });

    toast.promise(promise, {
      loading: "Updating the folder title...",
      success: "Updated folder title successfully",
      error: "Failed to update folder title",
    });
  }, [updatefoldertitle, folderId, title]);

  const handleEditNote = useCallback(() => {
    if (!noteId) return;
    const promise = updatenotetitle({ noteId, title });

    toast.promise(promise, {
      loading: "Updating the note title...",
      success: "Updated note title successfully",
      error: "Failed to update note title",
    });
  }, [updatenotetitle, noteId, title]);

  return (
    <div className="px-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer hover:bg-primary/10 p-1 rounded-md">
          <span className={showOption ? "" : "invisible"}>
            <MoreHorizontal size={18} />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-[250px] min-w-[180px]">
          {folder && (
            <DropdownMenuItem onClick={handleCreateFolder}>
              Add Folder
            </DropdownMenuItem>
          )}
          {note && (
            <DropdownMenuItem onClick={handleCreateNote}>
              Add Note
            </DropdownMenuItem>
          )}
          {!note && noteId && (
            <Dialog>
              <DialogTrigger className="w-full text-left text-sm p-1 px-2 hover:bg-primary/10 rounded">
                Move to
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-base mb-2">
                    Select Folder
                  </DialogTitle>
                  <Select
                    onValueChange={(event) =>
                      setSelectedFolder(event as Id<"folder">)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders?.map((folder) => (
                        <SelectItem key={folder._id} value={folder._id}>
                          {folder.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DialogHeader>
                <DialogClose onClick={handleMoveNote}>
                  <Button className="w-full">Move</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          )}
          {deleteOptions && folderId && (
            <>
              <ConfirmModal onConfirm={handleDeleteFolder}>
                <div
                  role="button"
                  className="w-full text-left text-sm p-1 px-2 hover:bg-primary/10 rounded"
                >
                  Delete Folder
                </div>
              </ConfirmModal>

              <Dialog>
                <DialogTrigger className="w-full text-left text-sm p-1 px-2 hover:bg-primary/10 rounded">
                  Edit Folder
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-base mb-2">
                      Folder Title
                    </DialogTitle>
                    <Input
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="title"
                    />
                  </DialogHeader>
                  <DialogClose onClick={handleEditFolder}>
                    <Button className="w-full">Save</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </>
          )}
          {deleteOptions && noteId && (
            <>
              <DropdownMenuItem onClick={handleArchive}>
                Archive Note
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger className="w-full text-left text-sm p-1 px-2 hover:bg-primary/10 rounded">
                  Edit Note
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-base mb-2">
                      Note Title
                    </DialogTitle>
                    <Input
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="title"
                    />
                  </DialogHeader>
                  <DialogClose onClick={handleEditNote}>
                    <Button className="w-full">Save</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

export default Options;
