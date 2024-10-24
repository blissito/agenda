import { motion, useAnimationControls } from "framer-motion";
import { Children, ReactNode, useEffect, useRef, useState } from "react";

export const OneMoreFlipper = ({ children }: { children?: ReactNode }) => {
  const nodes = Children.toArray(children);
  const timeout = useRef<ReturnType<typeof setTimeout>>(1);
  const prevIndex = useRef(0);
  const nextIndex = useRef(1);

  const flipper = useAnimationControls();

  const [topItem, setTopItem] = useState(nodes[1]);
  const [flipItem, setFlipItem] = useState(nodes[0]);
  const [bottomItem, setBottomItem] = useState(nodes[0]);

  const moveToNext = () => {
    const n = (prevIndex.current + 1) % nodes.length;
    prevIndex.current = n; // update prev
    nextIndex.current = (n + 1) % nodes.length; // return next
  };

  const start = async () => {
    // next
    // loop
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(start, 3000);
    // top  flip animation
    await flipper.start({ rotateX: -90 }, { duration: 1, ease: "easeIn" });
    // switch
    moveToNext();
    setFlipItem(nodes[prevIndex.current]);
    // prepare next animation
    flipper.set({ rotateX: -270 });
    // bottom flip animation
    await flipper.start({ rotateX: -360 }, { duration: 1, ease: "easeOut" });
    // update
    setTopItem(nodes[nextIndex.current]);
    setBottomItem(nodes[prevIndex.current]);
    // prepare for next call
    flipper.set({ rotateX: 0 });
  };

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = () => {
    timeout.current && clearTimeout(timeout.current);
  };

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
        {topItem}
      </div>
      {/* flipper */}
      <motion.div
        animate={flipper}
        style={
          {
            //   backfaceVisibility: "hidden",
          }
        }
        className="absolute inset-12 z-40 overflow-hidden rounded-2xl"
      >
        {flipItem}
      </motion.div>
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
