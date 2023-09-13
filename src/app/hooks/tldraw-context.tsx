"use client";

/*
 *
 * Makes the TLDraw Editor available to the rest of the app.
 *
 */

import { createContext, useContext, useState, useEffect } from "react";
import { Editor, TLShape, createShapeId } from "@tldraw/tldraw";
import { EMBASSY_ID_STRING } from "@/app/components/CreateEmbassy";
import { useNpc, type Npc } from "./useNpc";

type TldrawContextType = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  embassy: TLShape | null;
  currentUserId: string | null;
  npcPoet: Npc | null;
  npcPainter: Npc | null;
  npcMaker: Npc | null;
};

const TldrawContext = createContext<TldrawContextType>({
  editor: null,
  setEditor: () => {},
  embassy: null,
  currentUserId: null,
  npcPoet: null,
  npcPainter: null,
  npcMaker: null,
});

export function useTldraw() {
  return useContext(TldrawContext);
}

export function TldrawProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [embassy, setEmbassy] = useState<TLShape | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const npcPoet = useNpc({
    id: "npcPoet",
    name: "It writes poems",
    shortName: "👨‍🎤",
    colorClass: "bg-lime-200",
    hoverColorClass: "hover:bg-lime-300",
  });

  const npcPainter = useNpc({
    id: "npcPainter",
    name: "It paints stars",
    shortName: "🧑‍🎨",
    colorClass: "bg-pink-200",
    hoverColorClass: "hover:bg-pink-300",
  });

  const npcMaker = useNpc({
    id: "npcMaker",
    name: "It makes shapes",
    shortName: "👷",
    colorClass: "bg-cyan-200",
    hoverColorClass: "hover:bg-cyan-300",
  });

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
    <TldrawContext.Provider
      value={{
        editor: editor,
        setEditor: setEditor,
        embassy: embassy,
        currentUserId: currentUserId,
        npcPoet: npcPoet,
        npcPainter: npcPainter,
        npcMaker: npcMaker,
      }}
    >
      {children}
    </TldrawContext.Provider>
  );
}
