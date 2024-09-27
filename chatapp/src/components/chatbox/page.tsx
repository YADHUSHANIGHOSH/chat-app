"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client"; // Import Socket.IO client
import styles from "./chatbox.module.css";
import { FaSearch, FaEllipsisV, FaSmile, FaVideo } from "react-icons/fa";
import { gql, ApolloClient, InMemoryCache, useMutation } from "@apollo/client";
import ProfileModal from "../profilemodal/page";
import VideoCallModal from "../VideoCallModal/page";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($chatId: Int!, $senderId: Int!, $text: String!) {
    createMessage(chatId: $chatId, senderId: $senderId, text: $text) {
      id
      chat {
        id
      }
      chatId
      sender {
        id
      }
      senderId
      text
      timestamp
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: Int!) {
    deleteMessage(messageId: $messageId) {
      id
      text
    }
  }
`;

export interface Message {
  senderId: number;
  chatId: number;
  id: number;
  text: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  profilepic: string;
}

export interface Chat {
  id: number;
  users: User[];
  messages: Message[];
}

interface ChatBoxProps {
  chat: Chat | null;
}

const socket = io("http://localhost:4000");

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  if (!chat || !chat.users.length) {
    return <div className={styles.welcome}>WELCOME TO FREE CHAT</div>;
  }

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);
  const iceServers = {iceServers: [{ urls: "stun:stun.l.google.com:19302" }],};
  const storedUser = localStorage.getItem("user");
  const loggedInUserId = storedUser ? Number(JSON.parse(storedUser)?.id) : 0;
  const receiver = chat.users.find((u) => u.id !== loggedInUserId);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const senderId = loggedInUserId;
  const chatId = chat.id;
  const [createMessage] = useMutation(CREATE_MESSAGE, { client });
  const [deleteMessageMutation] = useMutation(DELETE_MESSAGE, { client });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const startLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    startLocalVideo();

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleNewICECandidate);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleNewICECandidate);
    };
  }, []);

  const handleNewICECandidate = async (event: any) => {
    try {
      if (peerConnection) {
        const candidate = new RTCIceCandidate(event.candidate);
        await peerConnection.addIceCandidate(candidate);
        console.log("Added ICE candidate:", candidate);
      }
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  };

  const handleOffer = async (data: any) => {
    const pc = createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

    localStream
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStream));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", {
      target: data.sender,
      answer,
    });

    setPeerConnection(pc);
  };

  const handleAnswer = async (data: any) => {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(iceServers);

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setRemoteStream(remoteStream);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    return pc;
  };

  const initiateCall = async () => {
    const pc = createPeerConnection();
    localStream
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", { target: chat.users[1].id, offer });
    setPeerConnection(pc);
    setIsVideoCallModalOpen(true);
  };

  const endCall = () => {
    peerConnection?.close();
    setPeerConnection(null);
    setIsVideoCallModalOpen(false);
  };

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("message", (data) => {
      console.log("Received from server:", data);
    });

    socket.on("newMessage", (message: Message) => {
      console.log("Received new message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const response = await createMessage({
          variables: {
            chatId,
            senderId,
            text: newMessage,
          },
        });
        console.log("Message sent:", response.data.createMessage);

        const newMsg = response.data.createMessage;
        setMessages((prevMessages) => [...prevMessages, newMsg]);

        const socket = io("http://localhost:4000");



        socket.emit("chatMessage", newMsg);
        

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleProfileModal = () => {
    setIsProfileModalOpen((prev) => !prev);
  };

  return (
    <div className={styles.chatBox}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderInfo}>
          <img
            src={receiver?.profilepic || "/user-avatar.png"}
            alt="User Avatar"
            className={styles.avatar}
            onClick={toggleProfileModal}
          />
          <div>
            <h3 className={styles.userName}>
              {receiver?.name || "Contact Name"}
            </h3>
            <p className={styles.userStatus}>online</p>
          </div>
        </div>
        <div className={styles.chatHeaderActions}>
          <FaSearch className={styles.icon} />
          <FaVideo className={styles.icon} onClick={initiateCall} />
          <FaEllipsisV className={styles.icon} />
        </div>
      </div>

      <div className={styles.chatArea}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.senderId === loggedInUserId
                ? styles.messageOwn
                : styles.messageReceived
            }`}
          >
            <span className={styles.messageText}>{message.text}</span>
          </div>
        ))}
      </div>

      <div className={styles.chatInputArea}>
        <FaSmile className={styles.icon} />
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.input}
        />
        <button onClick={handleSendMessage} className={styles.sendButton}>
          Send
        </button>
      </div>

      {isProfileModalOpen && (
        <div className={styles.modalOverlay} onClick={toggleProfileModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileModal
              isOpen={isProfileModalOpen}
              close={() => setIsProfileModalOpen(false)}
              user={receiver || null}
            />
          </div>
        </div>
      )}

      <VideoCallModal
        isOpen={isVideoCallModalOpen}
        onClose={() => setIsVideoCallModalOpen(false)}
        localStream={localStream}
        remoteStream={remoteStream}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        endCall={endCall}
      />
    </div>
  );
};

export default ChatBox;
