import { cn } from "~/utils/cn";

export const ColorCube = ({
  className,
  onClick,
  style,
  hexColor = "#bb333c",
}: {
  onClick?: () => void;
  style?: { backgroundColor: string };
  className?: string;
  hexColor?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-4 h-4 rounded cursor-pointer",
      `bg-[${hexColor}]`,
      className
    )}
    style={{
      backgroundColor: hexColor,
      ...style,
    }}
  />
);
