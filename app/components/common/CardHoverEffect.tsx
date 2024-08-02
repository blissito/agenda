import { cn } from "../../utils/cd";
import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";

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
    <div className={cn("grid grid-cols-1 md:grid-cols-2  py-10", className)}>
      {items.map((item, idx) => (
        <Link
          href={item?.link}
          key={item?.link}
          className="relative group  block p-4 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full  bg-brand_blue dark:bg-brand_blue block  rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <section className="group cursor-pointer  bg-white border-[1px] border-brand_ash rounded-2xl max-w-[400px] z-10	xl:max-w-[480px] h-full px-8 py-10  text-left flex flex-col  relative  ">
            <img
              alt="rocket"
              className="absolute w-[200px] -right-16 -top-12 md:-right-12 md:top-0 opacity-0 group-hover:opacity-100  transition-all"
              src="/images/Rocket.gif"
            />
            <span className="text-xl uppercase font-satoshi_bold text-brand_blue ">
              {item?.plan}
            </span>
            <p className="text-5xl md:text-6xl	font-satoshi_bold font-bold mt-4">
              {item?.price}
            </p>
            <div className="mt-8 h- w-full h-full grow flex flex-col justify-between gap-12">
              {item.children}
            </div>
          </section>
        </Link>
      ))}
    </div>
  );
};
