import type { User } from "@/partykit/chat";
import Avatar from "./Avatar";
import * as Popover from "@radix-ui/react-popover";

export default function FacePile({
  otherUsers,
  currentUser,
}: {
  otherUsers: User[];
  currentUser: User | null;
}) {
  const style = {
    boxShadow: "-4px 4px 0px 0px rgba(0, 0, 0, 0.3)",
  };

  return (
    <div className="flex flex-row -space-x-4 justify-end items-center pr-3">
      {otherUsers.map((user) => (
        <Avatar user={user} key={user.id} />
      ))}
      {currentUser && (
        <Popover.Root>
          <Popover.Trigger>
            <Avatar user={currentUser} key={currentUser.id} name="Me" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={-1}
              className="rounded-sm p-4 m-2 bg-white withShadow w-72"
            >
              Some more info…
              <Popover.Arrow width={20} height={10} style={{ fill: "white" }} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}
