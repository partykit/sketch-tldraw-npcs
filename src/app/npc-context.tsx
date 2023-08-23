"use client";

/*
 *
 * Makes the TLDraw Editor available to the rest of the app.
 *
 */

import { createContext, useContext, useState } from "react";
import { Editor } from "@tldraw/tldraw";

type NpcContextType = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
};

const NpcContext = createContext<NpcContextType>({
  editor: null,
  setEditor: () => {},
});

export function useNpc() {
  return useContext(NpcContext);
}

export function NpcProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);

  return (
    <NpcContext.Provider value={{ editor: editor, setEditor: setEditor }}>
      {children}
    </NpcContext.Provider>
  );
}
