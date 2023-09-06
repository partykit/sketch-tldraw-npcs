import { useState } from "react";

export default function ChatInput({
  sendMessage,
}: {
  sendMessage: (name: string) => void;
}) {
  const [messageInput, setMessageInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput) return;
    sendMessage(messageInput);
    setMessageInput("");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full justify-between items-center gap-4"
    >
      <input
        type="text"
        placeholder="Enter a message..."
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        className="border border-stone-300 p-2 grow"
      />
      <button
        type="submit"
        className="border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 p-2 whitespace-nowrap"
      >
        Send
      </button>
    </form>
  );
}
