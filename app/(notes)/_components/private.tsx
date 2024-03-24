import React, { useState } from 'react'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Options from './options';
import FolderList from './folder-list';
import Orphannotes from './notes';
import Notes from './notes';

type Props = {}

const Private = (props: Props) => {
  const [showOption, setShowOption] = useState<boolean>(false)
  return (
    <div className='text-sm text-muted-foreground border-t-[1px] border-neutral-600'>
      <div>
      <div onMouseEnter={() => setShowOption(true)} onMouseLeave={() => setShowOption(false)} className='hover:bg-primary/5 flex items-center justify-between py-1 px-3'>
          <span >
            Create Folder
          </span>
          <Options showOption={showOption} folder={true} />
      </div>
      {/* <Notes /> */}
      {/* <FolderList level={15} /> */}
      </div>
    </div>
  )
}

export default Private