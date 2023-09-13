import { useState, useRef } from "react";
import usePartySocket from "partysocket/react";
import FacePile from "./Facepile";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import type { User } from "@/partykit/chat";
import { useTldraw } from "@/app/hooks/tldraw-context";
import Summon from "./Summon";

export type ChatMessage = {
  text: string;
  user: User;
};

const MAX_MESSAGES = 100;

export default function Sidebar() {
  const { editor, currentUserId } = useTldraw();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    party: "chat",
    room: "dolphin-example",
    //startClosed: true,
    onMessage: (message) => {
      const msg = JSON.parse(message.data);
      switch (msg.type) {
        case "presence":
          setUsers(msg.users);
          break;
        case "chat":
          recordMessage(msg.text, msg.user);
          break;
      }
    },
  });

  const setUsers = (users: User[]) => {
    const currentUser = users.find((user) => user.userId === currentUserId);
    setCurrentUser(currentUser ?? null);
    setOtherUsers(users.filter((user) => user.userId !== currentUserId) ?? []);
  };

  const sendMessage = (text: string) => {
    if (!currentUser) return;
    socket?.send(
      JSON.stringify({ type: "chat", text: text, user: currentUser })
    );
    recordMessage(text, currentUser);
  };

  const recordMessage = (text: string, user: User) => {
    const newMessages = [...messages, { text, user }];
    // Truncate the array to the last 10 messages
    setMessages(
      newMessages.slice(Math.max(newMessages.length - MAX_MESSAGES, 0))
    );
  };

  const userCount = otherUsers.length + (currentUser !== null ? 1 : 0);

  return (
    <div
      className="w-full h-full relative p-2 overflow-y-scroll flex flex-col"
      ref={sidebarRef}
    >
      <div className="absolute top-2 left-2 w-full">
        <div className="flex flex-row justify-between items-center">
          <Summon sidebarEl={sidebarRef?.current} />
          <FacePile
            otherUsers={otherUsers}
            currentUser={currentUser}
            sidebarEl={sidebarRef?.current}
          />
        </div>
      </div>
      <div className="pt-10">People present: {userCount}</div>
      <div>currentUserId: {currentUserId}</div>
      <div className="flex flex-col gap-4 h-full justify-end">
        <ChatMessages
          messages={messages}
          currentUserId={currentUser?.userId ?? null}
        />
        <ChatInput sendMessage={sendMessage} />
      </div>
    </div>
  );
}
