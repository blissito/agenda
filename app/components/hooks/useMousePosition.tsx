import { useMotionValue } from "motion/react";
import { useRef, useState } from "react";

export const useMousePosition = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const target = useRef<HTMLElement>(null);
  function handleMouseMove({
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!target.current) return;
    const { left, top, width } = target.current.getBoundingClientRect();
    mouseX.set(Number((clientX - left).toFixed(0))); // x inside
    mouseY.set(Number((clientY - top).toFixed(0))); // y inside
    setTargetWidth(width);
  }
  return {
    handleMouseMove,
    mouseX,
    mouseY,
    targetWidth,
    target,
  };
};
