"use client";

import Whiteboard from "@/app/components/Whiteboard";
import WalkieTalkie from "@/app/components/WalkieTalkie";
import { TldrawProvider } from "@/app/hooks/tldraw-context";
import Sidebar from "./components/Sidebar";

const style = {
  boxShadow: "inset 5px 0px 0px 0px rgba(0, 0, 0, 0.4)",
};

export default function Home() {
  return (
    <TldrawProvider>
      <div className="fixed overflow-hidden inset-0 flex flex-row h-full w-full flex-col sm:flex-row bg-blue-300">
        <div className="grow">
          <Whiteboard />
        </div>
        <div
          className="grow-0 shrink-0 w-full sm:w-80 h-1/3 sm:h-full border-l border-neutral-200 pl-2"
          style={style}
        >
          <Sidebar />
        </div>
      </div>
    </TldrawProvider>
  );
}
