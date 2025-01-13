export default function Route() {
  return (
    <article className="bg-gray-950 h-screen flex items-center justify-center">
      <MovingBorder>Puchale aquí mijo </MovingBorder>
    </article>
  );
}

import { motion, useAnimationControls } from "framer-motion";
import { type ReactNode, useEffect, useRef } from "react";

export const MovingBorder = ({ children }: { children?: ReactNode }) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const controls = useAnimationControls();

  const move = async () => {
    await controls.start(
      { scale: 1.2, filter: "blur(8px)" },
      { ease: "easeInOut", duration: 4 }
    );
    await controls.start({ scale: 0.7 }, { ease: "easeInOut", duration: 2 });

    move();
  };

  useEffect(() => {
    move();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.button
      whileTap={{ scale: 1.02 }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="text-white uppercase bg-transparent text-2xl font-bold relative p-6 rounded-full"
      ref={containerRef}
    >
      <motion.div
        className="h-[100%] w-[100%] absolute bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full inset-0"
        animate={controls}
        initial={{ scale: 1, filter: "blur(4px)" }}
      />
      <div className="-inset-0 absolute bg-gray-950 rounded-full border border-gray-100/10" />

      <div className="relative z-10">{children}</div>
    </motion.button>
  );
};
