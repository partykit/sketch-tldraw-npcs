import CircularButton from "./CircularButton";
import CreateEmbassy from "./CreateEmbassy";
import * as Popover from "@radix-ui/react-popover";

export default function Summon({
  sidebarEl,
}: {
  sidebarEl: HTMLDivElement | null;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <CircularButton text="＋" borderColor="green" color="green" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded-sm p-4 m-2 bg-white withShadow w-64"
          collisionBoundary={sidebarEl}
          collisionPadding={{ left: 6, right: 6 }}
        >
          <CreateEmbassy />
          <Popover.Arrow width={20} height={10} style={{ fill: "white" }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
