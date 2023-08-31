"use client";

import Whiteboard from "@/app/components/Whiteboard";
import WalkieTalkie from "@/app/components/WalkieTalkie";
import { NpcProvider } from "@/app/components/npc-context";

/*export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between p-6 bg-neutral-200 gap-4">
      <h1 className="text-4xl font-bold">Hello, Dolphin 🐬</h1>
      <div className="grow w-full flex flex-row space-x-4 justify-between">
        <NpcProvider>
          <div className="w-full rounded overflow-clip drop-shadow-lg">
            <Whiteboard />
          </div>
          <div className="grow-0 shrink-0 w-60">
            <Debug />
          </div>
        </NpcProvider>
      </div>
    </main>
  );
}*/

export default function Home() {
  return (
    <NpcProvider>
      <Whiteboard />
      <WalkieTalkie />
    </NpcProvider>
  );
}
