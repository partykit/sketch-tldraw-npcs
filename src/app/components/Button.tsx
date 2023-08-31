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
      className="w-full rounded-full p-2
          outline outline-1 outline-neutral-200
          bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200
          disabled:cursor-not-allowed
          text-neutral-500 disabled:text-neutral-400"
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
}
