"use client";

/*
 *
 * Makes the TLDraw Editor available to the rest of the app.
 *
 */

import { createContext, useContext, useState, useEffect } from "react";
import { Editor, TLShapeId } from "@tldraw/tldraw";
import { getCentroidForEmbassy } from "./CreateEmbassy";

type NpcContextType = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  embassyId: TLShapeId | null;
  setEmbassyId: (embassyId: TLShapeId | null) => void;
  embassyCentroid: { x: number; y: number } | null;
};

const NpcContext = createContext<NpcContextType>({
  editor: null,
  setEditor: () => {},
  embassyId: null,
  setEmbassyId: () => {},
  embassyCentroid: null,
});

export function useNpc() {
  return useContext(NpcContext);
}

export function NpcProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [embassyId, setEmbassyId] = useState<TLShapeId | null>(null);
  const [embassyCentroid, setEmbassyCentroid] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!editor) return;
    if (!embassyId) return;

    const embassy = editor.getShape(embassyId);
    if (!embassy) return;
    const centroid = getCentroidForEmbassy(embassy);
    setEmbassyCentroid(centroid);
  }, [embassyId, editor]);

  return (
    <NpcContext.Provider
      value={{
        editor: editor,
        setEditor: setEditor,
        embassyId: embassyId,
        setEmbassyId: setEmbassyId,
        embassyCentroid: embassyCentroid,
      }}
    >
      {children}
    </NpcContext.Provider>
  );
}
