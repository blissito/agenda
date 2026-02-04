import { Children, type ReactNode, useEffect, useState } from "react";
import { motion } from "motion/react";

import { nanoid } from "nanoid";
import { cn } from "~/utils/cn";

interface WordNodeElement {
  props?: {
    children?: string;
    className?: string;
  };
}

export const FlipWordsTwo = ({
  delay = 0.03,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) => {
  const [letters, setLetters] = useState<ReactNode[]>([]);
  const wordNode = Children.toArray(children)[0] as WordNodeElement;

  const replaceNodes = () => {
    const childText = wordNode?.props?.children ?? "";
    const letrs = childText.split("").map((letter: string, i: number) => {
      return letter === " " ? (
        <span key={i}>&nbsp;</span>
      ) : (
        <motion.span
          children={letter}
          initial={{
            scale: 3,
            y: -20,
            opacity: 0,
            rotateY: -10,
            rotateZ: -90,
            filter: "blur(4px)",
          }}
          animate={{
            scale: 1,
            y: 0,
            opacity: 1,
            rotateY: 0,
            rotateZ: 0,
            filter: "blur(0px)",
          }}
          transition={{ delay: delay * i, type: "spring", bounce: 0 }}
          key={nanoid()} // truco de mágia 🪄
        />
      );
    });
    setLetters(letrs);
  };

  useEffect(() => {
    replaceNodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      onClick={replaceNodes}
      className={cn("text-left flex", wordNode?.props?.className ?? "")}
    >
      {letters}
    </button>
  );
};
