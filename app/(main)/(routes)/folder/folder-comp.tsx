"use client"
import React from 'react'
import { Doc } from '@/convex/_generated/dataModel'
import { FileText } from 'lucide-react'
import Link from 'next/link'


type Props = {}

const FolderComp = ({note}:{note:Doc<'documents'>}) => {
    const noteCreationDateTime = note._creationTime
    ? new Date(note._creationTime
        ) 
    : null;
  return (
    <Link href={`/documents/${note._id}`} className='inline-block '>
    <div className='flex  space-x-2 hover:bg-primary/5 rounded-md p-2'>
        <span className='border-solid border-slate-200 p-2 rounded-md shadow-md'>
            {
                note.icon
                ? <span className='text-2xl'>{note.icon}</span>
                : <FileText size={32} />
            }
        </span>
        <div className='flex flex-col gap-3 text-xs'>
            <span className='text-[16px] font-bold'>{note.title}</span>
            {noteCreationDateTime && (
            <div className="text-sm text-gray-500">
            Created on: {noteCreationDateTime.toLocaleDateString()} at {noteCreationDateTime.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}
                    </div>
            )}
        </div>
    </div>
    </Link>
  )
}

export default FolderComp