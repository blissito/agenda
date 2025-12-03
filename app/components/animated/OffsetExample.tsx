import { useScroll, useTransform, motion } from "motion/react";
import { useRef } from "react";
import { cn } from "~/utils/cn";

export const OffsetExample = () => {
  return (
    <section className="flex flex-col min-h-max relative items-center gap-[50vh] pt-[200vh] pb-[100vh]">
      <Cube className="bg-blue-500" />
      <Cube className="bg-orange-500" />
      <Cube className="bg-green-500" />
    </section>
  );
};

const Cube = ({ className }: { className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["center end", "center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const filter = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(9px)", "blur(0px)"]
  );
  const scale = useTransform(scrollYProgress, [0, 1], [0.5, 1.5]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <motion.div
      style={{ opacity, filter, scale, rotate }}
      ref={ref}
      className={cn("h-80 w-80 bg-blue-500 rounded-2xl", className)}
    />
  );
};
