import {
  AnimatePresence,
  useInView,
  useMotionValueEvent,
  useScroll,
  motion,
} from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cd";

export const StickyScrollReveal = ({
  items,
}: {
  items: Record<string, ReactNode>[];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(items[currentIndex].img);
  const [currentBgColor, setCurrentBgColor] = useState(items[0].twColor);
  // scroll
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // console.log("latest", latest);
  });

  const handleEnterIntoView = (index: number) => {
    setCurrentImage(items[index].img);
    setCurrentBgColor(items[index].twColor);
    setCurrentIndex(index);
  };

  //   console.log("index", currentIndex);

  return (
    <article className={cn(currentBgColor, "transition-all")}>
      <section
        className="flex px-4 gap-8 justify-center items-start relative py-20 h-max max-w-6xl mx-auto"
        ref={targetRef}
      >
        <div className="flex flex-col flex-1 pb-40 pt-40 gap-80">
          {items.map(({ text, title, img }, index) => (
            <InViewDetector
              onInView={handleEnterIntoView}
              index={index}
              key={index + title}
              className="h-full"
            >
              <h3
                className={cn(
                  "text-gray-400 font-sans font-bold text-5xl mb-12 transition-all",

                  {
                    "text-white": currentImage === img,
                  }
                )}
              >
                {title}
              </h3>
              <div
                className={cn("text-3xl text-gray-400 transition-all", {
                  "text-white": currentImage === img,
                })}
              >
                {text}
              </div>
            </InViewDetector>
          ))}
        </div>
        <div className="sticky top-40 flex-1 overflow-hidden rounded-3xl aspect-square">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 40, filter: "blur(9px" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px" }}
              exit={{ opacity: 0, y: -40, filter: "blur(9px" }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            >
              {currentImage}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </article>
  );
};

export const InViewDetector = ({
  children,
  index,
  className,
  onInView,
}: {
  className?: string;
  index: number;
  children?: ReactNode;
  onInView?: (arg0: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    // margin: "center",
    amount: 1,
  });
  // margin: "100px 0px 0px 0px",

  useEffect(() => {
    if (isInView) {
      onInView?.(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, index]);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};
