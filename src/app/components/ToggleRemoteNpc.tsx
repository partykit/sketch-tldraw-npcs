import { useEffect, useState } from "react";
import usePartySocket from "partysocket/react";

export default function ToggleRemoteNpc() {
  const [isActive, setIsActive] = useState(false);

  const socket = usePartySocket({
    host: "127.0.0.1:1999",
    party: "npcPoet",
    room: "dolphin-example",
    startClosed: true,
  });

  useEffect(() => {
    if (isActive) {
      socket.reconnect();
    } else {
      socket.close();
    }
  }, [isActive]);

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
    </>
  );
}
