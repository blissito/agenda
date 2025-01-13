import { motion, useAnimationControls } from "framer-motion";
import { type ReactNode, useEffect, useRef } from "react";

export const MovingBorder = ({ children }: { children?: ReactNode }) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const controls = useAnimationControls();

  const move = async () => {
    await controls.start({ x: "101.3%" }, { ease: "linear", duration: 0.5 });
    await controls.start({ y: "14%" }, { ease: "linear", duration: 0.5 });
    await controls.start({ x: 0 }, { ease: "linear", duration: 0.5 });
    await controls.start({ y: 0 }, { ease: "linear", duration: 0.5 });
    await move();
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
      <div className="-inset-0 absolute bg-gray-950 z-10 rounded-full border border-gray-100/10" />
      <motion.div
        className="h-[90%] w-[50%] absolute bg-gradient-to-r from-pink-500 to-indigo-500 z-0 rounded-full -inset-px"
        animate={controls}
      />
      <div className="relative z-10">{children}</div>
    </motion.button>
  );
};
