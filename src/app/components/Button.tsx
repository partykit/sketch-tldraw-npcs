export default function Button({
  onClick,
  disabled,
  children,
  bgColor = "bg-pink-200",
  bgColorHover = "bg-pink-300",
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
          hover:text-black/70 hover:${bgColorHover} hover:border-t-black/50 hover:border-l-black/50 hover:border-r-white/60 hover:border-b-white/60
          disabled:text-neutral-400 disabled:bg-neutral-200 disabled:hover:bg-neutral-200 disabled:border-neutral-200 disabled:cursor-not-allowed`}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
}
