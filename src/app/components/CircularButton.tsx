export default function CircularButton({
  text = "",
  color = "black",
  borderColor = "black",
  variant = "default",
}: {
  text?: string;
  color?: string;
  borderColor?: string;
  variant?: "default" | "small";
}) {
  const styles = {
    color: color,
    borderColor: borderColor,
  };

  const sizeClasses =
    variant === "default"
      ? "w-12 h-12 text-xl border-2"
      : "w-8 h-8 text-sm border";

  return (
    <div
      className={`rounded-full bg-white flex justify-center items-center withShadow ${sizeClasses}`}
      style={styles}
      title={text}
    >
      {text}
    </div>
  );
}
