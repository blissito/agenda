import { useState, type MouseEvent, type CSSProperties } from "react";

type Use3DHoverReturn = {
  onMouseMove: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  style: CSSProperties;
};

export const use3DHover = (): Use3DHoverReturn => {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setTransform({ rotateX, rotateY });
  };

  const onMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
  };

  const style: CSSProperties = {
    transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
    transition: "transform 0.1s ease-out",
  };

  return {
    onMouseMove,
    onMouseLeave,
    style,
  };
};
