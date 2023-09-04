export default function Button({
  onClick,
  disabled,
  children,
  bgColor = "bg-neutral-200",
  bgColorHover = "hover:bg-neutral-400",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  bgColor?: string;
  bgColorHover?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-sm p-2 font-mono
          text-black/60 border-4
          ${bgColor} border-t-white/70 border-l-white/70 border-r-black/50 border-b-black/50
          hover:text-black/70 ${bgColorHover} hover:border-t-black/50 hover:border-l-black/50 hover:border-r-white/60 hover:border-b-white/60
          disabled:text-neutral-500/80 disabled:bg-transparent disabled:hover:bg-transparent disabled:border-transparent disabled:cursor-not-allowed`}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
}
