"use client"
import React, { useState } from "react";
import Sidebar from '@/components/sidebar/page';
import ChatBox from '@/components/chatbox/page';
import styles from "./chatpage.module.css";

interface Chat {
  id: number;
  users: User[];
  messages: Message[];
}

interface User {
  id: number;
  name: string;
  profilepic: string;
}

interface Message {
  id: number;
  text: string;
  createdAt: string;
}

const Chatscreen = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <div className={styles.mainpage}>
      <div className={styles.sidebar}>
        <Sidebar setSelectedChat={setSelectedChat} />
      </div>
      <div className={styles.right}>
        <ChatBox chat={selectedChat} />
      </div>
    </div>
  );
};

export default Chatscreen;
