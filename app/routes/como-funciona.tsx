import { Suspense, useEffect } from "react"
import type { MetaFunction } from "react-router"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { Banner } from "~/components/home/Banner"
import { CompaniesScroll } from "~/components/home/CompaniesScroll"
import { FinalCta } from "~/components/home/FinalCta"
import { Calendar } from "~/components/icons/calendar"
import { Lamp } from "~/components/icons/lamp"
import { Rocket } from "~/components/icons/rocket"
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
        <section className="flex flex-col justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto my-[160px] pt-10">
          <h1 className="group text-4xl lg:text-6xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center">
            <span className="mr-4">Cómo funciona</span>
            <Calendar className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />
          </h1>
          <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[70%]">
            En solo 3 pasos tendrás tu agenda en línea lista para recibir citas
            y hacer crecer tu negocio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-16 lg:mt-20">
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

        {/* Mid Banner */}
        <MidBanner />

        {/* Social Proof */}
        <section className="max-w-[90%] xl:max-w-7xl mx-auto mt-[120px] lg:mt-[160px]">
          <h2 className="group text-3xl lg:text-5xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center">
            <span className="mr-4">Lo que dicen</span>
            <Lamp className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10 lg:w-14 lg:h-14" />
            <span className="ml-4">nuestros clientes</span>
          </h2>
          <p className="text-lg text-brand_gray font-satoshi mt-4 text-center">
            Esto es lo que opinan quienes ya usan Deník para gestionar sus citas.
          </p>
          <div className="mt-16 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </section>
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
    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <span className="absolute -top-6 -right-2 text-[120px] leading-none font-satoBold text-gray-100 select-none pointer-events-none">
        {step}
      </span>
      <img
        src={illustration}
        alt={title}
        className="relative w-[140px] h-[140px] object-contain"
      />
      <h3 className="relative text-2xl font-satoBold text-brand_dark mt-6">{title}</h3>
      <p className="relative text-brand_gray font-satoshi mt-3 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function MidBanner() {
  return (
    <section className="max-w-[90%] xl:max-w-7xl mx-auto mt-[120px] lg:mt-[160px]">
      <div className="relative rounded-[40px] bg-gradient-to-br from-brand_blue to-blue-600 p-10 md:p-16 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-satoBold text-white leading-tight">
              Más de 100 negocios
              <br />
              ya confían en Deník
            </h2>
            <p className="text-lg text-white/80 font-satoshi mt-4 max-w-lg mx-auto lg:mx-0">
              Únete a la comunidad de profesionales que automatizaron su agenda y
              dejaron de perder clientes.
            </p>
          </div>

          {/* Avatars stack */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex -space-x-4">
              <img
                src="https://i.imgur.com/RAiyJBc.jpg"
                alt=""
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-brand_blue object-cover"
              />
              <img
                src="https://i.imgur.com/TFQxcIu.jpg"
                alt=""
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-brand_blue object-cover"
              />
              <img
                src="https://www.formmy.app/home/abraham.webp"
                alt=""
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-brand_blue object-cover"
              />
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-brand_blue bg-white/20 backdrop-blur flex items-center justify-center text-white font-satoBold text-sm md:text-lg">
                +100
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    name: "Paola Alvarado",
    role: "Nutrióloga",
    img: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Desde que uso Deník mis clientes agendan solos y ya no tengo que estar checando mensajes. Me liberó tiempo para enfocarme en lo que importa.",
  },
  {
    name: "Luis Escobedo",
    role: "Entrenador personal",
    img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Es la herramienta más completa que he encontrado. Agenda, pagos y recordatorios en un solo lugar.",
  },
  {
    name: "Catalina López",
    role: "Maestra de inglés",
    img: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Mis alumnos pueden reservar su clase en segundos. ¡Me ahorra horas de trabajo a la semana!",
  },
  {
    name: "Georgina Hernández",
    role: "Estilista",
    img: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Mis clientas ya no faltan a sus citas gracias a los recordatorios. ¡Increíble la diferencia!",
  },
  {
    name: "Roberto Méndez",
    role: "Fisioterapeuta",
    img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Antes perdía pacientes porque no contestaba a tiempo. Ahora ellos reservan directo y yo solo llego a atender.",
  },
  {
    name: "Mariana Torres",
    role: "Dueña de spa",
    img: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Lo que más me gusta es que mis clientes pueden pagar al reservar. Menos cancelaciones y más tranquilidad.",
  },
  {
    name: "Diego Ramírez",
    role: "Coach de vida",
    img: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Profesional y fácil de usar. Mis clientes me dicen que reservar con Deník es súper intuitivo.",
  },
  {
    name: "Ana Sofía Ruiz",
    role: "Fotógrafa",
    img: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400",
    comment:
      "Organicé todas mis sesiones en un solo lugar. Ya no uso WhatsApp para agendar, todo es automático.",
  },
]

function TestimonialCard({
  name,
  role,
  img,
  comment,
}: {
  name: string
  role: string
  img: string
  comment: string
}) {
  return (
    <div className="break-inside-avoid rounded-2xl border border-gray-100 p-6 bg-white">
      <span className="text-3xl text-gray-200 leading-none font-serif">
        &ldquo;
      </span>
      <p className="text-brand_dark font-satoshi mt-2 leading-relaxed">
        {comment}
      </p>
      <div className="flex items-center gap-3 mt-5">
        <img
          src={img}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-satoBold text-brand_dark">{name}</p>
          <p className="text-xs text-brand_gray">{role}</p>
        </div>
      </div>
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
    <section className="relative">
      <div className=" h-[1200px] mx-auto rounded-[40px] max-w-7xl  max-w-[90%] xl:max-w-7xl mx-auto pt-[200px] lg:pt-[24%] xl:pt-[16%] ">
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
      <div className="-mt-[660px]">
        <Carousel items={cards} />
      </div>
    </section>
  )
}
