import { motion, useAnimationControls } from "framer-motion";
import { Children, ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";

export function Flipper({
  children,
  color = "white",
}: {
  color?: string;
  children: ReactNode[];
}) {
  // REFS
  const items = Children.toArray(children);
  const index = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  // STATES
  const [currentItem, setCurrenItem] = useState<ReactNode>(items[0]);
  const [nextItem, setNextItem] = useState<ReactNode>(items[1]);
  const [trickItem, setTrickItem] = useState<ReactNode>(items[0]);
  // CONTROLS
  const controls_1 = useAnimationControls();
  const controls_2 = useAnimationControls();
  const controls_3 = useAnimationControls();

  // UTIL FUNCS
  const updateItem = () => {
    index.current = (index.current + 1) % items.length;
    const next = items[index.current];
    // ROTATION
    setNextItem((n) => {
      setCurrenItem(n);
      return next;
    });
    return next;
  };
  const removeTrickAndUpdate = (next: ReactNode) => {
    controls_3.set({ zIndex: -10 });
    setTrickItem(next);
  };
  const setTrickAndReset = () => {
    // SET TRICK & RESET
    controls_3.set({ zIndex: 40 });
    controls_1.set({ rotateX: 0 });
    controls_2.set({ rotateX: -270 });
  };
  // MAIN FUNC
  const animate = async () => {
    timeout.current && clearTimeout(timeout.current);
    // SET NEXT
    const next = updateItem();
    removeTrickAndUpdate(next);
    // ANIMATIONS
    await controls_1.start({ rotateX: -90 }, { duration: 0.7, ease: "easeIn" });
    await controls_2.start(
      { rotateX: -360 },
      { duration: 0.7, ease: "easeOut" }
    );
    // RESET
    setTrickAndReset();
    // LOOP @todo: use an animationn frame
    timeout.current = setTimeout(animate, 1000);
  };

  useEffect(() => {
    animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // @TODO: CREATE COMPONENTS?
  const generalClass =
    "text-white text-8xl items-center overflow-hidden w-56 h-56 justify-center absolute z-30 flex rounded-xl";
  return (
    <article
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateY(-20deg)",
        zIndex: 0,
      }}
      className={cn(
        "p-12 flex justify-center h-[320px] relative",
        `bg-${color}`
      )}
    >
      <motion.div
        animate={controls_1}
        id="target"
        style={{
          backfaceVisibility: "hidden",
        }}
        className={generalClass}
      >
        {currentItem}
      </motion.div>
      <motion.div
        initial={{ rotateX: -270 }}
        animate={controls_2}
        id="target_2"
        style={{
          backfaceVisibility: "hidden",
        }}
        className={cn(generalClass, "z-30")}
      >
        {nextItem}
      </motion.div>
      {/* Prev */}
      <motion.div
        style={{
          clipPath: "xywh(0 50% 100% 100% round 0 0)",
        }}
        className={cn(generalClass, "z-20")}
      >
        {currentItem}
      </motion.div>
      {/* Next */}
      <motion.div className={cn(generalClass, "z-10")}>{nextItem}</motion.div>
      {/* Trick */}
      <motion.div animate={controls_3} className={cn(generalClass, "relative")}>
        {trickItem}
      </motion.div>
      <hr
        style={{
          zIndex: 50,
          transform: "translateZ(1px)",
          position: "absolute",
          borderTopWidth: "2px",
        }}
        className={cn("absolute top-[50%] w-full", `border-${color}`)}
      />
    </article>
  );
}
