import { type ReactNode, useRef } from "react";
import {
  motion,
  type MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "~/utils/cn";
import { FaWeightScale } from "react-icons/fa6";

const floatingElements = [
  "https://cdn.prod.website-files.com/667fa6c733097c1516bb9760/667fa6c733097c1516bb977a_hero-watch-p-500.webp",
  "https://cdn.prod.website-files.com/667fa6c733097c1516bb9760/668f82b13e112babe64c9b36_widget-hero-dark.webp",
  "https://cdn.prod.website-files.com/667fa6c733097c1516bb9760/667fa6c733097c1516bb977b_circle-blue-p-500.webp",
  "https://cdn.prod.website-files.com/667fa6c733097c1516bb9760/668f8308983e734e585bbb6d_hero-element-p-500.webp",
  "",
];
export const PhoneHero = ({ title }: { title: ReactNode }) => {
  const scrollerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollerRef });

  return (
    <article className="h-[600vh]" ref={scrollerRef}>
      <Container scrollYProgress={scrollYProgress} title={title}>
        <FloatingElements
          srcset={floatingElements}
          scrollYProgress={useSpring(scrollYProgress, { bounce: 0 })}
        />
        <Circles scrollYProgress={scrollYProgress} />
        <Phone scrollYProgress={scrollYProgress} />
        <Paragraph scrollYProgress={scrollYProgress} />
      </Container>
    </article>
  );
};

const Paragraph = ({ scrollYProgress }: { scrollYProgress: MotionValue }) => {
  const y = useTransform(scrollYProgress, [0.6, 1], ["100vh", "-25vh"]);
  const rotateZ = useTransform(scrollYProgress, [0.5, 1], [-500, 0]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);
  return (
    <section className="inset-0 fixed flex flex-col justify-end items-center pb-20 pointer-events-none bottom-0 left-0 right-0">
      <motion.main
        style={{
          y,
          opacity,
        }}
      >
        <div className="flex justify-center mb-6">
          <motion.span
            style={{
              rotateZ,
            }}
            className="text-4xl bg-white text-black h-20 w-20 rounded-full grid place-content-center"
          >
            <FaWeightScale />
          </motion.span>
        </div>
        <p className="text-white text-center font-extrabold font-sans text-2xl mb-6">
          Consigue un técnica de animación;
          <br />
          una forma de pensar que te permitirá <br />
          alcanzar tus objetivos.
        </p>
        <p className="text-gray-300 text-xs text-center">
          Animaciones que te enseñarán a pensar como animador
        </p>
      </motion.main>
    </section>
  );
};

const Circles = ({ scrollYProgress }: { scrollYProgress: MotionValue }) => {
  const scale = useTransform(scrollYProgress, [0.2, 1], [0, 4]);
  const y = useTransform(scrollYProgress, [0, 1], ["50vh", "-100vh"]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, 1, 1, 0]);

  const absoluteCentering =
    "absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]";
  return (
    <motion.section
      style={{
        scale,
        y,
        opacity,
      }}
      className="fixed inset-0 pointer-events-none"
    >
      <div
        className={cn(
          "rounded-full w-[800px] h-[800px] border-8 blur-md border-indigo-300",
          absoluteCentering
        )}
      />
      <div
        className={cn(
          "rounded-full w-[500px] h-[500px] border-8 blur-md border-pink-300",
          absoluteCentering
        )}
      />
      <div
        className={cn(
          "rounded-full w-[300px] h-[300px] border-8 blur-md border-blue-300",
          absoluteCentering
        )}
      />
    </motion.section>
  );
};

const FloatingElements = ({
  srcset = [],
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
  srcset?: string[];
}) => {
  const yCero = useTransform(scrollYProgress, [0, 0.25], ["65vh", "-50vh"]);
  const yOne = useTransform(scrollYProgress, [0, 0.25], ["55vh", "-80vh"]);
  // blured items
  const yTwo = useTransform(scrollYProgress, [0, 0.25], ["55vh", "-150vh"]);
  const yThree = useTransform(scrollYProgress, [0, 0.25], ["65vh", "-40vh"]);
  return (
    <section className="inset-0 fixed z-10 pointer-events-none">
      <motion.img
        style={{ y: yCero, x: "25vw" }}
        className="w-[18%] absolute"
        src={srcset[0]}
        alt="floating"
      />
      <motion.img
        style={{ y: yOne, x: "55vw" }}
        className="w-[15%] absolute"
        src={srcset[1]}
        alt="floating"
      />
      <motion.img
        style={{ y: yTwo, x: "15vw" }}
        className="w-[22%] absolute -z-10"
        src={srcset[2]}
        alt="floating"
      />

      <motion.img
        style={{ y: yThree, x: "60vw" }}
        className="w-[22%] absolute -z-10"
        src={srcset[3]}
        alt="floating"
      />
    </section>
  );
};

