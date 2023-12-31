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
      ? "w-12 h-12 text-xl border-2 with-shadow"
      : "w-8 h-8 text-sm border with-shadow-sm";

  return (
    <div
      className={`rounded-full bg-white flex justify-center items-center ${sizeClasses}`}
      style={styles}
    >
      {text}
    </div>
  );
}
