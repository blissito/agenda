import {
  motion,
  useAnimate,
  useAnimationControls,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/utils/cd";

const sleep = (secs: number) =>
  new Promise((res) => setTimeout(res, secs * 1000));

export default function Route() {
  const colors = [
    "bg-indigo-500",
    "bg-red-500",
    "bg-slate-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const index = useRef(0);
  const [active, setActive] = useState(true);
  const [color_1, setColor1] = useState(colors[0]);
  const [color_2, setColor2] = useState(colors[1]);
  const [trick_color, setTrickcolor] = useState(colors[1]);

  const [nextNumber, setNextNumber] = useState(0);
  const [trickNumber, setTrickNumber] = useState(0);

  const controls_1 = useAnimationControls();
  const controls_2 = useAnimationControls();
  const controls_3 = useAnimationControls();

  // @TODO: Create small functions and use ref object to save the states
  const start = async () => {
    // GET INDEX
    index.current = (index.current + 1) % colors.length;
    const nextColor = colors[index.current];
    console.log("next", nextColor);
    // COLOR ROTATION & NUMBER ROTATION
    setColor2((c) => {
      setColor1(c);
      return nextColor;
    });

    setNextNumber((n) => n + 1);
    // TRICK MOVEMENT & TRICK COLOR UPDATE
    controls_3.set({ zIndex: -10 });
    setTrickcolor(nextColor);
    setTrickNumber((n) => n + 1);
    // SET NEXT NUMBER
    // MOVEMENT
    await controls_1.start({ rotateX: -90 }, { duration: 0.7, ease: "easeIn" });
    await controls_2.start(
      { rotateX: -360 },
      { duration: 0.7, ease: "easeOut" }
    );
    // SET TRICK
    await controls_3.set({ zIndex: 40 });
    // RESET
    controls_1.set({ rotateX: 0 });
    controls_2.set({ rotateX: -270 });
    // update front color
    // setColor1(nextColor);
    // LOOP
    setTimeout(start, 1000);
  };

  useEffect(() => {
    start();
  }, []);

  // @TODO: CREATE COMPONENTS
  return (
    <>
      <h1 className="py-12 text-2xl text-center">
        Hecho a ojo por pinche necio by: Blissmo
      </h1>
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-20deg)",
          zIndex: 0,
        }}
        className="bg-gray-900 py-8 flex justify-center h-[220px] relative"
      >
        <motion.div
          animate={controls_1}
          id="target"
          style={{
            backfaceVisibility: "hidden",
          }}
          className={cn(
            "text-white text-8xl items-center p-4 w-40 h-40 justify-center absolute z-30 flex rounded-xl",
            color_1
          )}
        >
          {nextNumber - 1}
        </motion.div>
        <motion.div
          initial={{ rotateX: -270 }}
          animate={controls_2}
          id="target_2"
          style={{
            backfaceVisibility: "hidden",
          }}
          className={cn(
            "text-white text-8xl items-center p-4 w-40 h-40 justify-center absolute z-30 flex rounded-xl",
            color_2
          )}
        >
          {nextNumber}
        </motion.div>
        {/* Prev */}
        <motion.div
          style={{
            clipPath: "xywh(0 50% 100% 100% round 0 0)",
          }}
          className={cn(
            "text-white text-8xl flex items-center p-4 w-40 h-40 justify-center absolute z-20 rounded-xl",
            color_1
          )}
        >
          {nextNumber - 1}
        </motion.div>
        {/* Next */}
        <motion.div
          className={cn(
            "text-white text-8xl flex items-center p-4 w-40 h-40 justify-center absolute z-10 rounded-xl",
            color_2
          )}
        >
          {nextNumber}
        </motion.div>
        {/* Trick */}
        <motion.div
          animate={controls_3}
          className={cn(
            "text-white text-8xl flex items-center p-4 w-40 h-40 justify-center relative rounded-xl z-0",
            trick_color
          )}
        >
          {trickNumber}
        </motion.div>
        {/* @todo: improve line  */}

        <hr
          style={{
            zIndex: 50,
            transform: "translateZ(1px)",
            position: "absolute",
            borderTopWidth: "2px",
          }}
          className="absolute top-[51%] border-gray-900 w-full"
        />
      </div>
      {!active && (
        <button
          className="bg-brand_blue p-4 rounded-xl m-8 text-white shadow-lg active:shadow "
          onClick={start}
        >
          Puchale
        </button>
      )}
    </>
  );
}
