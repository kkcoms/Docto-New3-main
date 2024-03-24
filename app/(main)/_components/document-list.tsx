"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { ChevronDown, ChevronRight, FileIcon, Folder } from "lucide-react";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

import { Item } from "./item";
import Options from "@/app/(notes)/_components/options";
import Notes from "@/app/(notes)/_components/notes";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
}

export const DocumentList = ({
  parentDocumentId,
  level = 0
}: DocumentListProps) => {
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const onExpand = (documentId: string) => {
    setExpanded(prevExpanded => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId]
    }));
  };

  const folders = useQuery(api.folder.getAllFolders,{});

  if (folders === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  };
  console.log('expanded', expanded)
  return (
    <>
      <div className="text-muted-foreground text-sm">
        {
        folders.map((folder) => {
            return <FolderItem key={folder._id} folderId={folder._id} foldertitle={folder.title} isExpanded={expanded[folder._id]} onExpand={() => onExpand(folder._id)}/>
        })
        }
      </div>
    </>
  );


};
const FolderItem = ({folderId, foldertitle, isExpanded, onExpand}:{folderId: Id<"folder">, foldertitle: string, isExpanded: boolean, onExpand?: () => void}) => {
    const [shownotes, setShownotes] = useState<boolean>(isExpanded)
    const [showOption, setShowOption] = useState<boolean>(false)
    const notes = useQuery(api.note.getNotesById,{
        folderId
    });
  const params = useParams();
  const router = useRouter();
  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

    if(notes == undefined)
        return (
            <Skeleton className='w-4 h-4'/>
        )
    return(
        <div>
            <div onMouseEnter={() => setShowOption(true)} onMouseLeave={() => setShowOption(false)} className='flex items-center justify-between py-[1px] hover:bg-primary/5 px-3 cursor-pointer'>   
                <div onClick={() => {setShownotes(!shownotes); onExpand?.(); router.push(`/folder/${folderId}`)}}  className='flex items-center space-x-1'>
                    <ChevronComp folderId={folderId} isCollapsed={shownotes}/>
                    <Folder size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">{foldertitle}</span>
                </div>
                <div>
                    <Options showOption={showOption} folder={false} folderId={folderId} deleteOptions={true}/>
                </div>
            </div>
            {shownotes && (
            <div className='pl-5'>
                  {notes?.map((note) => (
                    <div key={note._id}>
                      <Item
                        id={note._id}
                        folderId={note.folderId}
                        onClick={() => onRedirect(note._id)}
                        label={note.title}
                        icon={FileIcon}
                        documentIcon={note.icon}
                        active={params.documentId === note._id}
                      />
                    </div>
                  ))}
            </div>
            )}
        </div>
    )
}

  const ChevronComp = ({folderId, isCollapsed}:{folderId:string, isCollapsed: boolean}) => {
    const notes = useQuery(api.note.getNotesById,{
        folderId
    });

    if( notes && notes?.length <= 0){
        return(
            <span className=''></span>
        )
    }

      return(
        <>
          {!isCollapsed 
            ? <ChevronRight size={16} className="text-muted-foreground" />
            : <ChevronDown size={16} className="text-muted-foreground" />
          }
        </>
      )
}