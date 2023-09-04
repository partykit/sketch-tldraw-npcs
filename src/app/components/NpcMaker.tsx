import { useState } from "react";
import usePartySocket from "partysocket/react";
import { useNpc } from "./npc-context";

import type { SummonMessage, StateMessage } from "@/partykit/utils/npc";
import { NPCState } from "@/partykit/utils/npc";

import Button from "./Button";

export default function NpcMaker() {
  const [npcState, setNpcState] = useState<NPCState>(NPCState.NotConnected);
  const { editor, embassy } = useNpc();

  const socket = usePartySocket({
    host: "127.0.0.1:1999",
    party: "npcMaker",
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
        It makes shapes
      </div>
      {npcState === NPCState.NotConnected && (
        <Button
          bgColor="bg-cyan-200"
          bgColorHover="hover:bg-cyan-300"
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
        <Button
          bgColor="bg-cyan-200"
          bgColorHover="hover:bg-cyan-300"
          onClick={() => {
            socket.send(JSON.stringify({ type: "boxes" }));
          }}
        >
          Draw boxes
        </Button>
      )}
    </div>
  );
}
