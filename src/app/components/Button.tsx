export default function Button({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-sm p-2 font-mono
          text-neutral-500 border-4
          bg-neutral-200 border-t-white border-l-white border-r-neutral-500 border-b-neutral-500
          hover:text-neutral-600 hover:bg-neutral-300 hover:border-t-neutral-500 hover:border-l-neutral-500 hover:border-r-white hover:border-b-white
          disabled:text-neutral-400 disabled:bg-neutral-200 disabled:hover:bg-neutral-200 disabled:border-neutral-200 disabled:cursor-not-allowed"
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
}
