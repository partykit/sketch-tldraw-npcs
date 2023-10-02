import { useTldraw } from "@/app/hooks/tldraw-context";
import NpcAvatar from "./NpcAvatar";
import * as Popover from "@radix-ui/react-popover";
import NpcMakerDrawButton from "./NpcMakerDrawButton";

export default function Avatar({
  sidebarEl,
}: {
  sidebarEl: HTMLDivElement | null;
}) {
  const { npcMaker: npc } = useTldraw();
  if (!npc) return null;

  const submitPrompt = (prompt: string) => {
    npc.send({
      type: "boxes",
      prompt,
    });
  };

  if (!npc) return null;

  return (
    <Popover.Root>
      <Popover.Trigger>
        <NpcAvatar text={npc.shortName} className={npc.className} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded-sm m-2 bg-white with-shadow w-64 text-sm bg-white"
          collisionBoundary={sidebarEl}
          collisionPadding={{ left: 6, right: 6 }}
        >
          <NpcMakerDrawButton submitPrompt={submitPrompt} />

          <Popover.Arrow width={20} height={10} style={{ fill: "white" }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
