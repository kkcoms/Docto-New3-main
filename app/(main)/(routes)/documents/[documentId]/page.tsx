// page.tsx
"use client";
import {useAction, useMutation, useQuery} from "convex/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import Transcription from "@/app/(speech)/app/components/Transcription";
import { api } from "@/convex/_generated/api";
import {Doc, Id} from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { Microphone } from "@/app/(speech)/app/components/Microphone";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";
import { IconPicker } from "@/components/icon-picker";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import DetailsSection from "@/app/(main)/_components/details-section";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useRouter } from 'next/navigation';
import { PlateEditor } from "@/app/(main)/_components/summary-editor";
import {IGeneralContext, GeneralContext} from "@/context/context";
import {PlateController} from "@udecode/plate";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [doc, setDoc] = useState<Doc<"documents"> | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [duration, setDuration] = useState<number>()
  const {
    isDisabledRecordButton,
    audioFileUrl,
    setAudioFileUrl,
    setAudioCurrentTime,
    isTranscribed,
    setIsTranscribed,
    addFinalTranscription,
    clearFinalTranscriptions,
    setLiveTranscription,
    setSummarizationResult,
    setSummaryNote
  } = useContext(TranscriptionContext);


  const { current, setCurrentNote, setDocumentId } = useContext(GeneralContext) as IGeneralContext

  useEffect(() => {
    setDocumentId(params.documentId)
  }, [])

  const [document, setDocument] = useState<Doc<"documents"> | null>(null)
  let _document = useQuery(api.documents.getById, current === null || current._id !== params.documentId ? {
    documentId: params.documentId
  } : "skip")

  useEffect(() => {
    if (_document)
      setDocument(_document);
    else if (current)
      setDocument(current);
  }, [_document])

  useEffect(() => {
    clearFinalTranscriptions();
    setAudioFileUrl("");
    setIsTranscribed(false);
    setAudioCurrentTime(0);
    setSummarizationResult("");
    setSummaryNote("");
    setLiveTranscription(null);
  }, [params.documentId]);

  useEffect(() => {

    if (!document) {
      return
    }

    clearFinalTranscriptions()

    document?.audioFileUrl ? setAudioFileUrl(document.audioFileUrl) : setAudioFileUrl("")

    document.summarizationResult ? setSummarizationResult(document.summarizationResult) : setSummarizationResult("");

    document.summaryNote ? setSummaryNote(document.summaryNote) : setSummaryNote("");

    if (document.content){
      const content = JSON.parse(document.content);
      content?.map(function(transcription: any, index: any) {
        addFinalTranscription(transcription);
        setIsTranscribed(true);
      })
    }

  }, [document]);

  if (!document) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (document)
    setCurrentNote(document)

  return (
    <div className="flex h-full justify-end">
      <div className={`flex flex-col page ${!isCollapsed && isMobile ? 'w-0' : 'w-full transition-all ease-in-out duration-300'} h-full`}>
        <div className={"page-content w-auto" + (!isTranscribed ? "h-full" : "")}>
          <Cover url={document.coverImage} />
          {!!document.icon && (
            <div className="flex absolute transform translate-y-[-50%] left-[40px] bg-[#ffffff00] w-[120px] h-[120px] p-[8px] justify-center rounded-md z-50">
              <IconPicker onChange={() => { }}>
                <p className="text-6xl hover:opacity-75 transition">
                  {document.icon}
                </p>
              </IconPicker>
            </div>
          )}

          <div className="body flex flex-col gap-y-[16px] dark:bg-[#1F1F1F]  ">
            <Toolbar initialData={document} duration={duration} />
            <Tabs>
            <TabList className="react-tabs__tab-list2">
                <Tab selectedClassName="TabsTrigger">
                  <div className="text-sm font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]">
                    Transcription
                  </div>
                </Tab>
                <Tab selectedClassName="TabsTrigger bg-transparent">
                  <div className="text-sm font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]">Summary</div>
                </Tab>
              </TabList>

              <TabPanel>
                <Transcription />
              </TabPanel>
              <TabPanel>
                <PlateController>
                  <PlateEditor/>
                </PlateController>
              </TabPanel>
            </Tabs>
          </div>
        </div>
        {!isTranscribed && <Microphone documentId={params.documentId}  />}
        {isTranscribed && audioFileUrl && (
          <div className="fixed audio-wrapper left-0 right-0">
            <AudioPlayer
              // autoPlay
              src={audioFileUrl}
              preload="metadata"
              onLoadedMetaData={(data : any) => {
                  if (data?.srcElement?.duration && !duration) {
                    setDuration(data?.srcElement?.duration)
                  }
                }
              }
              onListen={(e: any) => setAudioCurrentTime(parseFloat(e.srcElement.currentTime))}
            // other props here
            />
          </div>
        )}
      </div>
      <DetailsSection documentId={params.documentId} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
    </div>
  );
};
export default DocumentIdPage;
