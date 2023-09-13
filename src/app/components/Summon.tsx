import CircularButton from "./CircularButton";
import CreateEmbassy from "./CreateEmbassy";
import { useTldraw } from "@/app/hooks/tldraw-context";
import { Npc } from "@/app/hooks/useNpc";
import Button from "./Button";
import * as Popover from "@radix-ui/react-popover";
import { NPCState } from "@/partykit/utils/npc";
import { TLPageId } from "@tldraw/tldraw";

function SummonButton({
  npc,
  pageId,
}: {
  npc: Npc | null;
  pageId: TLPageId | null;
}) {
  if (!npc) return null;
  if (!pageId) return null;

  if (npc.npcState === NPCState.Idle) return null;

  return (
    <Button
      onClick={() => npc.summon(pageId)}
      bgColor={npc.colorClass}
      bgColorHover={npc.hoverColorClass}
    >
      <CircularButton
        text={npc.shortName}
        borderColor="green"
        color="green"
        variant="small"
      />
      Summon!
    </Button>
  );
}

export default function Summon({
  sidebarEl,
}: {
  sidebarEl: HTMLDivElement | null;
}) {
  const { npcPoet, npcPainter, npcMaker, editor } = useTldraw();

  const pageId = editor?.currentPageId ?? null;

  return (
    <Popover.Root>
      <Popover.Trigger>
        <CircularButton text="＋" borderColor="green" color="green" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded-sm m-2 bg-white withShadow w-64 text-sm bg-neutral-300"
          collisionBoundary={sidebarEl}
          collisionPadding={{ left: 6, right: 6 }}
        >
          <CreateEmbassy />
          <SummonButton npc={npcPoet} pageId={pageId} />
          <SummonButton npc={npcPainter} pageId={pageId} />
          <SummonButton npc={npcMaker} pageId={pageId} />
          <Popover.Arrow width={20} height={10} style={{ fill: "white" }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
