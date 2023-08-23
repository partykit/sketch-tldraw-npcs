"use client";

/*
 *
 * Makes the TLDraw Editor available to the rest of the app.
 *
 */

import { createContext, useContext, useState, useRef, useEffect } from "react";
import { Editor, InstancePresenceRecordType } from "@tldraw/tldraw";

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
      {editor && <NpcUser editor={editor} />}
    </NpcContext.Provider>
  );
}

function NpcUser(props: { editor: Editor }) {
  const editor = props.editor;
  const rRaf = useRef<any>(-1);
  const MOVING_CURSOR_SPEED = 0.1;
  const MOVING_CURSOR_RADIUS = 50;

  const presence = InstancePresenceRecordType.create({
    id: InstancePresenceRecordType.createId(editor.store.id),
    currentPageId: editor.currentPageId,
    userId: "npc-dolphin",
    userName: "🐬", // dolphin emoji
    cursor: { x: 0, y: 0, type: "default", rotation: 0 },
    chatMessage: "eeee e ee",
    color: "#4aa181", //"#d9f3d6" is the completion color for AI. The darker is the button color
  });

  editor.store.put([presence]);

  // Make the fake user's cursor rotate in a circle
  const raf = rRaf.current;
  cancelAnimationFrame(raf);

  function loop() {
    let cursor = presence.cursor;
    const now = Date.now();

    const k = 1000 / MOVING_CURSOR_SPEED;
    const t = (now % k) / k;

    cursor = {
      ...presence.cursor,
      x: 150 + Math.cos(t * Math.PI * 2) * MOVING_CURSOR_RADIUS,
      y: 150 + Math.sin(t * Math.PI * 2) * MOVING_CURSOR_RADIUS,
    };

    editor.store.put([
      {
        ...presence,
        cursor,
        lastActivityTimestamp: now,
      },
    ]);

    rRaf.current = requestAnimationFrame(loop);
  }

  if (MOVING_CURSOR_SPEED > 0) {
    rRaf.current = requestAnimationFrame(loop);
  } else {
    editor.store.put([{ ...presence, lastActivityTimestamp: Date.now() }]);
    rRaf.current = setInterval(() => {
      editor.store.put([{ ...presence, lastActivityTimestamp: Date.now() }]);
    }, 1000);
  }

  return null;
}
