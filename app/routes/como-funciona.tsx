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
import { getMetaTags } from "~/utils/getMetaTags"

export const meta: MetaFunction = () =>
  getMetaTags({
    title: "Cómo funciona | Deník",
    description:
      "Descubre cómo funciona Deník en 3 sencillos pasos y empieza a recibir citas hoy mismo.",
    url: "https://denik.me/como-funciona",
  })

export default function ComoFunciona() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] overflow-hidden">
        <TopBar />

        {/* Hero */}
        <section className="flex flex-col justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto pt-[200px] lg:pt-[24%] xl:pt-[16%]">
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
