import { useEffect, useState } from "react";
import usePartySocket from "partysocket/react";
import { useNpc } from "./npc-context";

import type { AnimateMessage, ComposeMessage } from "@/partykit/npc-poet";
import type {
  SummonMessage,
  BanishMessage,
  StateMessage,
} from "@/partykit/utils/npc";
import { NPCState } from "@/partykit/utils/npc";

function Button({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full p-2
          outline outline-1 outline-neutral-200
          bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200
          disabled:cursor-not-allowed
          text-neutral-500 disabled:text-neutral-400"
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
}

export default function NpcPoet() {
  const [npcState, setNpcState] = useState<NPCState>(NPCState.NotConnected);
  const { editor, embassy } = useNpc();

  const socket = usePartySocket({
    host: "127.0.0.1:1999",
    party: "npcPoet",
    room: "dolphin-example",
    //startClosed: true,
    onMessage: (message) => {
      const msg = JSON.parse(message.data);
      switch (msg.type) {
        case "state":
          const stateMessage = msg as StateMessage;
          console.log("Got state message", JSON.stringify(msg, null, 2));
          setNpcState(stateMessage.state as NPCState);
          break;
      }
    },
  });

  if (!editor) return null;
  if (!embassy) return null;

  return (
    <>
      <Button
        onClick={() => {
          socket.send(
            JSON.stringify({
              type: "summon",
              pageId: editor.currentPageId,
            } as SummonMessage)
          );
        }}
        disabled={npcState !== NPCState.NotConnected}
      >
        Summon
      </Button>
      <Button
        onClick={() => {
          socket.send(
            JSON.stringify({ type: "animate", radius: 50 } as AnimateMessage)
          );
        }}
        disabled={npcState === NPCState.NotConnected}
      >
        Circle
      </Button>
      <Button
        onClick={() => {
          socket.send(JSON.stringify({ type: "compose" } as ComposeMessage));
        }}
        disabled={npcState === NPCState.NotConnected}
      >
        Compose
      </Button>
      <Button
        onClick={() => {
          socket.send(JSON.stringify({ type: "paint" }));
        }}
        disabled={npcState !== NPCState.Painting}
      >
        Paint?
      </Button>
    </>
  );
}
