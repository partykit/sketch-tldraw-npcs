import type { User } from "@/partykit/chat";
import Avatar from "./Avatar";

export default function FacePile({
  otherUsers,
  currentUser,
}: {
  otherUsers: User[];
  currentUser: User | null;
}) {
  console.log("FacePile", otherUsers, currentUser);
  return (
    <div className="flex flex-row -space-x-4 justify-end items-center pr-3">
      {otherUsers.map((user) => (
        <Avatar user={user} key={user.id} />
      ))}
      {currentUser && (
        <Avatar user={currentUser} key={currentUser.id} name="Me" />
      )}
    </div>
  );
}
