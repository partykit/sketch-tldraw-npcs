export default function NpcAvatar({
  text = "",
  className = "",
  variant = "default",
}: {
  text?: string;
  className?: string;
  variant?: "default" | "small";
}) {
  const sizeClasses =
    variant === "default"
      ? "w-12 h-12 text-3xl border-2 withShadow"
      : "w-8 h-8 text-sm border withShadow-sm";

  return (
    <div
      className={`rounded-full flex justify-center items-center border-black/30 ${sizeClasses} ${className}`}
      title={text}
    >
      {text}
    </div>
  );
}
