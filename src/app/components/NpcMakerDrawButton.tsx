import { useState, useRef, useEffect } from "react";
import Button from "./Button";

export default function NpcMakerDrawButton({
  submitPrompt,
}: {
  submitPrompt: (prompt: string) => void;
}) {
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const [showBoxesPromptInput, setShowBoxesPromptInput] =
    useState<boolean>(false);
  const [boxesPrompt, setBoxesPrompt] = useState<string>("");

  // When textarea appears, set the focus
  useEffect(() => {
    if (!promptInputRef.current) return;
    if (showBoxesPromptInput) {
      promptInputRef.current.focus();
    }
  }, [showBoxesPromptInput, promptInputRef.current]);

  // When the textarea is visible, hitting 'escape' will hide it, and hitting enter will submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setShowBoxesPromptInput(false);
      setBoxesPrompt("");
    } else if (e.key === "Enter") {
      promptInputRef.current?.blur();
      submitPrompt(boxesPrompt);
      setShowBoxesPromptInput(false);
      setBoxesPrompt("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitPrompt(boxesPrompt);
    setShowBoxesPromptInput(false);
    setBoxesPrompt("");
  };

  return (
    <>
      {!showBoxesPromptInput && (
        <Button
          bgColor="bg-cyan-200"
          bgColorHover="hover:bg-cyan-300"
          onClick={() => setShowBoxesPromptInput(true)}
        >
          Draw...
        </Button>
      )}
      {showBoxesPromptInput && (
        <form
          className="flex flex-col w-full justify-item items-start"
          onSubmit={handleSubmit}
        >
          <textarea
            ref={promptInputRef}
            onKeyDown={handleKeyDown}
            value={boxesPrompt}
            onChange={(e) => setBoxesPrompt(e.target.value)}
            className="w-full p-2 text-lg bg-cyan-100 text-cyan-700 font-mono"
          />
        </form>
      )}
    </>
  );
}
