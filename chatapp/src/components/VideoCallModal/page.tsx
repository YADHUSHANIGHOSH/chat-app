import React, { useRef, useEffect } from "react";
import styles from "./videocallmodal.module.css";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  endCall: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  localStream,
  remoteStream,
  localVideoRef,
  remoteVideoRef,
  endCall,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.videoContainer}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.localVideo}
          ></video>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={styles.remoteVideo}
          ></video>
        </div>
        <button className={styles.endCallButton} onClick={endCall}>
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;
