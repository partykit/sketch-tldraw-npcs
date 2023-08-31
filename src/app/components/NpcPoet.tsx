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

import Button from "./Button";

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
    <div className="flex flex-col w-full justify-item items-start">
      <div className="w-full text-center text-xs text-neutral-500 uppercase tracking-widest font-semibold py-2 font-mono">
        Poet
      </div>

      {npcState === NPCState.NotConnected && (
        <Button
          bgColor="bg-lime-200"
          bgColorHover="hover:bg-lime-300"
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
      )}
      {npcState !== NPCState.NotConnected && (
        <>
          <Button
            bgColor="bg-lime-200"
            bgColorHover="hover:bg-lime-300"
            onClick={() => {
              socket.send(
                JSON.stringify({
                  type: "animate",
                  radius: 50,
                } as AnimateMessage)
              );
            }}
          >
            Circle
          </Button>
          <Button
            bgColor="bg-lime-200"
            bgColorHover="hover:bg-lime-300"
            onClick={() => {
              socket.send(
                JSON.stringify({ type: "compose" } as ComposeMessage)
              );
            }}
          >
            Compose a haiku
          </Button>
        </>
      )}
    </div>
  );
}
