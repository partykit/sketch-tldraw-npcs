"use client";

import "./walkie-talkie.styles.css";

import { useNpc } from "./npc-context";

import CreateEmbassy from "./CreateEmbassy";
import NpcPoet from "./NpcPoet";
import NpcPainter from "./NpcPainter";
import NpcMaker from "./NpcMaker";

export default function Debug() {
  const { editor, embassy } = useNpc();
  return (
    <div className="fixed w-56 top-14 left-2 z-10">
      <section className="xmetal xlinear bg-gradient-to-r from-stone-200 to-stone-400 flex flex-col gap-2 justify-start items-start shadow-lg shadow-cyan-300/50 outline outline-1 outline-neutral-200 w-full text-sm text-neutral-500">
        <h1 className="w-full text-center uppercase tracking-widest text-lg font-semibold py-4 font-mono text-neutral-600 [text-shadow:_0_2px_0_rgb(255_255_255_/_50%)]">
          Dolphin Comms
        </h1>
        {/*<p>Got editor: {editor === null ? "No" : "Yes"} </p>*/}
        {!embassy && <CreateEmbassy />}
        <NpcPoet />
        <NpcPainter />
        <NpcMaker />
      </section>
    </div>
  );
}
