import { Suspense, useEffect } from "react"
import type { MetaFunction } from "react-router"
import { Footer } from "~/components/common/Footer"
import { PrimaryButton } from "~/components/common/primaryButton"
import { TopBar } from "~/components/common/topBar"
import { Banner } from "~/components/home/Banner"
import { CompaniesScroll } from "~/components/home/CompaniesScroll"
import { FinalCta } from "~/components/home/FinalCta"
import { CardLarge, CardSmall } from "~/components/home/home"
import { ArrowRight } from "~/components/icons/arrowRight"
import { Calendar } from "~/components/icons/calendar"
import { Lamp } from "~/components/icons/lamp"
import { Rocket } from "~/components/icons/rocket"
import { Comment } from "~/components/icons/comment"
import { Thunder } from "~/components/icons/thunder"
import { HandShake } from "~/components/icons/handshake"
import { Card, Carousel } from "~/components/ui/cards-carrusel"
import { getMetaTags } from "~/utils/getMetaTags"
import { AgendaSlugBar } from "~/components/Community/CommunityPage"

export const meta: MetaFunction = () =>
  getMetaTags({
    title: "Negocios | Deník",
    description:
      "Deník se adapta a cualquier tipo de negocio. Descubre cómo podemos ayudarte a gestionar tus citas y hacer crecer tu marca.",
    url: "https://denik.me/negocios",
  })

export default function ComoFunciona() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] overflow-hidden">
        <TopBar />

        {/* Business */}
        <Business />

        {/* Hero */}
        <section className="flex flex-col justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto my-[160px] pt-20">
          <h1 className="group text-4xl lg:text-6xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center">
            <span className="mr-4">Cómo funciona</span>
            <Calendar className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />
          </h1>
          <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[70%]">
            En solo 3 pasos tendrás tu agenda en línea lista para recibir citas
            y hacer crecer tu negocio.
          </p>
          <div className="mt-10">
            <PrimaryButton as="Link" to="/signin">
              Empieza gratis <ArrowRight />
            </PrimaryButton>
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-[90%] xl:max-w-7xl mx-auto mt-[120px] lg:mt-[160px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <StepCard
              step={1}
              title="Crea tu cuenta"
              description="Regístrate gratis en menos de un minuto con tu correo electrónico. Sin tarjeta, sin compromisos."
              illustration="/images/illustrations/success_check.svg"
            />
            <StepCard
              step={2}
              title="Configura tus servicios"
              description="Agrega tus servicios, horarios, precios y personaliza tu sitio web de citas para tus clientes."
              illustration="/images/illustrations/TV.svg"
            />
            <StepCard
              step={3}
              title="Recibe citas"
              description="Comparte tu link y empieza a recibir reservas, pagos y recordatorios automáticos."
              illustration="/images/illustrations/ticket.svg"
            />
          </div>
        </section>

        {/* Social Proof */}
        <section className="max-w-[90%] xl:max-w-7xl mx-auto mt-[120px] lg:mt-[160px]">
          <h2 className="group text-3xl lg:text-5xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center">
            <span className="mr-4">Lo que dicen</span>
            <Lamp className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10 lg:w-14 lg:h-14" />
            <span className="ml-4">nuestros clientes</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            <CardSmall
              name="Paola Alvarado"
              rol="Nutrióloga"
              comment="Desde que uso Deník mis clientes agendan solos y ya no tengo que estar checando mensajes."
              img="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
              icon={<Thunder />}
            />
            <CardLarge
              className=""
              name="Luis Escobedo"
              rol="Entrenador personal"
              comment="Es la herramienta más completa que he encontrado. Agenda, pagos y recordatorios en un solo lugar."
              img="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
              icon={<Comment />}
            />
            <CardSmall
              className="hidden md:flex"
              name="Catalina López"
              rol="Maestra de inglés"
              comment="Mis alumnos pueden reservar su clase en segundos. ¡Me ahorra horas de trabajo a la semana!"
              img="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400"
              icon={<Rocket />}
            />
            <CardLarge
              className="hidden lg:flex"
              name="Georgina Hernández"
              rol="Estilista"
              comment="Mis clientas ya no faltan a sus citas gracias a los recordatorios. ¡Increíble la diferencia!"
              img="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
              icon={<Thunder />}
            />
          </div>
        </section>

        {/* Companies */}
        <CompaniesScroll />

        {/* Banner */}
        <Suspense fallback="Cargando...">
          <Banner />
        </Suspense>

        {/* Final CTA */}
        <FinalCta>
          <h2 className="group text-4xl xl:text-6xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center">
            <span className="mr-4">¿Listo para</span>
            <Rocket className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />
            <span className="ml-4">empezar?</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-satoBold text-brand_dark mb-16 mt-2">
            ¡Crea tu cuenta gratis!
          </h2>
        </FinalCta>
      </div>
      <Footer />
    </main>
  )
}

function StepCard({
  step,
  title,
  description,
  illustration,
}: {
  step: number
  title: string
  description: string
  illustration: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <span className="w-12 h-12 rounded-full bg-brand_blue text-white flex items-center justify-center font-satoBold text-xl">
        {step}
      </span>
      <img
        src={illustration}
        alt={title}
        className="w-[140px] h-[140px] mt-6 object-contain"
      />
      <h3 className="text-2xl font-satoBold text-brand_dark mt-6">{title}</h3>
      <p className="text-brand_gray font-satoshi mt-3 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

const businessData = [
  {
    category: "Clases de idiomas",
    title: "Clases de idiomas",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Estudio de belleza",
    title: "Estudio de belleza",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Gimnasios",
    title: "Gimnasios",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Centros deportivos",
    title: "Centros deportivos",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Spas",
    title: "Spas",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Experiencias turísticas",
    title: "Experiencias turísticas",
    src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
]

const Business = () => {
  const cards = businessData.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ))
  return (
    <section className="my-[160px] relative">
      <div className="py-[80px] bg-[#F3F6FA] h-[1200px] mx-auto rounded-[40px] max-w-7xl">
        <h2 className="group text-4xl lg:text-6xl font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center">
          <span className="mr-4">Para todos los negocios</span>
          <HandShake className="group-hover:animate-vibration-effect cursor-pointer w-16 h-16 md:w-20 md:h-20 mr-3" />
        </h2>
        <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full text-center mx-auto md:w-[90%]">
          Deník se adapta a cualquier tipo de negocio. Descubre cómo podemos
          ayudarte a gestionar tus citas y hacer crecer tu marca.
        </p>
        <div className="mt-10 flex justify-center">
          <AgendaSlugBar />
        </div>
      </div>
      <div className="-mt-[860px]">
        <Carousel items={cards} />
      </div>
    </section>
  )
}
