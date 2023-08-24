import { useNpc } from "./npc-context";

import CreateEmbassy from "./CreateEmbassy";
import CreateNpc from "./CreateNpc";
import ToggleRemoteNpc from "./ToggleRemoteNpc";

export default function Debug() {
  const { editor } = useNpc();
  return (
    <section className="flex flex-col gap-4 justify-start items-start p-2 rounded-sm bg-neutral-100 outline outline-1 outline-neutral-200 w-full text-sm text-neutral-500">
      <h1 className="uppercase tracking-widest font-medium">Debug</h1>
      <p>Got editor: {editor === null ? "No" : "Yes"} </p>
      <CreateEmbassy />
      <CreateNpc />
      <ToggleRemoteNpc />
    </section>
  );
}
