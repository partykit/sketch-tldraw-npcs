"use client";

/*
 *
 * Makes the TLDraw Editor available to the rest of the app.
 *
 */

import { createContext, useContext, useState, useEffect } from "react";
import { Editor, TLShape, createShapeId } from "@tldraw/tldraw";

import { EMBASSY_ID_STRING } from "./CreateEmbassy";
import usePartySocket from "partysocket/react";
import PartySocket from "partysocket";
import { NPCState, StateMessage } from "@/partykit/utils/npc";

type Npc = {
  name: string; // for the avatar
  party: string; // for the partysocket
  socket: PartySocket | null;
  state: NPCState;
};

type NpcContextType = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  embassy: TLShape | null;
  currentUserId: string | null;
  npcMaker: Npc | null;
  npcPainter: Npc | null;
  npcPoet: Npc | null;
};

const NpcContext = createContext<NpcContextType>({
  editor: null,
  setEditor: () => {},
  embassy: null,
  currentUserId: null,
  npcMaker: null,
  npcPainter: null,
  npcPoet: null,
});

export function useNpc() {
  return useContext(NpcContext);
}

function initNpcSocket(party: string, setState: any) {
  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    party: party,
    room: "dolphin-example",
    startClosed: true,
    onMessage: (message) => {
      const msg = JSON.parse(message.data);
      switch (msg.type) {
        case "state":
          const stateMessage = msg as StateMessage;
          console.log("Got state message", JSON.stringify(msg, null, 2));
          setState(
            (npc: Npc) => ({ ...npc, state: stateMessage.state } as Npc)
          );
          break;
      }
    },
  });
  return socket;
}

export function NpcProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [embassy, setEmbassy] = useState<TLShape | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!editor) return;
    const embassyId = createShapeId(EMBASSY_ID_STRING);

    const embassy = editor.getShape(embassyId);
    if (embassy) {
      setEmbassy(embassy);
    }

    setCurrentUserId(editor.user.id as string);

    const removeListener = editor.store.listen(
      function monitorEmbassy({ changes }) {
        Object.values(changes.added).forEach((record) => {
          if (record.id === embassyId) {
            setEmbassy(record as TLShape);
          }
        });
        Object.values(changes.removed).forEach((record) => {
          if (record.id === embassyId) {
            setEmbassy(null);
          }
        });
      },
      { source: "all", scope: "document" }
    );

    return () => {
      removeListener();
    };
  }, [editor]);

  return (
    <NpcContext.Provider
      value={{
        editor: editor,
        setEditor: setEditor,
        embassy: embassy,
        currentUserId: currentUserId,
        npcMaker: npcMaker,
        npcPainter: npcPainter,
        npcPoet: npcPoet,
      }}
    >
      {children}
    </NpcContext.Provider>
  );
}
