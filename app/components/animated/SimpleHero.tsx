import { motion, useScroll, useSpring, useTransform } from "motion/react"
import { cn } from "~/utils/cn"

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * max) + min
}

export const SimpleHero = () => {
  const { scrollYProgress } = useScroll()
  const smoothScroll = useSpring(scrollYProgress, {
    bounce: 0,
  })

  const rotateZ = useTransform(smoothScroll, [0, 1], [0, -45])

  const scale = useTransform(smoothScroll, [0, 1], [1, 0.2])

  const y = useTransform(smoothScroll, [0, 1], [0, 300])

  return (
    <section className="py-48 flex flex-col gap-8 justify-center items-center bg-gradient-to-br from-indigo-700 to-indigo-900 relative">
      <motion.h1
        style={{
          rotateZ,
          scale,
          y,
        }}
        className="font-bold font-sans text-4xl uppercase text-center"
      >
        Animaciones web con React y Motion
      </motion.h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/PG9sqAZjgXA?si=kdaTTnckFEJ1ZRhi"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="relative z-10"
      />
      <Particles />
    </section>
  )
}

const Particles = () => {
  return (
    <>
      <Particle position={{ x: "30vw", y: 50 }} />
      <Particle position={{ x: "-30vw", y: -50 }} />
      <Particle position={{ x: "-38vw", y: 200 }} />
      <Particle position={{ x: "35vw", y: 0 }} />
      <Particle position={{ x: "-35vw", y: -100 }} />
      <Particle position={{ x: "36vw", y: -70 }} />
      <Particle position={{ x: "-36vw", y: 70 }} />
      <Particle position={{ x: "45vw", y: 70 }} />
      <Particle
        mode="cross"
        position={{
          x: "31vw",
          y: -100,
        }}
      />
      <Particle
        mode="cross"
        position={{
          x: "-40vw",
          y: 0,
        }}
      />
      <Particle
        mode="cross"
        position={{
          x: "-30vw",
          y: 100,
        }}
      />
      <Particle
        mode="cross"
        position={{
          x: "40vw",
          y: 150,
        }}
      />
      <Particle
        mode="cross"
        position={{
          x: "32vw",
          y: 120,
        }}
      />
      <Particle
        mode="cross"
        position={{
          x: "-45vw",
          y: 50,
        }}
      />
    </>
  )
}

const Particle = ({
  position,
  mode = "cube",
}: {
  mode?: "cross" | "cube"
  position: { x: string; y: number | string }
}) => {
  const { scrollYProgress } = useScroll()
  const smoothScroll = useSpring(scrollYProgress, {
    bounce: 0.2,
  })

  const x = useTransform(smoothScroll, [0, 1], [position.x, "0vw"])

  const y = useTransform(smoothScroll, [0, 1], [position.y, 0])

  const isRight = !position.x.includes("-")

  const rotateZ = useTransform(
    smoothScroll,
    [0, 1],
    isRight ? [getRandomNumber(0, -85), -360] : [getRandomNumber(0, 85), 360],
  )

  return (
    <motion.div
      style={{
        rotate: mode === "cross" ? "45deg" : undefined,
        ...position,
        x,
        y,
        rotateZ,
        clipPath:
          mode === "cross"
            ? `polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)`
            : undefined,
      }}
      className={cn(
        "w-6 h-6 bg-gradient-to-r from-pink-500 to-pink-600 absolute",
        {
          "from-blue-500 to-blue-700 w-4 h-4": mode === "cube",
        },
      )}
    />
  )
}
