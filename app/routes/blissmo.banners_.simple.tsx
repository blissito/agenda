import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useScrollDirection } from "~/components/hooks/useScrollDirection";
import { cn } from "~/utils/cd";
export default function Route() {
  return (
    <>
      <div className="h-[60vh] bg-indigo-950" />
      <Marquee>
        🪄 Lorem ipsum blissmo <span>🤓</span> perro mijo otro <span>🏴</span>{" "}
        text un poco <span>🤩</span>
      </Marquee>
      <Marquee reversed className="bg-indigo-950">
        🪄 Lorem ipsum blissmo <span>🤓</span> perro mijo otro <span>🏴</span>{" "}
        text un poco <span>🤩</span>
      </Marquee>
      <div className="h-[60vh] bg-gray-800" />
    </>
  );
}

const Marquee = ({
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
  const move = () => {
    // Magic 🎩🪄
    const rect1 = ref1.current?.getBoundingClientRect();
    const factor = reversed ? direction * -1 : direction;
    const v = x.get();
    x.set(v + 1 * factor); // add
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
