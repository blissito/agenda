import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/utils/cd";

const sleep = (secs: number) =>
  new Promise((res) => setTimeout(res, secs * 1000));

export default function Route() {
  const colors = [
    "bg-blue-500",
    "bg-red-500",
    "bg-slate-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  //   const i = useRef<ReturnType<typeof setTimeout>>();
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(colors.length - 1);
  //   const x = useMotionValue(0);

  const degs1 = useSpring(0, { bounce: 0, duration: 1500 });
  const degs2 = useTransform(degs1, (later) => later - 180);

  const handle = async () => {
    degs1.set(degs1.get() - 180);
    await sleep(1.5);
    setPrev((p) => {
      setCurrent(p);
      return (p + 1) % colors.length;
    });
    degs1.jump(0); // to update back only
    await sleep(1);
    handle();
  };

  const drawChildren = (c: number) => {
    if (c === 0) {
      return <p className="text-center text-4xl uppercase">Perro</p>;
    }
    if (c === 1) {
      return <p className="text-center text-4xl uppercase">Gato</p>;
    }
    if (c === 2) {
      return <p className="text-center text-4xl uppercase">Pollo</p>;
    }
    if (c === 3) {
      return <p className="text-center text-4xl uppercase">Puerco</p>;
    }
    if (c === 4) {
      return <p className="text-center text-4xl uppercase">Mijo</p>;
    }
  };

  useLayoutEffect(() => {
    // const start = () => {
    //   await sleep(4);
    // handle();
    // };
    // start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className="py-12 text-2xl text-center">
        Hecho a ojo por pinche necio by: Blissmo
      </h1>
      <article
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-20deg)",
          zIndex: -10,
        }}
        className="bg-gray-900 py-8 flex justify-center h-[220px] relative"
      >
        <motion.div
          onAnimationComplete={() => console.log("wa")}
          style={{
            rotateX: degs1,
            backfaceVisibility: "hidden",
          }}
          className={cn(
            "w-44 h-40 rounded-xl absolute z-20 flex justify-center items-center",
            colors[current]
          )}
        >
          {drawChildren(current)}
        </motion.div>
        <motion.div
          style={{
            // visibility: "hidden",
            rotateX: degs2,
            backfaceVisibility: "hidden",
          }}
          className={cn(
            "w-44 h-40 rounded-xl absolute z-20 flex justify-center items-center",
            colors[prev]
          )}
        >
          {drawChildren(prev)}
        </motion.div>
        <div
          className={cn("w-44 h-20 rounded-t-xl absolute -z-10", colors[prev])}
        >
          <main className="relative top-[75%] z-30">{drawChildren(prev)}</main>
        </div>
        <div
          className={cn(
            "w-44 h-20 rounded-b-xl absolute -z-10 top-[51%] overflow-hidden",
            colors[current]
          )}
        >
          <main className="relative top-[-25%] z-20">
            {drawChildren(current)}
          </main>
        </div>
        {/* @todo: improve line  */}
        <hr
          style={{
            zIndex: 999999999,
            transform: "translateZ(1px)",
            position: "absolute",
            borderTopWidth: "2px",
          }}
          className="absolute top-[51%] border-gray-900 w-full"
        />
      </article>
      <button
        className="bg-brand_blue p-4 rounded-xl m-8 text-white shadow-lg active:shadow "
        onClick={handle}
      >
        Puchale
      </button>
    </>
  );
}
