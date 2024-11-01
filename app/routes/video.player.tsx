import { useLoaderData } from "@remix-run/react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { BsMenuButtonWide } from "react-icons/bs";
import { FaGooglePlay, FaPlay } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import {
  MdMenuOpen,
  MdOutlineRadioButtonChecked,
  MdOutlineRadioButtonUnchecked,
} from "react-icons/md";
import { cn } from "~/utils/cd";
import { useClickOutside } from "~/utils/hooks/useClickOutside";

export const loader = async () => {
  return {
    lesson: {
      title: "Creando el componente",
      video: {
        poster: "https://i.imgur.com/nITUzj1.png",
        type: "video/mov",
        src: "https://firebasestorage.googleapis.com/v0/b/fixter-67253.appspot.com/o/fixtergeek.com%2Fmicro-cursos%2Fintrocss%2F1_boxModel.mov?alt=media&token=54cc5e8a-0f90-4df8-9c98-cedfeef6c765",
      },
    },
  };
};

export default function Route() {
  const { lesson } = useLoaderData<typeof loader>();
  const handleEnding = () => {
    // @TODO: change to next video (navigate?)
  };
  return (
    <article className="bg-slate-950 relative overflow-x-hidden">
      <VideoPlayer
        onEnding={handleEnding}
        type={lesson.video.type}
        src={lesson.video.src}
        poster={lesson.video.poster}
      />
      <VideosMenu />
    </article>
  );
}

const VideosMenu = () => {
  const [isOpen, setIsOpen] = useState(true);
  const x = useMotionValue(0);
  const springX = useSpring(x, { bounce: 0.2 });
  const buttonX = useTransform(springX, [-400, 0], [0, 394]);

  useEffect(() => {
    isOpen ? x.set(0) : x.set(-400);
  }, [isOpen, x]);
  return (
    <>
      <MenuButton
        x={buttonX}
        onToggle={() => setIsOpen((o) => !o)}
        isOpen={isOpen}
      />
      <MenuListContainer
        isOpen={isOpen}
        x={springX}
        onOutsideClick={() => setIsOpen(false)}
      >
        <ModuleHeader isCompleted title="Basics" subtitle="capitulo 01" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ListItem
            isCompleted
            key={i}
            duration={18}
            title={"titulo de ejemplo"}
          />
        ))}
        {/* Otro  */}
        <ModuleHeader title="Instalaciones" subtitle="capitulo 02" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ListItem
            isCurrent={i === 1}
            key={i}
            duration={18}
            title={"titulo de ejemplo"}
          />
        ))}
        {/* Otro */}
        <ModuleHeader title="Conceptos avanzados" subtitle="capitulo 03" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ListItem key={i} duration={18} title={"instalando perro"} />
        ))}
      </MenuListContainer>
    </>
  );
};

const ListItem = ({
  isCompleted,
  duration,
  title,
  isCurrent,
}: {
  isCurrent?: boolean;
  duration: number;
  isCompleted?: boolean;
  title: string;
}) => {
  return (
    <div
      className={cn(
        "text-gray-600 pl-2 flex py-4 justify-around hover:bg-gray-900 cursor-pointer rounded-2xl hover:text-gray-400 transition-all",
        {
          "bg-gray-800 hover:text-white text-white hover:bg-gray-800":
            isCurrent,
        }
      )}
    >
      <span
        className={cn("text-2xl", {
          "text-green-500": isCompleted,
          "p-2 bg-indigo-500 rounded-full": isCurrent,
        })}
      >
        {isCurrent ? (
          <FaPlay />
        ) : isCompleted ? (
          <MdOutlineRadioButtonChecked />
        ) : (
          <MdOutlineRadioButtonUnchecked />
        )}
      </span>
      <span className="capitalize text-sm">{title}</span>
      <span className="text-xs">{duration}m</span>
    </div>
  );
};

const MenuListContainer = ({
  children,
  x = 0,
  onOutsideClick,
  isOpen: isActive = false,
}: {
  isOpen?: boolean;
  children: ReactNode;
  x?: MotionValue | number;
  onOutsideClick?: () => void;
}) => {
  const ref = useClickOutside({ isActive, onOutsideClick });
  const maskImage = useMotionTemplate`linear-gradient(to bottom, white 80%, transparent 100%`;
  return (
    <motion.div
      ref={ref}
      style={{
        x,
        scrollbarWidth: "none",
        maskImage,
      }}
      className="bg-gray-950 md:w-[380px] w-[300px] absolute z-20 inset-2 rounded-xl overflow-y-scroll h-[88%]"
    >
      {children}
    </motion.div>
  );
};

