import { useNpc } from "./npc-context";

export default function Debug() {
  const { editor } = useNpc();
  return (
    <section className="flex flex-col gap-1 justify-start items-start p-4 rounded-sm bg-neutral-100 outline outline-1 outline-neutral-200 w-full text-sm text-neutral-500">
      <h1 className="uppercase tracking-widest font-medium">Debug</h1>
      <p>Got editor: {editor === null ? "No" : "Yes"} </p>
    </section>
  );
}
