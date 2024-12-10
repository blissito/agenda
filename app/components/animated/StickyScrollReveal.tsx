import { AnimatePresence, useInView, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";

export const StickyScroll = ({ items }) => {
  const [current, setCurrent] = useState(items[0]);

  const handleInView = (i) => {
    setCurrent(i);
  };

  return (
    <section className="h-[350vh] bg-white">
      <main className="flex h-full relative">
        <div className="w-full flex flex-col gap-40 pt-40 px-4">
          {items.map((item, i) => (
            <InViewDetector onInView={handleInView} key={i} item={item} />
          ))}
        </div>
        <div className="w-full h-[40vh] sticky top-20">
          <AnimatePresence mode="popLayout">
            <motion.div
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              initial={{ filter: "blur(4px)", opacity: 0, y: -10 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -10 }}
              key={current.title}
            >
              {current.img}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </section>
  );
};

export const InViewDetector = ({ item, onInView }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 1 });

  useEffect(() => {
    if (isInView) {
      onInView?.(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);
  return (
    <div ref={ref}>
      <h3
        className={cn("text-4xl mb-8 transition-all", {
          "text-black": isInView,
          "text-gray-500": !isInView,
        })}
      >
        {" "}
        {item.title}
      </h3>
      <div
        className={cn("text-3xl transition-all", {
          "text-black": isInView,
          "text-gray-500": !isInView,
        })}
      >
        {" "}
        {item.text}
      </div>
    </div>
  );
};
