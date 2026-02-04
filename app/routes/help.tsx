import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react"
import { type MouseEvent, useRef } from "react"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { FeaturesList } from "~/components/icons/cathegories/featuresList"
import { Graduate } from "~/components/icons/cathegories/graduate"
import { Rocket } from "~/components/icons/rocket"

export default function Index() {
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] pb-[120px]">
        <TopBar />
        <div className="grid grid-cols-8 max-w-[90%] xl:max-w-7xl mx-auto pt-[240px] ">
          <Catalogue />
          <Content />
        </div>
      </div>
      <Footer />
    </main>
  )
}

export const Content = () => {
  return (
    <section className="col-span-6 ">
      <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center justify-start ">
        <span className="mr-4"> Ayuda,</span>
        <Rocket className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
        <span className="ml-4 mr-4"> recursos </span> y soporte
      </h2>
      <p className="mt-6 text-brand_gray text-lg">
        Encuentre las respuestas que necesita para aprovechar todo el potencial
        de Deník e impulsa las ventas de tu negocio. Chatea con nuestro equipo o
        envía un correo electrónico a support@deník.app
      </p>
      <div className="grid grid-cols-2 mt-16 gap-12">
        <TiltCard
          title="Cómo configurar tu agenda"
          link="/"
          description="Lorem ipsum dolor sit amet consectetur. Malesuada porta facilisis sit ut quis quam proin. "
        />
        <TiltCard
          title="Cómo configurar tu agenda"
          link="/"
          description="Lorem ipsum dolor sit amet consectetur. Malesuada porta facilisis sit ut quis quam proin. "
        />
      </div>
    </section>
  )
}

const ROTATION_RANGE = 32.5
const HALF_ROTATION_RANGE = 32.5 / 2

const TiltCard = ({
  image,
  link,
  title,
  description,
}: {
  image?: string
  title: string
  link: string
  description: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x)
  const ySpring = useSpring(y)

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return [0, 0]

    const rect = ref.current.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1
    const rY = mouseX / width - HALF_ROTATION_RANGE

    x.set(rX)
    y.set(rY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className="relative "
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className=" inset-4 grid place-content-center "
      >
        <section className="w-full">
          <img
            className="h-[240px] w-full object-cover rounded-2xl"
            src={image ? image : "/images/serviceDefault.png"}
          />
          <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
          <p className="mb-4 mt-1 text-brand_gray">{description}</p>
          <span className="text-brand_blue font-satoMiddle underline ">
            Ver más
          </span>
        </section>
      </div>
    </motion.div>
  )
}

export const BlogCard = ({
  image,
  link,
  title,
  description,
}: {
  image?: string
  title: string
  link: string
  description: string
}) => {
  return (
    <section className="w-full">
      <img
        className="h-[240px] w-full object-cover rounded-2xl"
        src={image ? image : "/images/serviceDefault.png"}
      />
      <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
      <p className="mb-4 mt-1 text-brand_gray">{description}</p>
      <span className="text-brand_blue font-satoMiddle underline ">
        Ver más
      </span>
    </section>
  )
}

export const Catalogue = () => {
  return (
    <section className="col-span-2">
      <input placeholder="hola" />
      <div className="text-brand_gray flex flex-col gap-1 mt-6">
        <div className="flex gap-2">
          <Graduate className="flex" />{" "}
          <h3 className="font-semibold text-brand_dark ">Aprendizaje</h3>
        </div>

        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
      </div>
      <div className="text-brand_gray flex flex-col gap-1 mt-6">
        <div className="flex gap-2">
          <FeaturesList className="flex" />{" "}
          <h3 className="font-semibold text-brand_dark ">Aprendizaje</h3>
        </div>
        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
        <p className="pl-8">Cómo crear una cuenta</p>
      </div>
    </section>
  )
}
