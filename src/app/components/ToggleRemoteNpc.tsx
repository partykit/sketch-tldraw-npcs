import { useEffect, useState } from "react";
import usePartySocket from "partysocket/react";
import { useNpc } from "./npc-context";

import type {
  InitMessage,
  AnimateMessage,
  ComposeMessage,
} from "@/partykit/npc-poet";

export default function ToggleRemoteNpc() {
  const { editor, embassyCentroid } = useNpc();
  const [isActive, setIsActive] = useState(false);

  const socket = usePartySocket({
    host: "127.0.0.1:1999",
    party: "npcPoet",
    room: "dolphin-example",
    startClosed: true,
  });

  useEffect(() => {
    if (!editor) return;
    if (!embassyCentroid) return;

    if (isActive) {
      socket.reconnect();
      socket.send(
        JSON.stringify({
          type: "init",
          pageId: editor.currentPageId,
          embassyX: embassyCentroid.x,
          embassyY: embassyCentroid.y,
        } as InitMessage)
      );
    } else {
      socket.close();
    }
  }, [isActive, editor, embassyCentroid]);

  if (!editor) return null;
  if (!embassyCentroid) return null;

  return (
    <>
      <button
        onClick={() => setIsActive((prev) => !prev)}
        className="w-full rounded-full p-2
            outline outline-1 outline-neutral-200
            bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200
            disabled:cursor-not-allowed
            text-neutral-500 disabled:text-neutral-400"
      >
        {isActive ? "😀 Remote NPC is active" : "❌ Remote NPC is inactive"}
      </button>
      {isActive && (
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({
                type: "animate",
                x: embassyCentroid.x,
                y: embassyCentroid.y,
                radius: 50,
              } as AnimateMessage)
            );
          }}
          className="w-full rounded-full p-2
          outline outline-1 outline-neutral-200
          bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200
          disabled:cursor-not-allowed
          text-neutral-500 disabled:text-neutral-400"
        >
          Animate NPC
        </button>
      )}
      {isActive && (
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({
                type: "compose",
                x: embassyCentroid.x,
                y: embassyCentroid.y,
              } as ComposeMessage)
            );
          }}
          className="w-full rounded-full p-2
          outline outline-1 outline-neutral-200
          bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200
          disabled:cursor-not-allowed
          text-neutral-500 disabled:text-neutral-400"
        >
          Compose Poem
        </button>
      )}
      {isActive && (
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({
                type: "banish",
              })
            );
          }}
          className="w-full rounded-full p-2
          outline outline-1 outline-neutral-200
          bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200
          disabled:cursor-not-allowed
          text-neutral-500 disabled:text-neutral-400"
        >
          Banish
        </button>
      )}
    </>
  );
}
