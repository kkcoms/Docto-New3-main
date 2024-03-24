"use client";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();
  const documentId = params.documentId as Id<"documents"> | undefined;

  const document = useQuery(api.documents.getById, {
    documentId: documentId || "" as Id<"documents">,
  });

  if (!documentId || document === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        {/* <Title.Skeleton /> */}
        <div className="flex items-center gap-x-2">
          {/* <Menu.Skeleton /> */}
        </div>
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <div className="flex-1">
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 mb-0.5 w-full flex items-center gap-x-4 border-b-[1px] border-t-[1px] dark:border-[#e5e7eb26]">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          <div className="flex items-center gap-x-2">
            <Publish initialData={document} />
            <Menu documentId={document._id} />
          </div>
        </div>
      </nav>
      {document && document.isArchived && <Banner documentId={document._id} />}
    </div>
  );
};