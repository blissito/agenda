// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";

export const defaultImages = [
  "https://images.pexels.com/photos/5600005/pexels-photo-5600005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/5422855/pexels-photo-5422855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/5582798/pexels-photo-5582798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/5427540/pexels-photo-5427540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/29083766/pexels-photo-29083766/free-photo-of-colorida-celebracion-del-dia-de-muertos-en-mexico.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/29071379/pexels-photo-29071379/free-photo-of-iglesia-de-la-catrina.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

export default function SimpleGallery({
  images = defaultImages,
}: {
  images: string[];
}) {
  const [hovering, setHovering] = useState<number>(4);

  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const move = () => {
    timeout.current && clearTimeout(timeout.current);
    setHovering((index) => (index + 1) % images.length);
    timeout.current = setTimeout(move, 3000);
  };

  useEffect(() => {
    move();
  }, []);

  return (
    <article className="bg-slate-950">
      <h1 className="text-white text-5xl text-center py-16">
        Disfruta de la fiesta 🎃
      </h1>
      <section
        onMouseLeave={move}
        className="flex p-1 overflow-hidden h-screen gap-px pb-60"
      >
        <AnimatePresence>
          {images.map((img, index) => (
            <AnimatedImage
              isHovering={hovering === index}
              onHover={() => {
                setHovering(index);
                timeout.current && clearTimeout(timeout.current);
              }}
              src={img}
              key={img}
            />
          ))}
        </AnimatePresence>
      </section>
    </article>
  );
}

const AnimatedImage = ({
  src,
  isHovering,
  onHover,
}: {
  isHovering?: boolean;
  onHover?: (arg0: boolean) => void;
  src: string;
}) => {
  const handleEnter = () => onHover?.(true);
  return (
    <motion.img
      layout
      initial={{ width: "15%" }}
      animate={{ width: isHovering ? "50%" : "10%" }}
      transition={{ type: "spring", bounce: 0, duration: 1 }}
      onMouseEnter={handleEnter}
      className={cn("h-full object-cover shadow rounded-xl cursor-pointer")}
      src={src}
      alt="illustration"
    />
  );
};
