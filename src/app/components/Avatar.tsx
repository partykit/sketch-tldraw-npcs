import type { User } from "@/partykit/chat";

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

  const styles = {
    borderColor: user.color,
    color: user.color,
  };

  const sizeClasses =
    variant === "default"
      ? "w-12 h-12 text-xl border-2"
      : "w-8 h-8 text-sm border";

  return (
    <div
      className={`rounded-full bg-white flex justify-center items-center ${sizeClasses}`}
      style={styles}
      title={user.userId}
    >
      {name}
    </div>
  );
}
