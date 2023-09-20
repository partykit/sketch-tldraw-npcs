import { useTldraw } from "@/app/hooks/tldraw-context";
import NpcAvatar from "./NpcAvatar";
import Button from "@/app/components/Button";
import * as Popover from "@radix-ui/react-popover";

export default function Avatar({
  sidebarEl,
}: {
  sidebarEl: HTMLDivElement | null;
}) {
  const { npcPoet: npc } = useTldraw();
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
          <Button
            className={npc.className}
            onClick={() => {
              npc.send({
                type: "animate",
                radius: 50,
              });
            }}
          >
            Circle
          </Button>
          <Button
            className={npc.className}
            onClick={() => {
              npc.send({
                type: "compose",
              });
            }}
          >
            Compose a haiku
          </Button>

          <Popover.Arrow width={20} height={10} style={{ fill: "white" }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
