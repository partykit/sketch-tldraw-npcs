import { useTldraw } from "@/app/hooks/tldraw-context";
import NpcAvatar from "./NpcAvatar";
import Button from "@/app/components/Button";
import { NPCState } from "@/partykit/utils/npc";
import * as Popover from "@radix-ui/react-popover";

export default function Avatar({
  sidebarEl,
}: {
  sidebarEl: HTMLDivElement | null;
}) {
  const { npcPainter: npc } = useTldraw();
  if (!npc) return null;

  return (
    <Popover.Root>
      <Popover.Trigger>
      <div className="relative"><NpcAvatar text={npc.shortName} className={npc.className} />
        {npc.npcState === NPCState.Painting && <div className={`absolute top-0 right-0 w-full h-full rounded-full animate-ping ${npc.className}`}></div>}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded-sm m-2 bg-white with-shadow w-64 text-sm bg-white"
          collisionBoundary={sidebarEl}
          collisionPadding={{ left: 6, right: 6 }}
        >
          <Button
            className={npc.className}
            onClick={() => {
              npc.send({
                type: "paint",
              });
            }}
            disabled={npc.npcState !== NPCState.Painting}
          >
            I can paint that!
          </Button>

          <Popover.Arrow width={20} height={10} style={{ fill: "white" }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
