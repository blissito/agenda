import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { ReactNode, useRef } from "react";
import { useScrollDirection } from "~/components/hooks/useScrollDirection";
import { cn } from "~/utils/cd";

export const Marquee = ({
  children,
  reversed,
  className = "bg-gray-800 ",
}: {
  className?: string;
  reversed?: boolean;
  children?: ReactNode;
}) => {
  // Scroll direction
  const direction = useScrollDirection();
  // Movemennt 🛸
  const x = useMotionValue(0);
  const ref1 = useRef<HTMLDivElement>();
  // valocity
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    bounce: 0,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    [-600, 0, 600],
    [10, 1, 10]
  );
  const move = (_, d) => {
    // Magic 🎩🪄
    const factor = reversed ? direction * -1 : direction;
    const moveBy = factor * -velocityFactor.get();
    const rect1 = ref1.current?.getBoundingClientRect();
    const v = x.get();
    x.set(v + moveBy); // add
    if (rect1 && v > 0) {
      x.set(-rect1.width / 2);
      return;
    }
    if (rect1 && v < -(rect1.width / 2)) {
      x.set(0);
      return;
    }
  };
  useAnimationFrame(move);

  return (
    <>
      <article className={cn("flex justify-center items-center", className)}>
        <div className="h-20 flex items-center text-gray-100 text-6xl font-extrabold overflow-hidden">
          <motion.div style={{ x }} className="whitespace-nowrap" ref={ref1}>
            {children} {children}
          </motion.div>
        </div>
      </article>
    </>
  );
};
