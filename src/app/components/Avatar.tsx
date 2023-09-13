import type { User } from "@/partykit/chat";
import CircularButton from "./CircularButton";

export default function Avatar({
  user,
  name,
  variant = "default",
}: {
  user: User;
  name?: string;
  variant?: "default" | "small";
}) {
  name =
    name ??
    (user.isAnonymous || !user.userName ? "" : Array.from(user.userName)[0]);

  return (
    <CircularButton
      text={name}
      color={user.color}
      borderColor={user.color}
      variant={variant}
    />
  );
}
