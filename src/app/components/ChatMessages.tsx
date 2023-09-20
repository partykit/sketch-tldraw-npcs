import type { ChatMessage } from "./Sidebar";
import Avatar from "./Avatar";

export default function ChatMessages({
  messages,
  currentUserId,
}: {
  messages: ChatMessage[];
  currentUserId: string | null;
}) {
  return (
    <ul className="flex flex-col gap-2 items-start">
      {messages.map((msg, i) => {
        const isCurrentUser = msg.user.userId === currentUserId;
        return (
          <li
            key={i}
            className={`flex flex-row gap-2 w-full items-center ${
              isCurrentUser ? "flex-row-reverse" : ""
            }`}
          >
            <Avatar
              user={msg.user}
              variant="small"
              name={isCurrentUser ? "Me" : undefined}
            />
            <span
              className={`text-black px-3 py-1 rounded-full ${
                isCurrentUser ? "bg-green-100" : "bg-neutral-100"
              }`}
            >
              {msg.text}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
