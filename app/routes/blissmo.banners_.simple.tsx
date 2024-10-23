import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";
export default function Route() {
  return (
    <Marquee>
      Lorem ipsum blissmo perro mijo otro text un poco más grande
    </Marquee>
  );
}

const Marquee = ({ children }: { children?: ReactNode }) => {
  const x = useMotionValue(0);
  const ref1 = useRef<HTMLDivElement>();

  const move = () => {
    // Magic 🎩🪄
    const rect1 = ref1.current?.getBoundingClientRect();
    const v = x.get();
    x.set(v + 2); // add
    if (rect1 && v > 0) {
      x.set(-rect1.width / 2);
    }
  };

  useAnimationFrame(move);

  return (
    <article className=" h-screen flex justify-center items-center ">
      <div className="bg-blue-500 h-20 flex items-center text-white text-6xl font-extrabold overflow-hidden w-min">
        <motion.div style={{ x }} className="whitespace-nowrap" ref={ref1}>
          {children} {children}
        </motion.div>
      </div>
    </article>
  );
};
