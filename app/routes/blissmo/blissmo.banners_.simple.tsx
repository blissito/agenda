import {
  useMotionValue,
  motion,
  useAnimationFrame,
  useScroll,
  useMotionValueEvent,
  useTransform,
  useVelocity,
  useSpring,
} from "framer-motion";
import { type ReactNode, useRef } from "react";
import { twMerge } from "tailwind-merge";

export default function Route() {
  return (
    <>
      <div className="h-[60vh] bg-indigo-500" />
      <Marquee>
        🪄 Lorem ipsum blissmo <span>🤓</span> perro mijo otro <span>🏴</span>{" "}
        text un poco <span>🤩</span>
      </Marquee>
      <Marquee reversed className="bg-indigo-500">
        🪄 Lorem ipsum blissmo <span>🤓</span> perro mijo otro <span>🏴</span>{" "}
        text un poco <span>🤩</span>
      </Marquee>
      <div className="h-[60vh] bg-gray-800" />
    </>
  );
}

const Marquee = ({
  children,
  className,
  reversed,
}: {
  reversed?: boolean;
  className?: string;
  children?: ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>();
  const x = useMotionValue(-200);
  // scroll direction
  const { scrollY } = useScroll();
  const prevScroll = useRef(0);
  const direction = useRef(1);
  useMotionValueEvent(scrollY, "change", (latest) => {
    direction.current = latest > prevScroll.current ? 1 : -1;
    prevScroll.current = latest;
  });
  // velocity
  const scrollVelocity = useVelocity(scrollY);
  const smoothScrollVelocity = useSpring(scrollVelocity, { bounce: 0 });
  const scrollFactor = useTransform(
    smoothScrollVelocity,
    [-600, 0, 600],
    [10, 1, 10]
  );

  const move = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const factor =
      (reversed ? -1 : 1) * direction.current * -scrollFactor.get();
    x.set(x.get() + factor);
    // correction
    // right
    if (x.get() > 0) {
      x.jump(-rect.width / 2);
      return;
    }
    if (x.get() < -rect.width / 2) {
      x.jump(0);
    }
  };

  useAnimationFrame(move); // loop

  return (
    <article className={twMerge("bg-gray-800 py-2 overflow-hidden", className)}>
      <motion.div
        ref={ref}
        style={{ x }}
        className="whitespace-nowrap text-6xl font-sans font-extrabold text-white w-min"
      >
        {children} {children}
      </motion.div>
    </article>
  );
};
