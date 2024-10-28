import {
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Children, ReactNode, useEffect, useState } from "react";

export const SwipeGallery = ({ children }: { children?: ReactNode }) => {
  const imgs = Children.toArray(children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  const x = useMotionValue(0);
  const scale = useTransform(x, [-350, 0, 350], [0.6, 1, 0.6]);
  const rotate = useTransform(x, [-350, 350], [-45, 45], {
    clamp: false,
  });
  const y = useTransform(x, [-350, 0, 350], [40, 70, 40], { clamp: false });
  const scale2 = useTransform(x, [-350, 0, 350], [0.9, 0.8, 0.9]);

  const backControls = useAnimationControls();
  const frontControls = useAnimationControls();

  const getNextIndex = (indx: number) => {
    return (indx + 1) % imgs.length;
  };

  const appearBack = async () => {
    backControls.set({ y: 2, opacity: 0 });
    await backControls.start(
      {
        y: 70,
        opacity: 0.5,
        scale: 0.8,
        filter: "blur(0px)",
      },
      { type: "spring", bounce: 0, duration: 0.2 }
    );
  };

  const moveBack = async () => {
    await backControls.start({ y: 0, opacity: 1, scale: 1 });
    appearBack();
  };

  const exitFront = async (direction: -1 | 1) => {
    await frontControls.start(
      {
        x: direction * 400,
        opacity: 0,
      },
      { duration: 0.2, type: "spring", bounce: 0 }
    );
  };

  const reappearFront = () => {
    updateIndexes();
    frontControls.set({ x: 0, opacity: 1 });
  };

  const updateIndexes = () => {
    setNextIndex((n) => getNextIndex(n));
    setCurrentIndex((n) => getNextIndex(n));
  };

  const fullMovement = async (direction: -1 | 1) => {
    await exitFront(direction);
    await moveBack();
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
    <div className="relative w-[320px] h-[320px] ">
      <motion.div
        dragSnapToOrigin
        animate={frontControls}
        onDragEnd={handleDragEnd}
        drag="x"
        whileTap={{ cursor: "grabbing" }}
        className="w-full h-full absolute rounded-3xl overflow-hidden bg-black z-10 cursor-grab "
        style={{ x, rotate, scale }}
      >
        {[imgs[currentIndex]]}
      </motion.div>
      <motion.div
        animate={backControls}
        className="w-full h-full absolute rounded-3xl overflow-hidden bg-black shadow-lg"
        // initial={{ y: 220, opacity: 0, scale: 0.5, filter: "blur(4px)" }}
        style={{ y, scale: scale2 }}
      >
        {[imgs[nextIndex]]}
      </motion.div>
    </div>
  );
};
