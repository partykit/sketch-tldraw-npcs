import { useState, useRef, useEffect } from "react";
import { Editor, InstancePresenceRecordType, TLShapeId } from "@tldraw/tldraw";
import { useNpc } from "./npc-context";
import { POOL_RADIUS } from "./CreateEmbassy";

export default function CreateNpc() {
  const { editor, embassyId } = useNpc();
  const [showNpc, setShowNpc] = useState<boolean>(false);

  if (!editor) return null;
  if (!embassyId) return null;

  return (
    <button
      onClick={() => setShowNpc(true)}
      className="w-full outline outline-1 outline-neutral-200 bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200 disabled:cursor-not-allowed text-neutral-500 disabled:text-neutral-400 rounded-full p-2"
      disabled={showNpc === true}
    >
      Create NPC
      {showNpc && editor && (
        <>
          <span
            className="w-5 h-5 rounded-full inline-block ml-2 flex-inline justify-center items-center"
            style={{ backgroundColor: "#d9f3d6" }}
          >
            ✓
          </span>
          <NpcUser />
        </>
      )}
    </button>
  );
}

function NpcUser() {
  const { editor, embassyCentroid } = useNpc();
  const rRaf = useRef<any>(-1);
  const MOVING_CURSOR_SPEED = 0.3;
  const MOVING_CURSOR_RADIUS = POOL_RADIUS * 0.7;

  console.log(embassyCentroid);

  if (!editor) return null;
  if (!embassyCentroid) return null;

  const presence = InstancePresenceRecordType.create({
    id: InstancePresenceRecordType.createId(editor.store.id),
    currentPageId: editor.currentPageId,
    userId: "npc-dolphin",
    userName: "🐬", // dolphin emoji
    cursor: {
      x: embassyCentroid.x,
      y: embassyCentroid.y,
      type: "default",
      rotation: 0,
    },
    chatMessage: "eeee e ee",
    color: "#4aa181", //"#d9f3d6" is the completion color for AI. The darker is the button color
  });

  function loop() {
    if (!editor) return;
    if (!embassyCentroid) return;

    let cursor = presence.cursor;
    const now = Date.now();

    const k = 1000 / MOVING_CURSOR_SPEED;
    const t = (now % k) / k;

    cursor = {
      ...presence.cursor,
      x: embassyCentroid.x + Math.cos(t * Math.PI * 2) * MOVING_CURSOR_RADIUS,
      y: embassyCentroid.y + Math.sin(t * Math.PI * 2) * MOVING_CURSOR_RADIUS,
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

  useEffect(() => {
    if (!editor) return;
    editor.store.put([presence]);

    // Make the fake user's cursor rotate in a circle
    const raf = rRaf.current;
    cancelAnimationFrame(raf);

    if (MOVING_CURSOR_SPEED > 0) {
      rRaf.current = requestAnimationFrame(loop);
    } else {
      editor.store.put([{ ...presence, lastActivityTimestamp: Date.now() }]);
      rRaf.current = setInterval(() => {
        editor.store.put([{ ...presence, lastActivityTimestamp: Date.now() }]);
      }, 1000);
    }
  }, [editor]);

  return null;
}
