"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { PlusCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

const DocumentsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const create = useMutation(api.documents.create);

  const onCreate = () => {
    const promise = create({
      title: "New Clinical Note",
    } as { parentDocument?: Id<"documents"> | undefined; title: string })
      .then((documentId) => {
        router.push(`/documents/${documentId}`)
      })

    toast.promise(promise, {
      loading: "Creating a New Clinical Note...",
      success: "New Clinical Note created!",
      error: "Failed to create a New Clinical Note."
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/emptynote.svg"
        height="400"
        width="400"
        alt="Empty"
        className="dark:hidden"
      />
      <Image
        src="/emptynote.svg"
        height="400"
        width="400"
        alt="Empty"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Docto
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a clinical note
      </Button>
    </div>
   );
}

export default DocumentsPage;
