import { Dispatch, ElementRef, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, XSquare } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import dynamic from "next/dynamic";
import Checkbox from "./checkbox";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { saveSummaryNote } from "@/convex/documents";
import { Id } from "@/convex/_generated/dataModel";
import TranscriptionContext from "@/app/(speech)/app/components/TranscriptionContext";

interface DetailsSectionProps {
  documentId: Id<"documents">;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

const DetailsSection = ({documentId, isCollapsed, setIsCollapsed}: DetailsSectionProps) => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const { summaryNote } = useContext(TranscriptionContext);

  const updateSummary = useMutation(api.documents.saveSummaryNote)
  const onChangeEditor = (content: string) => {

  };
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();
  // const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const collapse = () => {
    if (sidebarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const resetWidth = () => {
    if (sidebarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "620px";
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar border-l-[1px] border-[rgba(207, 207, 207, 0.88)] dark:border-[#88888e] h-full bg-[#FFFFFF] dark:bg-[#1F1F1F]  overflow-y-auto relative flex w-[620px] flex-col",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >

        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          {isMobile ? <XSquare /> : <ChevronsRight className="h-6 w-6" />}
        </div>
        <Tabs.Root className="TabsRoot" defaultValue="Insights">
          <Tabs.List className="TabsList">
            <Tabs.Trigger
              className="TabsTrigger text-sm font-bold text-gray-500 dark:text-[#CFCFCF]"
              value="Insights"
            >
              Insights
            </Tabs.Trigger>
            <Tabs.Trigger
              className="TabsTrigger text-sm font-bold text-gray-500 dark:text-[#CFCFCF]"
              value="actions"
            >
              Action Items
            </Tabs.Trigger>
          </Tabs.List>

          <div>
            <Tabs.Content className="TabsContent" value="Insights">
              <div className="py-3">
                <Editor onChange={onChangeEditor} initialContent={summaryNote} />
              </div>
            </Tabs.Content>

            <Tabs.Content className="TabsContent" value="actions">
              <div className="flex flex-col gap-3 p-3">
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
                <Checkbox />
              </div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </aside>

      {isCollapsed && (
        <div
          onClick={resetWidth}
          role="button"
          className={cn(
            "h-10 w-10 p-2 flex items-center justify-center text-[#1EAFB3] rounded-sm hover:bg-[#a7feff68] dark:hover:bg-[#a7feff68] border-solid border-2 border-[#1EAFB3] absolute top-1/2 right-2 opacity-0 group-hover/sidebar:opacity-100 transition opacity-100"
          )}

        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
      )}
    </>
  );
};

export default DetailsSection;
