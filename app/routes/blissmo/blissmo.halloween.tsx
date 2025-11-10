import { defaultImages } from "~/components/animated/SimpleGallery";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function Route() {
  const imgs = defaultImages;
  const [index, setIndex] = useState(4);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const move = () => {
    timeout.current && clearTimeout(timeout.current);
    setIndex((indx) => (indx + 1) % imgs.length);
    timeout.current = setTimeout(move, 3000);
  };

  useEffect(() => {
    move();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article className="bg-slate-950">
      <div className="h-[100vh] bg-indigo-800" />
      <h2 className="text-5xl text-white text-center pt-16">
        Disfruta de la fiesta 🎃
      </h2>
      <section
        className="flex overflow-hidden gap-px py-40 h-screen"
        onMouseLeave={move}
      >
        {imgs.map((img, i) => (
          <AnimatedImage
            onHover={() => {
              timeout.current && clearTimeout(timeout.current);
              setIndex(i);
            }}
            isHovered={index === i}
            key={img}
            src={img}
          />
        ))}
      </section>
      <div className="h-[100vh] bg-slate-800" />
    </article>
  );
}

const AnimatedImage = ({
  src,
  isHovered,
  onHover,
}: {
  onHover?: () => void;
  isHovered?: boolean;
  src?: string;
}) => {
  return (
    <motion.img
      transition={{ type: "spring", bounce: 0.2 }}
      onMouseEnter={onHover}
      className="h-full object-cover rounded-xl cursor-grab"
      animate={{ width: isHovered ? "50%" : "10%" }}
      src={src}
      alt="pic"
    />
  );
};
