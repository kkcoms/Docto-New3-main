import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPause } from '@fortawesome/free-solid-svg-icons';

interface RecordingBannerProps {
  isRecording: boolean;
  isPaused: boolean;
}

export const RecordingBanner = ({
  isRecording,
  isPaused,
}: RecordingBannerProps) => {
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerStyles, setBannerStyles] = useState({});

  useEffect(() => {
    if (isRecording) {
      if (isPaused) {
        setBannerMessage("Recording paused. Press the resume button to continue.");
        setBannerStyles({
          backgroundColor: "#8DD2D4", // Updated paused banner color
          color: "#004F54", // Contrasting text color for #8DD2D4
        });
      } else {
        setBannerMessage("Recording in progress. To finalize the recording, press the red mic icon.");
        setBannerStyles({
          backgroundColor: "#FF8C8C", // Recording banner color
          color: "#4A0000", // Contrasting text color for recording banner
        });
      }
    } else {
      setBannerMessage("");
    }
  }, [isRecording, isPaused]);

  if (!isRecording) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes gentlePulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.02);
              opacity: 0.98;
            }
          }
        `}
      </style>
      <div
        className={`fixed top-0 left-0 right-0 text-center text-sm p-3 shadow-md transition-opacity duration-500 ease-out`}
        style={{ ...bannerStyles, opacity: 0.95, animation: 'gentlePulse 2s infinite' }}
      >
        <FontAwesomeIcon icon={isPaused ? faPause : faMicrophone} className="mr-2" />
        {bannerMessage}
      </div>
    </>
  );
};
