import "./walkie-talkie.styles.css";

import { useNpc } from "./npc-context";

import CreateEmbassy from "./CreateEmbassy";
import NpcPoet from "./NpcPoet";
import NpcPainter from "./NpcPainter";

export default function Debug() {
  const { editor, embassy } = useNpc();
  return (
    <div className="fixed w-56 top-14 left-2 z-10">
      <section className="bg-neutral-300 flex flex-col gap-2 justify-start items-start shadow-lg shadow-cyan-300/50 outline outline-1 outline-neutral-200 w-full text-sm text-neutral-500">
        <h1 className="w-full text-center uppercase tracking-widest text-lg font-semibold py-4 font-mono">
          Walkie Talkie
        </h1>
        {/*<p>Got editor: {editor === null ? "No" : "Yes"} </p>*/}
        {!embassy && <CreateEmbassy />}
        <NpcPoet />
        <NpcPainter />
      </section>
    </div>
  );
}
