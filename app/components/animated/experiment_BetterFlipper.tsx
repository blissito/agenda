import { motion, useAnimationControls } from "framer-motion";
import { Children, type ReactNode, useEffect, useRef, useState } from "react";

export const BetterFlipper = ({ children }: { children?: ReactNode }) => {
  const nodes = Children.toArray(children);
  const timeout = useRef<ReturnType<typeof setTimeout>>(1);
  const [prevIndex, setPrevIndex] = useState(0);
  const nextIndex = prevIndex + 1 < nodes.length ? prevIndex + 1 : 0;
  const front = useAnimationControls();
  const back = useAnimationControls();

  // @TODO: try with node rotation...
  // [front,back,top,bottom] => [bottom,front,back,top]

  const start = async () => {
    // loop
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(start, 3000);
    // actual animation
    await front.start({ rotateX: -90 }, { duration: 1, ease: "easeIn" });
    await back.start({ rotateX: 0 }, { duration: 1, ease: "easeOut" });
    // reset
    setPrevIndex((i) => (i + 1) % nodes.length); // 🪄🎩
    front.set({ rotateX: 0 });
    back.set({ rotateX: 90 });
  };

  useEffect(() => {
    // start();
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
        {nodes[nextIndex]}
      </div>
      {/* front */}
      <motion.div
        animate={front}
        style={{
          backfaceVisibility: "hidden",
        }}
        id="front"
        className="absolute inset-12 z-40 overflow-hidden rounded-2xl"
      >
        {nodes[prevIndex]}
      </motion.div>
      {/* back */}
      <motion.div
        animate={back}
        style={{
          rotateX: 90,
          backfaceVisibility: "hidden",
        }}
        id="back"
        className="absolute inset-12 z-40 overflow-hidden rounded-2xl"
      >
        {nodes[nextIndex]}
      </motion.div>
      {/* bottom */}
      <div
        style={{
          WebkitClipPath: "",
        }}
        className="absolute inset-12 z-30 overflow-hidden rounded-2xl"
      >
        {nodes[prevIndex]}
      </div>

      <hr className="w-full absolute border-black top-[49.8%] z-50 left-0" />
    </section>
  );
};
