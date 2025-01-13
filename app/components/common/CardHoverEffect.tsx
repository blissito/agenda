import { cn } from "../../utils/cn";
import { Link } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    plan: string;
    price: string;
    link?: string;
    children: ReactNode;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: 0.2,
        ease: [0, 0.71, 0.2, 1.01],
      }}
    >
      <div className={cn("grid grid-cols-1 md:grid-cols-2 ", className)}>
        {items.map((item, idx) => (
          <Link
            to={item?.link || ""}
            key={item?.link}
            className="relative group  block p-4 h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-fullbg-brand_blue dark:bg-brand_blue block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: 0.15,
                      ease: "linear",
                    },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.1 },
                  }}
                />
              )}
            </AnimatePresence>
            <section className="group cursor-pointer  bg-white border-[1px] border-brand_ash rounded-2xl max-w-[400px] z-10	xl:max-w-[480px] h-full md:px-8 px-4 py-6 md:py-10  text-left flex flex-col  relative  ">
              <img
                alt="rocket"
                className="absolute w-[200px] -right-10 top-0 md:-right-12 md:top-0 opacity-0 group-hover:opacity-100  transition-all"
                src="/images/Rocket.gif"
              />
              <span className="text-xl uppercase font-satoshi_bold text-brand_blue ">
                {item?.plan}
              </span>
              <p className="text-5xl md:text-6xl	font-satoshi_bold font-bold mt-4">
                {item?.price}{" "}
                <span className="text-2xl text-brand_gray">/mes</span>
              </p>
              <div className="mt-8 h- w-full h-full grow flex flex-col justify-between gap-12">
                {item.children}
              </div>
            </section>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};
