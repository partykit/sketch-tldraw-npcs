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

  return (
    <Button onClick={() => npc.summon(pageId)} className={npc.className}>
      Summon <span className="italic">{npc.name}</span>
    </Button>
  );
}

export default function Summon({
  sidebarEl,
}: {
  sidebarEl: HTMLDivElement | null;
}) {
  const { npcPoet, npcPainter, npcMaker, editor, embassy } = useTldraw();

  const pageId = editor?.currentPageId ?? null;

  const summoningButtons = [
    npcPoet?.npcState === NPCState.NotConnected ? (
      <SummonButton npc={npcPoet} pageId={pageId} />
    ) : null,
    npcPainter?.npcState === NPCState.NotConnected ? (
      <SummonButton npc={npcPainter} pageId={pageId} />
    ) : null,
    npcMaker?.npcState === NPCState.NotConnected ? (
      <SummonButton npc={npcMaker} pageId={pageId} />
    ) : null,
  ].filter((el) => el !== null);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <CircularButton text="＋" borderColor="green" color="green" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded-sm m-2 bg-white with-shadow w-64 text-sm bg-white"
          collisionBoundary={sidebarEl}
          collisionPadding={{ left: 6, right: 6 }}
        >
          <CreateEmbassy />
          {embassy && (
            <>
              {summoningButtons.map((button) => button)}
              {summoningButtons.length === 0 && (
                <Button onClick={() => {}} disabled={true}>
                  No more NPCs
                </Button>
              )}
            </>
          )}
          <Popover.Arrow width={20} height={10} style={{ fill: "white" }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
