import { motion, useAnimationControls } from "framer-motion";
import { Children, ReactNode, useEffect, useRef, useState } from "react";

export const OneMoreFlipper = ({ children }: { children?: ReactNode }) => {
  const nodes = Children.toArray(children);
  const timeout = useRef<ReturnType<typeof setTimeout>>(1);
  //   const [prevIndex, setPrevIndex] = useState(0);
  const prevIndex = useRef(0);
  const front = useAnimationControls();
  const back = useAnimationControls();

  const [frontItem, setFrontItem] = useState(nodes[0]);
  const [backItem, setBackItem] = useState(nodes[1]);
  const [bottomItem, setBottomItem] = useState(nodes[0]);

  // @TODO: try with node rotation...
  // [front,back,top,bottom] => [bottom,front,back,top]

  const sleep = (n = 1000) => new Promise((r) => setTimeout(r, n));

  const moveToNext = () => {
    const n = (prevIndex.current + 1) % nodes.length;
    prevIndex.current = n;
    return (prevIndex.current + 1) % nodes.length;
  };

  const start = async () => {
    // loop
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(start, 3000);
    // actual animation
    await front.start({ rotateX: -90 }, { duration: 1, ease: "easeIn" });
    const nextI = moveToNext();
    setFrontItem(nodes[nextI]);
    front.set({ rotateX: -270 });
    await front.start({ rotateX: -360 }, { duration: 1, ease: "linear" });
    setBackItem(nodes[prevIndex.current]);
    setBottomItem(nodes[nextI]);
    front.set({ rotateX: 0 });
    // reset
    prevIndex.current = (prevIndex.current + 1) % nodes.length;
  };

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="p-12 rounded-3xl bg-black aspect-video relative w-[420px] h-[320px]"
      style={{
        transform: "rotateY(-20deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* top */}
      <div className="overflow-hidden rounded-2xl absolute inset-12 z-0">
        {backItem}
      </div>
      {/* front */}
      <motion.div
        animate={front}
        style={{
          backfaceVisibility: "hidden",
        }}
        className="absolute inset-12 z-40 overflow-hidden rounded-2xl"
      >
        {frontItem}
      </motion.div>
      {/* back */}
      {/* <motion.div
        animate={back}
        style={{
          rotateX: 90,
          backfaceVisibility: "hidden",
        }}
        id="back"
        className=" absolute inset-12 z-40 overflow-hidden rounded-2xl"
      >
        {nodes[nextIndex]}
      </motion.div> */}
      {/* bottom */}
      <div
        style={{
          clipPath: "xywh(0 50% 100% 100% round 0 0)",
        }}
        className="absolute inset-12 z-30 overflow-hidden rounded-2xl"
      >
        {bottomItem}
      </div>

      <hr className="w-full absolute border-black top-[49.8%] z-50 left-0" />
    </section>
  );
};