const Phone = ({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) => {
  // @todo: need to know viewPort size
  const y = useTransform(scrollYProgress, [0, 1], ["50vh", "0vh"]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 1], [1, 0.9, 1.5]);

  return (
    <div className="w-[34%] mx-auto fixed inset-0">
      <motion.img
        style={{
          y,
          scale,
        }}
        className=""
        src="https://cdn.prod.website-files.com/667fa6c733097c1516bb9760/668f83875932f67a6ee4d360_hero-phone-p-500.webp"
        alt="iphone"
      />
    </div>
  );
};

const Container = ({
  scrollYProgress,
  className,
  title,
  children,
}: {
  scrollYProgress: MotionValue;
  className?: string;
  title: ReactNode;
  children?: ReactNode;
}) => {
  // container
  const containerY = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [0, -100]),
    {
      bounce: 0,
    }
  );
  const containerScale = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [0.9, 0.6]),
    {
      bounce: 0,
    }
  );
  // title
  const titleOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.05], [1, 0]),
    {
      bounce: 0,
    }
  );

  const titleY = useTransform(scrollYProgress, [0, 0.15], [0, 500]);

  return (
    <section
      className={cn("h-[20%] py-20 relative flex flex-col pb-60", className)}
    >
      {/* Background rectangle */}
      <motion.div
        style={{ y: containerY, scale: containerScale }}
        className="inset-0 absolute rounded-[60px] bg-gradient-to-br from-blue-400 to-pink-300 -z-10"
      />
      {/* Title and buttons */}
      <motion.div
        style={{ opacity: titleOpacity, y: titleY }}
        className="flex-col flex justify-center text-4xl tracking-tight font-bold items-center gap-4 py-12 text-center"
      >
        {title}
        <nav className="flex gap-2">
          <button className="flex text-xs h-10 w-[110px] border border-black rounded-full items-center justify-between px-4">
            <span className="h-4">
              <AppleIcon />
            </span>
            <span className="font-thin">App Store</span>
          </button>
          <button className="flex text-xs h-10 w-[110px] border border-black rounded-full items-center justify-between px-4">
            <span className="h-4">
              <PlayIcon />
            </span>
            <span className="font-thin">Google Play</span>
          </button>
        </nav>
      </motion.div>
      {/* Phone and elements 
      @todo: get out from children and just put'em in here
      */}
      <div className="mt-auto">{children}</div>
    </section>
  );
};

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 3.29877C6.70254 2.90598 7.5327 2.89682 8.23976 3.29305L17 8.19549L14.2339 11L6 3.29877ZM5 5.11054C5 4.70929 5.12092 4.33078 5.33193 4L14 11.667L5.3094 20C5.11025 19.676 5 19.3055 5 18.9167V5.11054ZM20.8208 10.3833L18.08 9L15 11.816L18.7746 15L20.822 13.9666C21.5588 13.5931 22 12.9234 22 12.1744C21.9988 11.4253 21.5588 10.7557 20.8208 10.3833ZM6 20.672L14.5204 12L18 15.2666L8.33671 20.6945C7.97392 20.8985 7.57751 21 7.18343 21C6.77543 21 6.36975 20.8867 6 20.672Z"
      fill="currentColor"
    ></path>
  </svg>
);

const AppleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M14.7129 5.42285C15.3086 4.7002 15.7285 3.71387 15.7285 2.71777C15.7285 2.58105 15.7188 2.44434 15.6992 2.33691C14.7227 2.37598 13.5508 2.98145 12.8574 3.80176C12.3008 4.42676 11.793 5.42285 11.793 6.41895C11.793 6.5752 11.8223 6.72168 11.832 6.77051C11.8906 6.78027 11.9883 6.7998 12.0957 6.7998C12.9648 6.7998 14.0586 6.21387 14.7129 5.42285ZM15.3965 7.00488C13.9414 7.00488 12.75 7.89355 11.9883 7.89355C11.1777 7.89355 10.123 7.06348 8.85352 7.06348C6.44141 7.06348 4 9.05566 4 12.8057C4 15.1494 4.89844 17.6201 6.02148 19.2119C6.97852 20.5596 7.81836 21.6631 9.0293 21.6631C10.2207 21.6631 10.748 20.8721 12.2324 20.8721C13.7363 20.8721 14.0781 21.6436 15.3965 21.6436C16.7051 21.6436 17.5742 20.4424 18.4043 19.2607C19.3223 17.9033 19.7129 16.585 19.7227 16.5166C19.6445 16.4971 17.1445 15.4717 17.1445 12.6104C17.1445 10.1299 19.1074 9.0166 19.2246 8.92871C17.9258 7.06348 15.9434 7.00488 15.3965 7.00488Z"
      fill="currentColor"
    ></path>
  </svg>
);
