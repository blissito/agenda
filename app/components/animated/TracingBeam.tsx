import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

export const TracingBeam = ({ children }: { children?: ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLElement>(null);
  const [svgHeight, setSvgHeight] = useState(1000);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
    {
      bounce: 0.2,
    }
  );

  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
    {
      bounce: 0.2,
    }
  );

  useEffect(() => {
    if (containerRef.current) {
      setSvgHeight(containerRef.current.offsetHeight);
    }
  }, []);

  return (
    <main ref={ref}>
      <section className="absolute left-0 top-3">
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight} // La altura en función del contenido
          className=" ml-4"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#85ddcb"
            strokeOpacity="0.16"
          ></motion.path>
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
          ></motion.path>
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              y1={y1}
              y2={y2} // movemos el gradiente
            >
              <stop stopColor="#85ddcb" stopOpacity="0"></stop>
              <stop stopColor="#37ab93"></stop>
              <stop offset="0.325" stopColor="#51b4a0"></stop>
              <stop offset="1" stopColor="#19262a" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </section>
      <section ref={containerRef} className="pl-8">
        {children}
      </section>
    </main>
  );
};
