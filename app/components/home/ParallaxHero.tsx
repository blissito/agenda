import { motion, useTransform, useScroll } from "motion/react";
import { Children, useRef, type ReactNode } from "react";

//**********************************This is Still a Work in progress */

export const ParallaxHero = ({ children }: { children: ReactNode }) => {
  const count = Children.count(children);
  if (count < 2) throw "Se necesitan dos nodos para crear el parallax";

  const hero = Children.toArray(children)[0];
  const section = Children.toArray(children)[1];
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"], // 1. 0 end start, 1 when start start
    target,
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]); // when Y=0 => scale=1
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]); // when Y=1 => y=150%
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.25], [1, 1, 0]);

  return (
    <motion.div ref={target} className="">
      <motion.div
        style={{
          opacity,
          scale: scale,
          y,
        }}
      >
        {hero}
      </motion.div>
      <motion.div
        className="	"
        style={{
          y: -1, // in order to cover hero with bg
        }}
      >
        {section}
      </motion.div>
    </motion.div>
  );
};
