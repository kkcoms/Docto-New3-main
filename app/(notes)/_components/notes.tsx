import { useQuery } from 'convex/react';
import React, {useMemo, useCallback, useState, useContext, useEffect} from 'react';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Options from './options';
import { api } from '@/convex/_generated/api';
import { Id } from "@/convex/_generated/dataModel";
import { debounce } from 'lodash';
import {IGeneralContext, GeneralContext} from "@/context/context";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";

const Notes = ({ folderId }: { folderId?: Id<"folder"> }) => {

  const { setCurrentNote } = useContext(GeneralContext) as IGeneralContext

  const _notes = useQuery(api.note.getNotesById, { folderId });
  const [showOption, setShowOption] = useState<{ key: string; value: boolean }>();
  const router = useRouter();

  const handleMouseEnter = useCallback(
    debounce((noteId: string) => {
      setShowOption({ key: noteId, value: true });
    }, 200),
    []
  );

  const handleMouseLeave = useCallback(() => {
    setShowOption(undefined);
  }, []);

  if (!_notes) {
    return <Skeleton className="w-4 h-4" />;
  }

  const handleClick = (note : any) => {
    setCurrentNote(note)
    router.push(`/documents/${note._id}`)
  }

  return (
    <div className={`${folderId ? '' : 'border-b-[1px] border-t-[1px] mb-6 dark:border-[#e5e7eb26]'}`}>
      {!folderId && (
        <div className='flex items-center justify-between py-1 px-3 text-sm text-muted-foreground'>Notes</div>
      )}
      {_notes.map((note) => (
        <div
          key={note._id}
          onMouseEnter={() => handleMouseEnter(note._id)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(note)}
          className="flex items-center justify-between hover:bg-primary/5 py-1 px-3 cursor-pointer"
        >
          <div className="flex items-center space-x-1">
            <FileText size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{note.title}</span>
          </div>
          <Options
            showOption={showOption?.key === note._id}
            folder={false}
            note={false}
            noteId={note._id}
            deleteOptions={true}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(Notes);
