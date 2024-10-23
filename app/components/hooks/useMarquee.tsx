import {
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRef } from "react";
import { useScrollDirection } from "~/components/hooks/useScrollDirection";

export const useMarquee = (reversed: boolean = false) => {
  // Scroll direction
  const direction = useScrollDirection();
  // Movemennt 🛸
  const x = useMotionValue(0);
  const ref = useRef<HTMLDivElement>();
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
  const move = () => {
    // Magic 🎩🪄
    const factor = reversed ? direction * -1 : direction;
    const moveBy = factor * -velocityFactor.get();
    const rect1 = ref.current?.getBoundingClientRect();
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
  return { ref, x };
};
