"use client";

/*
 *
 * Makes the TLDraw Editor available to the rest of the app.
 *
 */

import { createContext, useContext, useState, useEffect } from "react";
import { Editor, TLShapeId, TLShape, createShapeId } from "@tldraw/tldraw";

import { EMBASSY_ID_STRING } from "./CreateEmbassy";

type NpcContextType = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  embassy: TLShape | null;
};

const NpcContext = createContext<NpcContextType>({
  editor: null,
  setEditor: () => {},
  embassy: null,
});

export function useNpc() {
  return useContext(NpcContext);
}

export function NpcProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [embassy, setEmbassy] = useState<TLShape | null>(null);

  useEffect(() => {
    if (!editor) return;
    const embassyId = createShapeId(EMBASSY_ID_STRING);

    const embassy = editor.getShape(embassyId);
    if (embassy) {
      setEmbassy(embassy);
    }

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
      }}
    >
      {children}
    </NpcContext.Provider>
  );
}
