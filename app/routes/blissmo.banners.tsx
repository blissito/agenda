import {
  useAnimationControls,
  useInView,
  motion,
  useMotionValue,
  useMotionTemplate,
  useTransform,
  easeInOut,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { PiRobotDuotone } from "react-icons/pi";
import { cn } from "~/utils/cd";

export default function Route() {
  const [currentHover, setCurrentHover] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const X = useTransform(x, [0, 600], [300, 500], {
    ease: easeInOut,
  });
  const Y = useTransform(y, [0, 600], [300, 500], {
    ease: easeInOut,
  });

  const background = useMotionTemplate`radial-gradient(at ${X}px ${Y}px, #380b0b 1%, black 80%)`;

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
            Más de 10 años de experiencia <Robot /> profesionales de la web{" "}
            <Robot /> landing pages <Robot /> premiadas <Robot />
            diseño web <Robot /> diseñadores senior <Robot /> fullstack
            developers
          </AnimatedBanner>
          <AnimatedBanner
            onHoverStart={() => setCurrentHover(1)}
            isHovered={currentHover === 1}
            rotate={10}
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
  bgClass = "bg-red-600",
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
  const pRef = useRef(null);
  const isInView = useInView(pRef);
  const controls = useAnimationControls();
  const parentControls = useAnimationControls();

  // scroll direction
  const prevScrollY = useRef(0);
  const [scrollDirection, setScrollDirection] = useState(1);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrollDirection(latest < prevScrollY.current ? -1 : 1);
    prevScrollY.current = latest;
    console.log(scrollDirection);
  });

  const animationController = async (isInView: boolean) => {
    if (!isInView) {
      controls.stop();
      controls.set({
        x: reversed
          ? scrollDirection < 0
            ? "-100%"
            : "30%"
          : scrollDirection < 0
          ? "30%"
          : "-100%",
      });
    }
    controls.start(
      {
        x: reversed
          ? scrollDirection < 0
            ? "100%"
            : "-250%"
          : scrollDirection < 0
          ? "-250%"
          : "100%",
      },
      { duration: 100 }
    );
  };

  const handleHover = () => {
    onHoverStart?.();
  };

  useEffect(() => {
    animationController(isInView);
    if (isHovered) {
      parentControls.start({ filter: "blur(0)" }, { duration: 1 });
    } else {
      parentControls.start({ filter: "blur(6px)" }, { duration: 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, isHovered, scrollDirection]);

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
        ref={pRef}
        animate={controls}
        className="uppercase text-white flex items-center h-full font-extrabold lg:text-6xl text-3xl gap-10 whitespace-nowrap font-sans"
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

const Robot = () => {
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
