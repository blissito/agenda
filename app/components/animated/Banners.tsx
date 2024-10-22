import {
  useAnimationControls,
  motion,
  useMotionValue,
  useMotionTemplate,
  useTransform,
  easeInOut,
  useScroll,
  useMotionValueEvent,
  useSpring,
  useAnimationFrame,
} from "framer-motion";
import { Children, ReactNode, useEffect, useRef, useState } from "react";
import { PiRobotDuotone } from "react-icons/pi";
import { cn } from "~/utils/cd";

export function Banners({ children }: { children?: ReactNode }) {
  const firstChildren = Children.toArray(children)[0];
  const secondChildren = Children.toArray(children)[1];
  const [currentHover, setCurrentHover] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const X = useTransform(x, [0, 600], [300, 500], {
    ease: easeInOut,
  });
  const Y = useTransform(y, [0, 600], [300, 500], {
    ease: easeInOut,
  });

  const background = useMotionTemplate`radial-gradient(at ${X}px ${Y}px, #5158f6 1%, black 80%)`;

  const hadleMouseMove = (e) => {
    x.set(e.pageX);
    y.set(e.pageY);
  };

  return (
    <>
      <motion.article
        onMouseMove={hadleMouseMove}
        style={{
          background,
        }}
        className="h-[80vh] relative overflow-hidden"
      >
        <section>
          <motion.div className="absolute inset-1 z-0 backdrop-blur-3xl" />
          <AnimatedBanner
            onHoverStart={() => setCurrentHover(0)}
            isHovered={currentHover === 0}
            rotate={-10}
            reversed
            bgClass="bg-black"
          >
            {firstChildren}
          </AnimatedBanner>
          <AnimatedBanner
            onHoverStart={() => setCurrentHover(1)}
            isHovered={currentHover === 1}
            rotate={10}
            children={secondChildren}
          />
        </section>
      </motion.article>
      <div className="h-[100vh]" />
    </>
  );
}

const AnimatedBanner = ({
  children,
  rotate,
  reversed,
  bgClass = "bg-[#5158f6]",
  onHoverStart,
  isHovered,
}: {
  children?: ReactNode;
  rotate?: number;
  reversed?: boolean;
  bgClass?: string;
  onHoverStart?: () => void;
  isHovered: boolean;
}) => {
  const controls = useAnimationControls();
  const parentControls = useAnimationControls();

  // scroll direction
  const prevScrollY = useRef(0);
  const [scrollDirection, setScrollDirection] = useState(1);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrollDirection(latest < prevScrollY.current ? -1 : 1);
    prevScrollY.current = latest;
  });

  // movement
  const p = useRef<HTMLDivElement>();

  const baseX = useMotionValue(0);
  const x = useSpring(baseX, { bounce: 0 });

  const move = () => {
    const rect = p.current?.getBoundingClientRect();
    const dir = scrollDirection * (reversed ? -1 : 1);
    if (dir > 0 && rect.x > innerWidth) {
      baseX.jump(-rect?.width);
      return;
    }
    if (dir < 0 && rect?.right < 0) {
      baseX.jump(rect?.width / 2);
      return;
    }
    baseX.set(baseX.get() + 3 * dir);
  };

  useAnimationFrame(move);

  const handleHover = () => {
    onHoverStart?.();
  };

  useEffect(() => {
    // animationController(isInView);
    move();
    if (isHovered) {
      parentControls.start({ filter: "blur(0)" }, { duration: 1 });
    } else {
      parentControls.start({ filter: "blur(6px)" }, { duration: 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered]);

  return (
    <motion.div
      animate={parentControls}
      onHoverStart={handleHover}
      style={{
        transformOrigin: "center",
        transform: `rotate(${rotate}deg) translateY(-40%)`,
      }}
      className={cn(
        "h-[8vw] absolute left-[-10%] top-[45%] flex w-[150vw]",
        bgClass
      )}
    >
      <motion.p
        ref={p}
        style={{ x }}
        className="uppercase text-white flex items-center h-full font-extrabold lg:text-6xl text-3xl gap-10 whitespace-nowrap font-sans translate-x-[-100%]"
      >
        {children ? (
          children
        ) : (
          <>
            diseño web <Robot /> espectacular <Robot /> animaciones web{" "}
            <Robot /> fuera de lo tradicional <Robot />
            diseño web <Robot /> espectacular
            <Robot /> animaciones web <Robot /> fuera de lo tradicional{" "}
            <Robot />
          </>
        )}
      </motion.p>
    </motion.div>
  );
};

export const Robot = () => {
  return (
    <span
      className="animate-spin"
      style={{
        animationDuration: "5s",
      }}
    >
      <PiRobotDuotone />
    </span>
  );
};
