import { motion, useScroll, useTransform } from "motion/react"
import { Children, type ReactNode, useRef } from "react"

//**********************************This is Still a Work in progress */

export const ParallaxHero = ({ children }: { children: ReactNode }) => {
  const count = Children.count(children)
  if (count < 2) throw "Se necesitan dos nodos para crear el parallax"

  const hero = Children.toArray(children)[0]
  const section = Children.toArray(children)[1]
  const target = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"], // 1. 0 end start, 1 when start start
    target,
  })
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]) // when Y=0 => scale=1
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]) // when Y=1 => y=150%
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.25], [1, 1, 0])
  const blur = useTransform(scrollYProgress, [0, 0.25], ["blur(0px)", "blur(8px)"])

  return (
    <motion.div ref={target} className="relative isolate">
      {/* z-0: el hero queda DEBAJO de las cards. Al scrollear se encoge,
          baja y se desvanece (con blur) mientras las cards lo cubren. */}
      <motion.div
        className="relative z-0"
        style={{
          opacity,
          scale: scale,
          y,
          filter: blur,
        }}
      >
        {hero}
      </motion.div>
      {/* z-10: las cards con parallax se posicionan ENCIMA del texto del hero */}
      <motion.div
        className="relative z-10"
        style={{
          y: -1, // in order to cover hero with bg
        }}
      >
        {section}
      </motion.div>
    </motion.div>
  )
}
