import { Transcription } from "@/app/types";

export type VoiceItemProps = {
  transcription: Transcription;
  isSelected: boolean;
  id?: string;
};

const VoiceItem = ({ transcription, isSelected, id }: VoiceItemProps) => {
  return (
    <div className="flex flex-col gap-[12px] transition-all ease-in-out duration-300" id={id}>
      <div className="flex flex-row items-center gap-[12px] text-sm font-bold">
        <div className="w-[16px] h-[16px] rounded-full bg-[#d0888c]" />
        Speaker {transcription.speaker}
        <div className="text-sm font-thin text-gray-400">
          {transcription.timestamp}
        </div>
      </div>
      <div
        className={`pl-[32px] ${
          isSelected
            ? "inline-block px-5 py-2 font-bold rounded-full border border-[#8DD2D4] text-white bg-[#8DD2D4]"
            : "text-gray-500 dark:text-[#CFCFCF]"
        }`}
      >
        {transcription.transcript}
      </div>
    </div>
  );
};

export default VoiceItem;