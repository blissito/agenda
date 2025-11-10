import { faker } from "@faker-js/faker";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { type MouseEvent, type ReactNode, useEffect, useState } from "react";

export const MosaicHero = ({ children }: { children?: ReactNode }) => {
  const [viewPortWidth, setViewportWidth] = useState(1);

  const x = useMotionValue(0); // mouse
  const y = useMotionValue(0);

  // movement
  const percentage = useTransform(
    x,
    (latest) => latest / (viewPortWidth + 400) // from 0 to 100% of the screen on X
  );
  const containerX = useSpring(
    useTransform(percentage, [0, 1], [0, (viewPortWidth / 2) * -1]),
    { bounce: 0.2 } // adding soft spring curve
  );

  // listener
  const handleMouseMove = (event: MouseEvent) => {
    x.set(event.clientX);
    y.set(event.clientY);
  };

  // update viewport size @todo improve?
  useEffect(() => {
    if (window) {
      setViewportWidth(innerWidth);
    }
  }, []);

  return (
    <>
      <article
        onMouseMove={handleMouseMove}
        className="flex flex-wrap h-[80vh] w-full overflow-hidden relative"
      >
        <section className="inset-0 absolute bg-gradient-to-r from-gray-950 to-transparent z-10 flex items-start text-gray-100 px-20 py-28 justify-start">
          <div className="flex-1">{children}</div>
        </section>
        <motion.section
          style={{
            x: containerX,
          }}
          className="h-full min-w-[150vw] flex flex-wrap"
        >
          {Array.from({ length: 100 }).map((_, index) => (
            <ImageCube
              key={index}
              index={index}
              srcset={[
                faker.image.url({
                  width: 600,
                  height: 600,
                }),
                faker.image.url({
                  width: 600,
                  height: 600,
                }),
              ]}
            />
          ))}
        </motion.section>
      </article>
      <section className="bg-gradient-to-r flex items-center justify-center from-blue-400 via-yellow-300 to-green-400 h-[12vh]">
        <p className="lg:text-5xl md:text-2xl text-xl text-center">
          <strong className="uppercase font-thin font-sans">
            Nueva investigación:
          </strong>{" "}
          <span className="font-bold font-sans">
            Las nuevas tendencias en podcasting
          </span>
        </p>
      </section>
    </>
  );
};

export const ImageCube = ({
  index = 1,
  srcset = [],
}: {
  index?: number;
  srcset?: string[];
}) => {
  const x = useSpring(0, { bounce: 0 });
  const start = () => {
    if (x.get() === 0) {
      x.set(-160);
    } else {
      x.set(0);
    }
    setTimeout(start, 2000 * index);
  };

  useEffect(() => {
    setTimeout(start, 500 * index);
  }, []);

  return (
    <section className="overflow-hidden w-40 aspect-square">
      <motion.div
        style={{
          x,
        }}
        className="flex"
      >
        <img
          src={srcset[0]}
          alt="first"
          className="w-full h-full object-cover"
        />
        <img
          src={srcset[1]}
          alt="second"
          className="w-full h-full aspect-square object-cover"
        />
      </motion.div>
    </section>
  );
};
