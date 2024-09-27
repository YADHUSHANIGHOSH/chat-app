"use client";

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from "./sidebar.module.css";

import {
  FaUserCircle,
  FaEllipsisV,
  FaSearch,
  FaCommentDots,
} from "react-icons/fa";
import { gql, useQuery, ApolloClient, InMemoryCache } from "@apollo/client";
import { useRouter } from "next/navigation";
import ProfileModal from "../profilemodal/page";
import { Chat as ChatType } from "../chatbox/page";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const GET_CURRENT_USER = gql`
  query User($userId: Int!) {
    user(id: $userId) {
      id
      name
      profilepic
    }
  }
`;

const GET_USERS_CHATS = gql`
  query GetUserChats($userId: Int!) {
    getUserChats(userId: $userId) {
      id
      users {
        id
        name
        profilepic
      }
      messages {
        id
        text
      }
      createdAt
    }
  }
`;

export interface User {
  id: number;
  name: string;
  profilepic: string;
}

export interface Message {
  
  chatId: number;
  id: number;
  text: string;
  createdAt: string;
  senderId: number;
}
export interface Chat {
  id: number;
  users: User[];
  messages: Message[];
}

interface SidebarProps {
  setSelectedChat: (chat: ChatType | null) => void;
}


const socket = io("http://localhost:4000");


  const Sidebar: React.FC<SidebarProps> = ({ setSelectedChat }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(
    null
  );

  const getReceiver = (chat: Chat): User | null => {
    if (!user) return null;
    // Filter out the logged-in user from the chat's users and return the other user
    return chat.users.find((chatUser) => chatUser.id !== user.id) || null;
  };

  const router = useRouter();
  const userId = user?.id;

  const { data: currentUserData } = useQuery(GET_CURRENT_USER, {
    client,
    variables: { userId },
    skip: !userId,
  });

  const {
    data: userChatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useQuery(GET_USERS_CHATS, {
    client,
    variables: { userId },
    skip: !userId,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (currentUserData?.user) {
      setUser(currentUserData.user);
    }
  }, [currentUserData]);

  useEffect(() => {
    if (userChatsData) {
      setChats(userChatsData.getUserChats);
    }
  }, [userChatsData]);

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("newMessage", (newMessage: Message) => {
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === newMessage.chatId) {
            return {
              ...chat,
              messages: [newMessage, ...chat.messages],
            };
          }
          return chat;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (chatsError) {
    console.error("Error fetching chats:", chatsError);
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/signin");
  };

  const handleViewProfile = (profileUser: User) => {
    setSelectedProfileUser(profileUser);
    setIsProfileModalOpen(true);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleChatClick = (chat: ChatType) => {
    setSelectedChat(chat);
    console.log("chat id is", chat.id);

    socket.emit('joinChat', { chatId: chat.id });
    console.log("----------------------",chat.id)

    if (chat) {
      const receiver = getReceiver(chat);
      console.log("receiver", receiver?.name);
    }
  };

  if (chatsLoading) return <p>Loading chats...</p>;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        {user?.profilepic ? (
          <img
            src={user.profilepic}
            alt="Profile"
            className={styles.profileIcon}
            onClick={() => handleViewProfile(user)}
          />
        ) : (
          <FaUserCircle
            className={styles.profileIcon}
            onClick={() => handleViewProfile(user!)}
          />
        )}
        <h3 className={styles.userName}>{user?.name}</h3>
        <div className={styles.actions}>
          <FaCommentDots className={styles.icon} />
          <FaEllipsisV className={styles.icon} onClick={toggleMenu} />
          {showMenu && (
            <div className={styles.dropdownMenu}>
              <button onClick={() => handleViewProfile(user!)}>
                View Profile
              </button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.search}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search or start new chat"
          className={styles.searchInput}
        />
      </div>

      <div className={styles.chatList}>
        {chats.map((chat) => {
          const receiver = chat.users.find((u) => u.id !== user?.id);
          const latestMessage = chat.messages?.[0];

          return (
            <div
              key={chat.id}
              className={styles.chatItem}
              onClick={() => handleChatClick(chat)}
            >
              <div
                className={styles.chatAvatar}
                onClick={() => handleViewProfile(receiver!)}
              >
                {receiver?.profilepic ? (
                  <img
                    src={receiver.profilepic}
                    alt="Avatar"
                    className={styles.avatarIcon}
                  />
                ) : (
                  <FaUserCircle className={styles.avatarIcon} />
                )}
              </div>
              <div className={styles.chatInfo}>
                <h4 className={styles.chatName}>
                  {receiver?.name || "Unknown User"}
                </h4>
                <p className={styles.chatMessage}>
                  {latestMessage?.text || "No messages"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          close={() => setIsProfileModalOpen(false)}
          user={selectedProfileUser}
        />
      )}
    </div>
  );
};

export default Sidebar;
