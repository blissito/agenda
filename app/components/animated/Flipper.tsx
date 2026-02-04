import { motion, useAnimationControls, useSpring } from "motion/react";
import {
  Children,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "~/utils/cn";
import { useSignal } from "@preact/signals-react";

export const Flipper = ({
  children,
  twColor = "black",
}: {
  children?: ReactNode;
  twColor?: string;
}) => {
  const bgColor = `bg-${twColor}`;
  const borderColor = `border-${twColor}`;
  const nodes = Children.toArray(children);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const prevIndex = useSignal(0);
  const nextIndex = useSignal(1);
  const flipper = useAnimationControls();
  const [topItem, setTopItem] = useState(nodes[1]);
  const [flipItem, setFlipItem] = useState(nodes[0]);
  const [bottomItem, setBottomItem] = useState(nodes[0]);

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNextIndex = (current: number) => (current + 1) % nodes.length;
  const moveIdexesToNext = () => {
    prevIndex.value = getNextIndex(prevIndex.value); // update prev
    nextIndex.value = getNextIndex(prevIndex.value); // update next
  };

  const stop = () => {
    if (timeout.current) clearTimeout(timeout.current);
  };

  const sleep = (n = 1) => new Promise((r) => setTimeout(r, n * 1000));

  const start = async () => {
    // loop
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(start, 3000);
    // top  flip animation
    await flipper.start({ rotateX: -90 }, { duration: 0.5, ease: "easeIn" });
    // next
    moveIdexesToNext();
    setFlipItem(nodes[prevIndex.value]);
    // flipItem.value = nodes[prevIndex.value];
    // prepare next animation
    flipper.set({ rotateX: -270 });
    // await sleep();
    // bottom flip animation
    await flipper.start({ rotateX: -360 }, { duration: 0.5, ease: "easeOut" });
    // update
    setTopItem(nodes[nextIndex.value]);
    setBottomItem(nodes[prevIndex.value]);
    // prepare for next call
    flipper.set({ rotateX: 0 });
  };

  const z1 = useSpring(0, { bounce: 0 });
  const z2 = useSpring(0, { bounce: 0 });
  const rotateY = useSpring(-20, { bounce: 0 });
  const rotateX = useSpring(0, { bounce: 0 });
  const [hovered, setHovered] = useState(false);

  const handleHover = async (event: MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const { top, height, left, width } =
      containerRef.current.getBoundingClientRect();
    rotateX.set((event.clientY - top - height / 2) * -0.3);
    rotateY.set((event.clientX - left - width / 2) * 0.3);
    await sleep(0.2);
    z1.set(-300);
    z2.set(-150);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setTimeout(async () => {
      z1.set(0);
      z2.set(0);
      await sleep(0.3);
      rotateX.set(0);
      rotateY.set(-20);
      await sleep(0.5);
      setHovered(false);
    }, 1500);
  };

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={handleHover}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "p-0 rounded-3xl bg-transparent aspect-video relative w-[420px] h-[320px]",
        !hovered && bgColor
      )}
      style={{
        // perspective: 5000,
        transformStyle: "preserve-3d",
        rotateY,
        rotateX,
      }}
    >
      <motion.div
        style={{
          z: z1,
        }}
        className=" overflow-hidden rounded-2xl absolute inset-12 z-0"
      >
        {topItem}
      </motion.div>
      <motion.div
        animate={flipper}
        className="absolute inset-12 z-20 overflow-hidden rounded-2xl"
      >
        {flipItem}
      </motion.div>
      <motion.div
        style={{
          z: z2,
          // 🪄
          clipPath: "polygon(0px 50%, 100% 50%, 100% 100%, 0px 100%)",
        }}
        className="absolute inset-12 z-10 overflow-hidden rounded-2xl"
      >
        {bottomItem}
      </motion.div>
      <hr
        className={cn(
          "w-full absolute border-black border-px top-[49.9%] z-30 left-0",
          borderColor
        )}
      />
    </motion.section>
  );
};
