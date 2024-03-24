import { useQuery } from 'convex/react';
import React, { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Folder } from 'lucide-react';
import Options from './options';
import Notes from './notes';
import { useRouter } from 'next/navigation';

import { api } from '@/convex/_generated/api'
import { Id } from "@/convex/_generated/dataModel";

type Props = {}

const FolderList = ({level}: { level: number }) => {
    const folders = useQuery(api.folder.getAllFolders,{});

    if (folders === undefined) {
        return (
          <>
            <FolderList.Skeleton level={level} />
            {level === 0 && (
              <>
                <FolderList.Skeleton level={level} />
                <FolderList.Skeleton level={level} />
              </>
            )}
          </>
        );
    };
  return (
    <div className='text-muted-foreground'>
        {folders.map((folder) => (
            <FolderItem key={folder._id} folderId={folder._id} foldertitle={folder.title}/>
        ))}
    </div>
  )
}

export default FolderList


const FolderItem = ({folderId, foldertitle}:{folderId:Id<"folder">, foldertitle:string}) => {
    const [shownotes, setShownotes] = useState<boolean>(false)
    const [showOption, setShowOption] = useState<boolean>(false)
    const router = useRouter()

    return(
        <div>
            <div onClick={() => {setShownotes(!shownotes); router.push(`/folder/${folderId}`)}} onMouseEnter={() => setShowOption(true)} onMouseLeave={() => setShowOption(false)} className='flex items-center justify-between py-[1px] hover:bg-primary/5 px-3 cursor-pointer'>   
                <div className='flex items-center space-x-1'>
                    <ChevronComp folderId={folderId}/>
                    <Folder size={18} />
                    <span>{foldertitle}</span>
                </div>
                <div>
                    <Options showOption={showOption} folder={false} folderId={folderId} deleteOptions={true}/>
                </div>
            </div>
            {shownotes && (
            <div className='pl-5'>
                <Notes  folderId={folderId}/>
            </div>
            )}
        </div>
    )
}


const ChevronComp = ({folderId}:{folderId:string}) => {
    const notes = useQuery(api.note.getNotesById,{
        folderId
    });

    console.log(notes)

    if( notes && notes?.length <= 0){
        return(
            <span className=''></span>
        )
    }

    return(
        <ChevronRight size={18}/>
    )
}

FolderList.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
    return (
      <div
        style={{
          paddingLeft: level ? `${(level * 12) + 25}px` : "12px"
        }}
        className="flex gap-x-2 py-[3px]"
      >
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-[30%]" />
      </div>
    )
}