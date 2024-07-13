import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cd";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
} from "framer-motion";
import { createPortal } from "react-dom";

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export default function Page() {
  return (
    <article className="flex bg-slate-100 h-screen gap-1 p-24 overflow-hidden justify-evenly">
      <WhiteCard id="one">
        <img
          className="object-cover w-full h-full flex-1"
          src="https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="playa"
        />
      </WhiteCard>
      <WhiteCard id="two">
        <img
          className="object-cover w-full h-full flex-1"
          src="https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="playa"
        />
      </WhiteCard>
      <WhiteCard id="three">
        <img
          className="object-cover w-full h-full flex-1"
          src="https://images.pexels.com/photos/269583/pexels-photo-269583.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="playa"
        />
      </WhiteCard>
      <WhiteCard id="pig" className="col-span-2 row-span-2 z-10">
        <img
          className="object-cover w-full h-full flex-1"
          src="https://images.pexels.com/photos/66258/staniel-cay-swimming-pig-seagull-fish-66258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="playa"
        />
      </WhiteCard>
      <WhiteCard id="five">
        <img
          className="object-cover w-full h-full flex-1"
          src="https://images.pexels.com/photos/356807/pexels-photo-356807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="playa"
        />
      </WhiteCard>
      <WhiteCard id="six">
        <img
          className="object-cover w-full h-full flex-1"
          src="https://images.pexels.com/photos/163872/italy-cala-gonone-air-sky-163872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="playa"
        />
      </WhiteCard>
    </article>
  );
}

const WhiteCard = ({
  children,
  className,
  isActive,
  id,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) => {
  //   const [isActive, set] = useState(false); // should be a prop

  useEffect(() => {
    const onKeyPress = ({ key }: KeyboardEvent) => {
      console.log("KEY: ", key);
      if (key === "Escape") {
        set(false);
      }
    };
    addEventListener("keydown", onKeyPress);
    return () => removeEventListener("keydown", onKeyPress);
  }, []);

  const width = useMotionValue("auto");

  return (
    <>
      {/* <CardContainer containerClassName={"select-none" + className}> */}
      <motion.button
        style={{ width: "100%" }}
        whileHover={{ width: "600%" }}
        transition={{ type: "spring", bounce: 0 }}
        //   style={{
        //     width,
        //   }}
        //   onMouseEnter={() => {
        //     width.set("400px");
        //   }}
        //   onMouseLeave={() => {
        //     width.set("auto");
        //   }}
        className={cn(
          "text-3xl rounded-2xl shadow hover:shadow-2xl bg-white h-full flex justify-center items-center overflow-hidden hover:z-20 relative"
          // itemClassName
          // "hover:w-[400px] w-[60px] hover:z-10 relative transition-all"
        )}
        //   onClick={() => set((v) => !v)}
      >
        {children}
      </motion.button>
      {/* </CardContainer> */}
    </>
  );
};

const CardContainer = ({
  children,
  className,
  containerClassName,
  style,
  ...props
}: {
  style?: Record<string, string | number | undefined>;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  props?: unknown;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 6;
    const y = -(e.clientY - top - height / 2) / 6;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
    if (!containerRef.current) return;
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn(containerClassName)}
        style={{
          perspective: "1000px",
          ...style,
        }}
        {...props}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center justify-center transition-all duration-200 ease-linear h-full",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};
