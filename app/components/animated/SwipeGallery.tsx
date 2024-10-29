import {
  anticipate,
  easeIn,
  easeInOut,
  easeOut,
  motion,
  useAnimate,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { escape } from "node:querystring";
import { Children, ReactNode, useEffect, useState } from "react";

export const SwipeGallery = ({
  children,
  duration = 0.2,
}: {
  children?: ReactNode;
  duration?: number;
}) => {
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
  // for back based on springX
  const y = useTransform(springX, [-350, 0, 350], [0, 70, 0], {
    clamp: true,
  });
  const scale2 = useTransform(scale, [1, 0.6], [0.8, 1], { clamp: false });
  const opacity = useTransform(x, [-350, 0, 350], [1, 0.5, 1]);
  const filterValue = useTransform(x, [-350, 0, 350], [0, 4, 0]);
  const filter = useMotionTemplate`blur(${filterValue}px)`;

  const backControls = useAnimationControls();
  const frontControls = useAnimationControls();

  // uitl funcs
  const getNextIndex = (indx: number) => {
    return (indx + 1) % imgs.length;
  };

  const appearBack = async () => {
    // backControls.set({ y: 280 });
    // await backControls.start({ y: 70 });
  };

  const exitFront = async (direction: -1 | 1) =>
    await frontControls.start({
      x: 400 * direction,
      filter: "blur(4px)",
      scale: 0.6,
      opacity: 0,
    });

  const reappearFront = async () => {
    updateIndexes();
    frontControls.set({ x: 0, opacity: 1, filter: "blur(0px)" });
  };

  const updateIndexes = () => {
    setNextIndex((n) => getNextIndex(n));
    setCurrentIndex((n) => getNextIndex(n));
  };

  const fullMovement = async (direction: -1 | 1) => {
    await exitFront(direction);
    // await moveBack();
    reappearFront();
  };

  async function handleDragEnd(_, info) {
    if (info.offset.x < -200) {
      fullMovement(-1);
    }
    if (info.offset.x > 200) {
      fullMovement(1);
    }
  }

  useEffect(() => {
    appearBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-[320px] h-[320px]">
      <motion.div
        dragSnapToOrigin
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
        style={{ y, scale: scale2, filter, opacity }}
      >
        {[imgs[nextIndex]]}
      </motion.div>
    </div>
  );
};
