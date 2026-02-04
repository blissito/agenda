import {
  MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { Children, type ReactNode, useRef } from "react"
import { cn } from "~/utils/cn"

export default function CircularGallery({
  children,
  emojis,
  videos,
}: {
  videos: string[]
  emojis: string[]
  children: ReactNode
}) {
  const texts = Children.toArray(children)
  const target = useRef(null)
  const { scrollYProgress } = useScroll({ target })
  const scrollSpring = useSpring(scrollYProgress, { bounce: 0.0 })
  const rotateZ = useTransform(scrollSpring, [0, 1], [-40, 14])

  // emojies
  const y = useTransform(scrollSpring, [0, 0.15], ["30%", "0%"])
  const opacity = useTransform(scrollSpring, [0, 0.15], [0, 1])

  const limits = [
    [0, 0.189, 0.31],
    [0.31, 0.47, 0.63],
    [0.63, 0.737, 0.859],
    [0.859, 0.9],
  ]

  // swap text
  const textOneY = useTransform(scrollSpring, limits[0], ["50%", "0%", "-20%"])

  const textTwoY = useTransform(scrollSpring, limits[1], ["50%", "0%", "-20%"])

  const textThreeY = useTransform(scrollSpring, limits[2], [
    "50%",
    "0%",
    "-20%",
  ])

  const textFourY = useTransform(scrollSpring, limits[3], ["50%", "0%"])

  // opacities
  const opacityOne = useTransform(scrollSpring, limits[0], [0, 1, 0])
  const opacityTwo = useTransform(scrollSpring, limits[1], [0, 1, 0])
  const opacityThree = useTransform(scrollSpring, limits[2], [0, 1, 0])
  const opacityFour = useTransform(scrollSpring, limits[3], [0, 1])

  useMotionValueEvent(scrollSpring, "change", (_latest) => {
    // console.log("scroll: ", latest);
  })

  return (
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
            {/* Este margen modifica todo */}
            <div className="text-4xl flex gap-1 -mt-28">
              <Emoji style={{ opacity: opacityOne }}>{emojis[0]}</Emoji>
              <Emoji style={{ opacity: opacityTwo }}>{emojis[1]}</Emoji>
              <Emoji style={{ opacity: opacityThree }}>{emojis[2]}</Emoji>
              <Emoji style={{ opacity: opacityFour }}>{emojis[3]}</Emoji>
            </div>

            <div className="bg-red-500 relative">
              <Text style={{ y: textOneY, opacity: opacityOne }}>
                {texts[0]}
              </Text>
              <Text style={{ y: textTwoY, opacity: opacityTwo }}>
                {texts[0]}
              </Text>
              <Text style={{ y: textThreeY, opacity: opacityThree }}>
                {texts[0]}
              </Text>
              <Text style={{ y: textFourY, opacity: opacityFour }}>
                {texts[0]}
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
                "w-[250vw]",
                //   "w-[70vw]"
              )}
            >
              <Video
                className="rotate-[30deg] translate-x-[45%] translate-y-[-7%]"
                src={videos[0]}
              />
              <Video
                className="rotate-[14deg] translate-x-[11%] translate-y-[-7%]"
                src={videos[1]}
              />
              <Video className="" src={videos[2]} />
              <Video
                className="rotate-[-14deg] translate-x-[11%] translate-y-[7%]"
                src={videos[3]}
              />
              <Video as="placeholder" />
            </motion.section>
          </div>
        </section>
      </main>
      <div className="h-[60vh] bg-yellow-500" />
    </article>
  )
}

export const Text = ({
  children,
  style,
}: {
  style?: Record<string, MotionValue<any>>
  children: ReactNode
}) => {
  return (
    <motion.div style={style} className="text-xs lg:text-lg absolute top-0">
      {children}
    </motion.div>
  )
}

export const Emoji = ({
  children,
  style,
}: {
  style?: Record<string, MotionValue<any>>
  children?: ReactNode
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
  )
}
Emoji.type = "Emoji"

const Video = ({
  src,
  className,
  as,
  ...props
}: {
  as?: "placeholder"
  className?: string
  src?: string
}) => {
  return (
    <video
      style={{
        aspectRatio: 4.76 / 3.54,
      }}
      className={cn(
        "rounded-[50px] object-cover w-[16%] left-[-16%] relative",
        className,
      )}
      muted
      autoPlay
      loop
      playsInline
      src={src}
      {...props}
    />
  )
}
