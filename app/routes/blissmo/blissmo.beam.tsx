import { useScroll, useTransform, motion } from "motion/react";
import { type ReactNode, useRef } from "react";

export default function Route() {
  return (
    <article className="">
      <div className="h-[60vh] bg-blue-500" />
      <BeamContainer>
        <div className="h-screen bg-gray-950">
          <h2 className="text-gray-500 text-4xl w-max font-bold sticky top-40 flex py-40 ">
            A finales de 2024
            <Dot />
          </h2>
          <p className="pl-[50%]">
            Siempre me han gustado las animaciones web, pero he decidido
            tomarmelas en serio
          </p>
        </div>
        <div className="h-screen bg-gray-950">
          <h2 className="text-gray-500  text-4xl w-max font-bold sticky top-40 flex py-20">
            A principios de 2025
            <Dot />
          </h2>
          <p className="pl-[50%]">El curso era demandado y apreciado ☺️</p>
        </div>
        <div className="h-screen bg-gray-950">
          <h2 className="text-gray-500  text-4xl w-max font-bold sticky top-40 flex py-20">
            <Dot />A mediados de 2025
          </h2>
          <p className="pl-[50%]">
            El curso se amplio con muchas galerías extra
          </p>
        </div>
        <div className="h-screen bg-gray-950">
          <h2 className="text-gray-500  text-4xl w-max font-bold sticky top-40 flex py-20">
            A finales de 2025
            <Dot />
          </h2>
          <p className="pl-[50%]">Nuestra comunidad efervece y quiere más</p>
        </div>
      </BeamContainer>
      <div className="h-[300vh] bg-blue-500" />
      <div className="h-[300vh] bg-indigo-500" />
    </article>
  );
}

const Dot = () => {
  return (
    <div className="bg-gray-950 rounded-full z-0 absolute h-8 w-8 top-[43%] left-[-95px]">
      <div className="bg-gray-300 absolute inset-2 z-10 rounded-full" />
    </div>
  );
};

export const BeamContainer = ({ children }: { children?: ReactNode }) => {
  return (
    <article className="pl-40 relative text-white h-screen">
      <Beam />
      {children}
    </article>
  );
};

export const Beam = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });

  const heightTransform = useTransform(
    // useSpring(scrollYProgress, { bounce: 0 }),
    scrollYProgress,
    [0, 1],
    ["10%", "100%"]
  );

  return (
    <section
      ref={ref}
      className="bg-gray-950 w-40 h-[400vh] flex justify-center top-0 left-0 absolute overflow-hidden z-0"
    >
      <motion.div
        style={{
          height: heightTransform,
        }}
        className="w-[2px] bg-gradient-to-b from-transparent via-blue-500 from-[0%] via-[90%] to-transparent z-10"
      ></motion.div>
      <div className="h-full w-[2.5px] absolute bg-gray-900 z-0" />
    </section>
  );
};
