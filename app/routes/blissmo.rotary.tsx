import {
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  motion,
  MotionValue,
} from "framer-motion";
import { ReactNode, useRef } from "react";
import { cn } from "~/utils/cd";

export default function Route() {
  const target = useRef(null);
  const { scrollYProgress } = useScroll({ target });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log("scroll, ", latest);
  });

  const scrollSpring = useSpring(scrollYProgress, { bounce: 0.0 });
  const rotateZ = useTransform(scrollSpring, [0, 1], [-40, 20]);

  // emojies
  const y = useTransform(scrollSpring, [0, 0.15], ["30%", "0%"]);
  const opacity = useTransform(scrollSpring, [0, 0.15], [0, 1]);

  // swap text
  const textOneY = useTransform(
    scrollSpring,
    [0, 0.16, 0.31],
    ["50%", "0%", "-20%"]
  );

  const textTwoY = useTransform(
    scrollSpring,
    [0.31, 0.42, 0.57],
    ["50%", "0%", "-20%"]
  );

  const textThreeY = useTransform(
    scrollSpring,
    [0.57, 0.65, 1],
    ["50%", "0%", "-20%"]
  );

  const textFourY = useTransform(scrollSpring, [0.77, 0.89], ["50%", "0%"]);

  // op
  const opacityOne = useTransform(scrollSpring, [0, 0.16, 0.31], [0, 1, 0]);
  const opacityTwo = useTransform(scrollSpring, [0.31, 0.42, 0.57], [0, 1, 0]);
  const opacityThree = useTransform(
    scrollSpring,
    [0.57, 0.65, 0.77],
    [0, 1, 0]
  );
  const opacityFour = useTransform(scrollSpring, [0.77, 0.89], [0, 1]);

  useMotionValueEvent(scrollSpring, "change", (latest) => {
    console.log("scroll: ", latest);
  });

  return (
    <>
      <article>
        <div className="h-[40vh] bg-pink-500" />
        {/* Scroll area */}
        <main className="h-[600vh] lg:h-[400vh] relative" ref={target}>
          {/* Sticky container */}
          <section className="sticky h-[100vh] top-0 overflow-hidden pl-[10%]">
            {/* Emojies section */}
            <motion.div
              style={{
                y,
                opacity,
              }}
              className="w-[36vw] absolute top-0 bottom-0 flex flex-col justify-center gap-4 "
            >
              <div className="text-4xl flex gap-1">
                <Emoji style={{ opacity: opacityOne }}>🪄</Emoji>
                <Emoji style={{ opacity: opacityTwo }}>👽</Emoji>
                <Emoji style={{ opacity: opacityThree }}>🧉</Emoji>
                <Emoji style={{ opacity: opacityFour }}>🥳</Emoji>
              </div>

              <div className="relative">
                <Text
                  style={{
                    y: textOneY,
                    opacity: opacityOne,
                  }}
                >
                  <h2 className="text-3xl lg:text-6xl mb-4">
                    Ponte chido con el ejercicio
                  </h2>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Saepe impedit nihil aspernatur repellendus error. Atque
                  commodi placeat iure ducimus nemo architecto et odio, pariatur
                  unde adipisci praesentium iusto nobis! Nemo.
                </Text>

                <Text
                  style={{
                    y: textTwoY,
                    opacity: opacityTwo,
                  }}
                >
                  <h2 className="text-3xl lg:text-6xl mb-4">
                    O te pondrás marrano
                  </h2>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Saepe impedit nihil aspernatur repellendus error. Atque
                  commodi placeat iure ducimus nemo architecto et odio, pariatur
                  unde adipisci praesentium iusto nobis! Nemo.
                </Text>

                <Text
                  style={{
                    y: textThreeY,
                    opacity: opacityThree,
                  }}
                >
                  <h2 className="text-3xl lg:text-6xl mb-4">
                    y ya nadie te va a querer
                  </h2>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Saepe impedit nihil aspernatur repellendus error. Atque
                  commodi placeat iure ducimus nemo architecto et odio, pariatur
                  unde adipisci praesentium iusto nobis! Nemo.
                </Text>
                <Text
                  style={{
                    y: textFourY,
                    opacity: opacityFour,
                  }}
                >
                  <h2 className="text-3xl lg:text-6xl mb-4">
                    Porque así es la pinche gente
                  </h2>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Saepe impedit nihil aspernatur repellendus error. Atque
                  commodi placeat iure ducimus nemo architecto et odio, pariatur
                  unde adipisci praesentium iusto nobis! Nemo.
                </Text>
              </div>
            </motion.div>
            {/* Roatary anim container */}
            <div className="absolute flex items-center top-0 bottom-0 left-[90%]">
              <motion.section
                style={{
                  rotateZ,
                  //   y,
                  aspectRatio: 1,
                  //   transformStyle: "preserve-3d",
                }}
                className={cn(
                  "justify-center rounded-full",
                  "flex flex-col gap-y-[1.8%]",
                  //   "aspect-square"
                  "w-[250vw]"
                  //   "w-[70vw]"
                )}
              >
                <Video
                  className="rotate-[30deg] translate-x-[45%] translate-y-[-7%]"
                  src="https://dl.dropboxusercontent.com/s/e7fsnz9e8g5ngwqvk0y8h/24632438_z7AqYnq4.mp4?rlkey=czo2p7d3v35fndfjongci6yqy&st=zoe1fcb1&dl=0"
                />
                <Video
                  className="rotate-[14deg] translate-x-[11%] translate-y-[-7%]"
                  src="https://dl.dropboxusercontent.com/s/4kle801qkjkz0lw9qpjkt/24632437_cFlqNVLO.mp4?rlkey=ub4hte7ktze5658v66ci6axj8&st=5exnlo0e&dl=0"
                />
                <Video
                  className=""
                  src="https://dl.dropboxusercontent.com/s/4r1qys3nvzx3y6q3qwewb/24632436_69jCgczl.mp4?rlkey=4va5qw8xmxil8tak52de7fu7e&st=nw71j49v&dl=0"
                />
                <Video
                  className="rotate-[-14deg] translate-x-[11%] translate-y-[7%]"
                  src="https://dl.dropboxusercontent.com/s/qx0rp5f5h5bcoopp2b0d0/24632435_IdhNXXql.mp4?rlkey=bmthdyn0huc71pro38wa1twcw&st=wqm79hpd&dl=0"
                />
                <Video as="placeholder" />
              </motion.section>
            </div>
          </section>
        </main>
        <div className="h-[60vh] bg-yellow-500" />
      </article>
    </>
  );
}

const Text = ({
  children,
  style,
}: {
  style?: Record<string, MotionValue<any>>;
  children: ReactNode;
}) => {
  return (
    <motion.p style={style} className="text-xs lg:text-lg absolute top-0">
      {children}
    </motion.p>
  );
};

const Emoji = ({
  children,
  style,
}: {
  style?: Record<string, MotionValue<any>>;
  children?: ReactNode;
}) => {
  return (
    <section className="relative p-8">
      <motion.span
        style={style}
        className="rounded-full absolute inset-0 lg:text-6xl bg-orange-500"
      ></motion.span>
      <div className="absolute inset-0 flex justify-center items-center">
        {children}
      </div>
    </section>
  );
};

const Video = ({
  src,
  className,
  as,
  ...props
}: {
  as?: "placeholder";
  className?: string;
  src?: string;
}) => {
  return (
    <video
      style={{
        aspectRatio: 4.76 / 3.54,
      }}
      className={cn(
        "rounded-[50px] object-cover w-[16%] left-[-16%] relative",
        className
      )}
      muted
      autoPlay
      loop
      playsInline
      src={src}
      {...props}
    />
  );
};
