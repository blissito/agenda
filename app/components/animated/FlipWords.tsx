import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

export function FlipWords({
  words = ["perro"],
  duration = 3000,
}: {
  words?: string[];
  duration?: number;
}) {
  const [word, setWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const start = useCallback(() => {
    const w = words[(words.indexOf(word) + 1) % words.length];
    setWord(w);
    setIsAnimating(true);
  }, [word, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        start();
      }, duration);
  }, [isAnimating, duration, start]);

  return (
    <AnimatePresence
      mode="popLayout"
      onExitComplete={() => setIsAnimating(false)}
    >
      <motion.span
        className="inline-flex relative"
        key={word}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          filter: "blur(9px)",
          x: 20,
          y: -20,
          scale: 2,
        }}
        transition={{
          type: "spring",
          bounce: 0,
        }}
      >
        {word.split("").map((letter, i) => (
          <motion.span
            key={letter + i}
            initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{
              delay: 0.05 * i,
              type: "spring",
              bounce: 0.7,
              //   duration: 0.3,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
