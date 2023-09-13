"use client";

/*
 *
 * Makes the TLDraw Editor available to the rest of the app.
 *
 */

import { createContext, useContext, useState, useEffect } from "react";
import { Editor, TLShape, createShapeId } from "@tldraw/tldraw";
import { EMBASSY_ID_STRING } from "@/app/components/CreateEmbassy";

type TldrawContextType = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  embassy: TLShape | null;
  currentUserId: string | null;
};

const TldrawContext = createContext<TldrawContextType>({
  editor: null,
  setEditor: () => {},
  embassy: null,
  currentUserId: null,
});

export function useTldraw() {
  return useContext(TldrawContext);
}

export function TldrawProvider({ children }: { children: React.ReactNode }) {
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
    <TldrawContext.Provider
      value={{
        editor: editor,
        setEditor: setEditor,
        embassy: embassy,
        currentUserId: currentUserId,
      }}
    >
      {children}
    </TldrawContext.Provider>
  );
}
