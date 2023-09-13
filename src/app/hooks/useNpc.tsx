import { useState } from "react";
import { NPCState, StateMessage } from "@/partykit/utils/npc";
import PartySocket from "partysocket";
import usePartySocket from "partysocket/react";
import { TLPageId } from "@tldraw/tldraw";

export type Npc = {
  id: string;
  name: string; // for the avatar
  shortName: string; // for the avatar
  className: string;
  send: (message: any) => void;
  summon: (pageId: string) => void;
  npcState: NPCState;
};

export function useNpc({
  id, // party name. e.g. "npcMaker"
  name, // human-readable name. e.g. "It makes shapes"
  shortName, // for the avatar, e.g. an emoji
  className, // for colours
}: {
  id: string;
  name: string;
  shortName: string;
  className: string;
}) {
  const [npcState, setNpcState] = useState<NPCState>(NPCState.NotConnected);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    party: id,
    room: "dolphin-example",
    startClosed: true,
    onMessage: (message) => {
      const msg = JSON.parse(message.data);
      switch (msg.type) {
        case "state":
          const stateMessage = msg as StateMessage;
          setNpcState(stateMessage.state as NPCState);
          break;
      }
    },
  });

  const send = (message: any) => {
    socket.send(JSON.stringify(message));
  };

  const summon = (pageId: TLPageId) => {
    if (socket.readyState !== PartySocket.OPEN) {
      socket.reconnect();
    }
    socket.send(
      JSON.stringify({
        type: "summon",
        pageId: pageId,
      })
    );
  };

  return {
    id: id,
    name: name,
    shortName: shortName,
    className: className,
    send: send,
    summon: summon,
    npcState: npcState,
  } as Npc;
}
