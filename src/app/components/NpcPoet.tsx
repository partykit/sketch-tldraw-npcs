import { useEffect, useState } from "react";
import usePartySocket from "partysocket/react";
import { useNpc } from "./npc-context";

import type {
  InitMessage,
  AnimateMessage,
  ComposeMessage,
  BanishMessage,
  StateMessage,
} from "@/partykit/npc-poet";
import { NPCState } from "@/partykit/npc-poet";

export default function NpcPoet() {
  const [npcState, setNpcState] = useState<NPCState>(NPCState.NotConnected);

  const socket = usePartySocket({
    host: "127.0.0.1:1999",
    party: "npcPoet",
    room: "dolphin-example",
    startClosed: true,
  });
}
