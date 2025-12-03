import {
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Children, type ReactNode, useState } from "react";

export const SwipeGallery = ({ children }: { children?: ReactNode }) => {
  const imgs = Children.toArray(children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  // front
  const x = useMotionValue(0);
  const springX = useSpring(x, { bounce: 0.4 });
  const scale = useTransform(x, [-350, 0, 350], [0.6, 1, 0.6]);
  const rotate = useTransform(x, [-350, 350], [-45, 45], {
    clamp: false,
  });
  // back
  const y = useTransform(springX, [-350, 0, 350], [0, 70, 0], {
    clamp: true,
  });
  const scale2 = useTransform(scale, [1, 0.6], [0.8, 1], { clamp: false });
  const filterValue = useTransform(x, [-350, 0, 350], [0, 8, 0]);
  const filter = useMotionTemplate`blur(${filterValue}px)`;

  // controls
  const backControls = useAnimationControls();
  const frontControls = useAnimationControls();

  // uitl funcs
  const getNextIndex = (indx: number) => {
    return (indx + 1) % imgs.length;
  };
  const updateIndexes = () => {
    setNextIndex((n) => getNextIndex(n));
    setCurrentIndex((n) => getNextIndex(n));
  };
  const exitFront = async (direction: -1 | 1) =>
    await frontControls.start({
      x: 420 * direction,
      scale: 0.6,
      opacity: 0,
    });
  const reappearFront = async () => {
    updateIndexes();
    frontControls.set({ x: 0, opacity: 1, filter: "blur(0px)" });
  };
  const fullMovement = async (direction: -1 | 1) => {
    await exitFront(direction);
    reappearFront();
  };

  // handlers
  async function handleDragEnd(_, info) {
    if (info.offset.x < -150) {
      fullMovement(-1);
      return;
    }
    if (info.offset.x > 150) {
      fullMovement(1);
    }
  }

  return (
    <div className="relative w-[320px] h-[320px]">
      <motion.div
        dragConstraints={{ left: 0, right: 0 }}
        animate={frontControls}
        onDragEnd={handleDragEnd}
        drag="x"
        whileTap={{ cursor: "grabbing" }}
        className="w-full h-full absolute rounded-3xl overflow-hidden bg-black z-10 cursor-grab shadow-xl"
        style={{ x, rotate, scale }}
      >
        {[imgs[currentIndex]]}
      </motion.div>
      <motion.div
        animate={backControls}
        className="w-full h-full absolute rounded-3xl overflow-hidden bg-black shadow-lg"
        style={{ y, scale: scale2, filter }}
      >
        {[imgs[nextIndex]]}
      </motion.div>
    </div>
  );
};
