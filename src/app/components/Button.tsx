export default function Button({
  onClick,
  disabled,
  children,
  className = "bg-neutral-200 hover:bg-neutral-400",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-sm p-2 font-mono
          text-black/60 border-4
          ${className} border-t-white/70 border-l-white/70 border-r-black/50 border-b-black/50
          hover:text-black/70 hover:border-t-black/50 hover:border-l-black/50 hover:border-r-white/60 hover:border-b-white/60
          disabled:text-neutral-500/80 disabled:bg-transparent disabled:hover:bg-transparent disabled:border-transparent disabled:cursor-not-allowed
          flex justify-center items-center gap-2`}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
}
