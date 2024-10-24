import { Children, ReactNode, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
} from "framer-motion";

export default function Route() {
  return (
    <article className="flex justify-center items-center h-screen">
      <SimpleFlipper>
        <img className="" src="https://i.imgur.com/nITUzj1.png" alt="demo" />
        <img src="https://i.imgur.com/ruOqfsG.png" alt="demo" />
        <img src="https://i.imgur.com/ArpsLvc.png" alt="demo" />
      </SimpleFlipper>
    </article>
  );
}

const SimpleFlipper = ({ children }: { children?: ReactNode }) => {
  const items = Children.toArray(children);
  const nextIndex = useRef(1);

  const [prevItem, setPrevItem] = useState(items[0]);
  const [nextItem, setNextItem] = useState(items[1]);

  const xDegs = useMotionValue(0);
  const invertedXDegs = useMotionValue(-180);

  const getNextIndex = async () => {
    const prev = nextIndex.current;
    const next = (nextIndex.current + 1) % items.length;
    nextIndex.current = next;
    return { prevIndex: prev, nextIndex: next };
  };

  useAnimationFrame(async () => {
    // jumps
    if (xDegs.get() % 180 === 0) {
      const { prevIndex, nextIndex } = await getNextIndex(); // 🪄
      setPrevItem(items[prevIndex]);
      setNextItem(items[nextIndex]);
      xDegs.jump(0);
      invertedXDegs.jump(-180);
    }
    xDegs.set(xDegs.get() - 1);
    invertedXDegs.set(invertedXDegs.get() - 1);
  });

  return (
    <section
      className="p-12 bg-black aspect-video relative w-[600px]"
      style={{
        transform: "rotateY(-20deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="inset-12 bg-green-500 rounded-3xl overflow-hidden absolute -z-50">
        {nextItem}
      </div>

      <motion.div
        className="bg-red-500 absolute inset-12 rounded-3xl overflow-hidden z-50"
        style={{
          rotateX: xDegs,
          backfaceVisibility: "hidden",
        }}
      >
        {prevItem}
      </motion.div>
      <motion.div
        className="bg-blue-500 absolute inset-12 rounded-3xl overflow-hidden z-50"
        style={{
          rotateX: invertedXDegs,
          backfaceVisibility: "hidden",
        }}
      >
        {nextItem}
      </motion.div>

      <div
        style={{
          //   opacity,
          clipPath: "xywh(0 50% 100% 100% round 0 0)",
          //   transform: "translateZ(-4px)",
        }}
        className="bg-pink-500 inset-12 rounded-3xl overflow-hidden absolute -z-50"
      >
        {prevItem}
      </div>

      <hr className="border-black w-full border-t-2 absolute z-50 left-0 top-[49.7%]" />
    </section>
  );
};
