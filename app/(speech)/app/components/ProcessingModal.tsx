// ProcessingModal.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProcessingModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isVisible,
  onClose,
}) => {
  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Processing Recording</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl mb-4 animate-spin"
              />
              <p className="text-sm text-center">
                The recording is being processed. The summary and transcription
                will be displayed when finalized.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingModal;