"use client";

import Whiteboard from "@/app/components/Whiteboard";
import WalkieTalkie from "@/app/components/WalkieTalkie";
import { NpcProvider } from "@/app/components/npc-context";
import Sidebar from "./components/Sidebar";

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
      <div className="fixed overflow-hidden inset-0 flex flex-row h-full w-full flex-col sm:flex-row">
        <div className="grow">
          <Whiteboard />
        </div>
        <div className="grow-0 shrink-0 w-full sm:w-80 h-1/3 sm:h-full border-l border-neutral-200 pl-2">
          <Sidebar />
        </div>
      </div>
      <WalkieTalkie />
    </NpcProvider>
  );
}
