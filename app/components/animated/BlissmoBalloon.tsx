import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { nanoid } from "nanoid";

const DELAY = 0.03;

export const BlissmoBalloon = () => {
  const [blissmo, setBlissmo] = useState(["B", "l", "i", "s", "s", "m", "o"]);

  const replaceNodes = () => {
    const nodes = blissmo.map((letter, i) => (
      <motion.span
        transition={{ type: "spring", bounce: 0.6, delay: DELAY * i }}
        initial={{
          opacity: 0,
          filter: "blur(4px)",
          y: "50%",
          rotateZ: 0,
          scale: 0.5,
        }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          rotateZ: i % 2 === 0 ? 10 : -10,
          scale: 1.1,
        }}
        key={nanoid()}
      >
        {letter}
      </motion.span>
    ));
    setBlissmo(nodes);
  };

  useEffect(() => {
    replaceNodes();
  }, []);

  return (
    <button className="relative" onClick={replaceNodes}>
      <h1 className="text-indigo-700 text-[12rem] font-balloon flex">
        {blissmo}
      </h1>
      <motion.img
        key={nanoid()}
        transition={{ duration: 1, delay: 0.3 }}
        initial={{ clipPath: "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)" }}
        animate={{ clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)" }}
        className="-mt-[140px] relative z-10"
        src="https://www.joyforjs.com/images/joy-for-js/for-js-devs-curved.png"
        alt="text"
      />
    </button>
  );
};