const ModuleHeader = ({
  title,
  subtitle,
  isCompleted,
}: {
  isCompleted?: boolean;
  title: string;
  subtitle?: string;
}) => {
  return (
    <header className="text-indigo-600 rounded-lg pl-9 py-3 bg-gray-800 flex items-center gap-4 mb-2">
      <span className={cn("text-4xl", isCompleted && "text-green-500")}>
        {isCompleted ? (
          <MdOutlineRadioButtonChecked />
        ) : (
          <MdOutlineRadioButtonUnchecked />
        )}
      </span>
      <div>
        <p className="font-sans capitalize font-extrabold text-white">
          {subtitle}
        </p>
        <h3
          className={cn("text-2xl font-bold font-sans", {
            "text-green-500": isCompleted,
          })}
        >
          {title}
        </h3>
      </div>
    </header>
  );
};

const MenuButton = ({
  isOpen,
  x = 0,
  onToggle,
}: {
  x?: MotionValue | number;
  onToggle?: () => void;
  isOpen?: boolean;
}) => {
  return (
    <motion.button
      whileHover={{ left: -2 }}
      style={{ x }}
      onClick={onToggle}
      className={cn(
        "absolute bg-gray-900 text-4xl w-20 h-20 text-white top-16 z-20 flex items-center justify-center rounded-r-2xl hover:bg-gray-800",
        {
          "left-[-80px] md:left-auto": isOpen,
          "rounded-2xl": isOpen,
        }
      )}
    >
      <AnimatePresence mode="popLayout">
        {isOpen ? (
          <motion.span
            key="open"
            initial={{ filter: "blur(4px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            exit={{ filter: "blur(4px)", opacity: 0 }}
          >
            <MdMenuOpen />
          </motion.span>
        ) : (
          <motion.span
            initial={{ filter: "blur(4px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            exit={{ filter: "blur(4px)", opacity: 0 }}
            key="close"
          >
            <BsMenuButtonWide />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const VideoPlayer = ({
  src,
  type = "video/mov",
  onPlay,
  onEnding,
  poster,
}: {
  poster?: string;
  onEnding?: () => void;
  type?: string;
  src?: string;
  onPlay?: () => void;
}) => {
  // @TODO initiate loading with no play button
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const togglePlay = () => {
    const controls = videoRef.current || null;
    if (!controls) return;
    // main action
    if (controls.paused) {
      controls.play();
      onPlay?.();
    } else {
      controls.pause();
    }
    setIsPlaying(!controls.paused);
    // listeners
    controls.onplaying = () => setIsPlaying(true);
    controls.onplay = () => setIsPlaying(true);
    controls.onpause = () => setIsPlaying(false);
    controls.ontimeupdate = (e) => {
      if (controls.duration - controls.currentTime < 15) {
        setIsEnding(true);
        onEnding?.();
      } else {
        setIsEnding(false);
      }
    };
  };

  return (
    <section className="h-screen relative overflow-x-hidden">
      <AnimatePresence>
        {!isPlaying && (
          <motion.button
            onClick={togglePlay}
            initial={{ backdropFilter: "blur(4px)" }}
            animate={{ backdropFilter: "blur(4px)" }}
            exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
            transition={{ duration: 0.2 }}
            key="play_button"
            className="absolute inset-0 bottom-16 flex justify-center items-center cursor-pointer z-10"
          >
            <span className="border flex items-center justify-center text-6xl text-white rounded-full bg-indigo-500 w-[120px] h-[90px]">
              <FaGooglePlay />
            </span>
          </motion.button>
        )}
        {isEnding && (
          <motion.button
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", bounce: 0.2 }}
            whileHover={{ scale: 1.05 }}
            exit={{ opacity: 0, filter: "blur(9px)", x: 50 }}
            initial={{ opacity: 0, filter: "blur(9px)", x: 50 }}
            animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
            className="absolute right-2 bg-gray-100 z-20 bottom-20 md:top-4 md:right-4 md:left-auto md:bottom-auto left-2 md:w-[500px] px-6 pt-3 pb-6 rounded-3xl flex gap-4 shadow-sm items-end"
          >
            <button
              onClick={() => setIsEnding(false)}
              className="self-end text-4xl active:scale-95 md:hidden absolute right-4 top-1"
            >
              <IoIosClose />
            </button>
            <div>
              <p className="text-left text-lg">Siguiente video</p>
              <h4 className="text-2xl md:w-[280px] md:truncate text-left">
                Título del siguiente video aunque no quepa
              </h4>
            </div>
            <img
              alt="poster"
              src={poster}
              className="aspect-video w-40 rounded-xl"
            />
          </motion.button>
        )}
      </AnimatePresence>
      <video
        poster={poster}
        controlsList="nodownload"
        ref={videoRef}
        className="w-full h-full"
        controls
        src={src}
      >
        <track kind="captions" />
        <source src={src} type={type} />
      </video>
    </section>
  );
};
