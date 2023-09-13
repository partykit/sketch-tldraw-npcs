import { useTldraw } from "@/app/hooks/tldraw-context";
import NpcAvatar from "./NpcAvatar";

export default function Avatar() {
  const { npcMaker: npc } = useTldraw();
  if (!npc) return null;

  return <NpcAvatar text={npc.shortName} className={npc.className} />;
}
