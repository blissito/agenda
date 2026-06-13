import { useEffect, useState } from "react"
import { type MetaFunction } from "react-router"
import { MOCK_BUSINESSES } from "~/components/Community/mockBusinesses"
import { Footer } from "~/components/common/Footer"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { TopBar } from "~/components/common/topBar"
import { Meteors } from "~/components/home/Meteors"
import { ArrowRight } from "~/components/icons/arrowRight"
import { Comment } from "~/components/icons/comment"
import { Rocket } from "~/components/icons/rocket"
import { Thunder } from "~/components/icons/thunder"
import { Waves } from "~/components/icons/waves"
import { getMetaTags } from "~/utils/getMetaTags"

export const meta: MetaFunction = () =>
  getMetaTags({
    title: "Para clientes | Deník",
    description:
      "¿Vas a reservar con un negocio que usa Deník? Así de fácil agendas tu cita: elige servicio y horario, recibe recordatorios y paga en línea de forma segura.",
    url: "https://denik.me/para-clientes",
  })

const AVATARS = [
  "https://i.imgur.com/RAiyJBc.jpg",
  "https://i.imgur.com/TFQxcIu.jpg",
  "https://www.formmy.app/home/abraham.webp",
]

export default function ParaClientes() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] overflow-hidden">
        <TopBar
          navLinks={[
            { to: "/", label: "Soy un negocio" },
            { to: "/blog", label: "Blog" },
            { to: "/signin", label: "Iniciar sesión" },
          ]}
          cta={{ to: "/mi-cuenta", label: "Crear cuenta" }}
        />
        <Hero />
        <BusinessCta />
        <Steps />
        <Highlight />
      </div>
      <Footer />
    </main>
  )
}

// ==================== HERO ====================

const Hero = () => (
  <section className="relative min-h-[100svh] max-w-[90%] xl:max-w-7xl mx-auto pt-40 pb-12 md:pb-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    {/* Figuras decorativas (mismas del parallax de /) */}
    <Rocket className="hidden md:block absolute z-20 top-1/4 right-[32%] w-9 h-9 rotate-12 pointer-events-none" />
    <Thunder className="hidden md:block absolute bottom-32 left-[14%] w-7 h-10 -rotate-12 pointer-events-none" />
    <Comment className="hidden md:block absolute top-40 left-[20%] w-10 h-10 -rotate-6 pointer-events-none" />
    <Waves className="hidden lg:block absolute bottom-36 right-[14%] w-10 h-10 rotate-6 pointer-events-none" />

    <div className="relative z-10 text-center lg:text-left">
      <span className="inline-block text-brand_blue bg-brand_blue/10 rounded-full px-4 py-1.5 text-sm font-satoMedium">
        Agenda en segundos
      </span>
      <h1 className="text-4xl lg:text-6xl font-satoBold text-brand_dark leading-tight mt-5">
        Reserva con tus negocios favoritos
      </h1>
      <p className="text-lg lg:text-2xl text-brand_gray font-satoshi mt-6">
        Si un negocio te compartió su link de Deník, estás a segundos de agendar
        tu cita. Sin llamadas, sin esperas y sin instalar nada.
      </p>
      <div className="flex items-center justify-center lg:justify-start gap-3 mt-8">
        <div className="flex -space-x-3">
          {AVATARS.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-sm"
            />
          ))}
        </div>
        <span className="text-sm md:text-base font-satoshi text-brand_gray text-left">
          Miles de personas ya<br className="hidden md:block" /> reservan con
          Deník
        </span>
      </div>
    </div>

    <div className="relative">
      <img
        src="/images/photos/image3.webp"
        alt="Persona reservando una cita en Deník"
        className="w-full aspect-[4/5] md:aspect-[4/3] object-cover rounded-[32px] shadow-xl"
      />
      {/* Tarjeta flotante */}
      <div className="absolute -bottom-6 left-4 md:left-8 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
        <span className="w-10 h-10 rounded-full bg-brand_lime grid place-items-center text-xl">
          ✓
        </span>
        <div className="text-left">
          <p className="text-sm font-satoBold text-brand_dark">Cita confirmada</p>
          <p className="text-xs text-brand_gray">Hoy · 4:00 pm</p>
        </div>
      </div>
    </div>
  </section>
)

// ==================== STEPS ====================

const STEPS = [
  {
    step: 1,
    title: "Abre el link del negocio",
    description:
      "Tu negocio comparte su página de Deník por WhatsApp, Instagram o su sitio web. Ábrela desde tu celular o computadora.",
    image:
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    step: 2,
    title: "Elige servicio y horario",
    description:
      "Selecciona el servicio que necesitas y el día y la hora que más te convienen. Solo verás los horarios disponibles.",
    image:
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    step: 3,
    title: "Confirma tu cita",
    description:
      "Recibe la confirmación por correo y, si el negocio lo pide, paga en línea de forma segura. ¡Listo!",
    image:
      "https://images.pexels.com/photos/3845766/pexels-photo-3845766.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
]

const Steps = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto py-20 md:py-[120px]">
    <div className="text-center">
      <h2 className="text-3xl lg:text-5xl font-satoBold text-brand_dark">
        Reservar es así de fácil
      </h2>
      <p className="text-lg lg:text-2xl text-brand_gray font-satoshi mt-4 md:w-[60%] mx-auto">
        En 3 pasos tienes tu cita confirmada.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 lg:mt-16">
      {STEPS.map((s) => (
        <div
          key={s.step}
          className="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-[16/10]">
            <img
              src={s.image}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-200 text-brand_dark font-satoBold grid place-items-center shadow-md">
              {s.step}
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-satoBold text-brand_dark">{s.title}</h3>
            <p className="text-brand_gray font-satoshi mt-2 leading-relaxed">
              {s.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

// ==================== SHOWCASE (estilo Community) ====================

const Showcase = () => {
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")

  const term = submitted.trim().toLowerCase()
  const filtered = term
    ? MOCK_BUSINESSES.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.category.toLowerCase().includes(term),
      )
    : MOCK_BUSINESSES
  const businesses = filtered.slice(0, 10)

  return (
    <section className="max-w-[90%] xl:max-w-7xl mx-auto py-20 md:py-[120px]">
      <div className="text-center">
        <h2 className="text-3xl lg:text-5xl font-satoBold text-brand_dark">
          Negocios que ya usan Deník
        </h2>
        <p className="text-lg lg:text-2xl text-brand_gray font-satoshi mt-4 max-w-5xl mx-auto">
          Spas, salones, consultorios, clases y mucho más. Explora la comunidad
          y encuentra el tuyo.
        </p>
      </div>

      <div className="mt-8 lg:mt-10 w-full max-w-xl mx-auto bg-white rounded-full pl-6 pr-1.5 py-1.5 flex items-center justify-between gap-3 border border-outline shadow-sm">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSubmitted(query)
          }}
          placeholder="Busca un negocio, categoría o servicio"
          className="flex-1 min-w-0 !bg-transparent !border-0 !outline-none !ring-0 focus:!ring-0 focus:!outline-none text-brand_gray placeholder:text-brand_gray/70"
        />
        <button
          type="button"
          onClick={() => setSubmitted(query)}
          className="bg-brand_blue text-white px-7 py-3 rounded-full text-sm md:text-base font-satoMedium whitespace-nowrap hover:bg-brand_blue/90 transition-colors"
        >
          Buscar
        </button>
      </div>

      <div className="mt-10 lg:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="aspect-square relative">
              <img
                src={b.image}
                alt={b.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3 text-center">
              <h3 className="font-satoBold text-sm text-brand_dark truncate">
                {b.name}
              </h3>
              <p className="text-xs text-brand_gray">{b.category}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <SecondaryButton as="Link" to="/community" className="h-10 px-5 text-sm">
          Explorar la comunidad
        </SecondaryButton>
      </div>
    </section>
  )
}

// ==================== HIGHLIGHT ====================

const HIGHLIGHTS = [
  {
    icon: "🔔",
    title: "Recordatorios automáticos",
    text: "Recibe confirmación y avisos por correo para que nunca olvides tu cita.",
  },
  {
    icon: "💳",
    title: "Pagos en línea seguros",
    text: "Cuando el negocio lo pide, paga o aparta tu lugar con MercadoPago.",
  },
  {
    icon: "⭐",
    title: "Acumula recompensas",
    text: "En negocios con programa de lealtad, sumas puntos por cada visita.",
  },
  {
    icon: "🕒",
    title: "Reserva 24/7",
    text: "Agenda a la hora que quieras, sin esperar a que abran o contesten.",
  },
]

const Highlight = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto py-20 md:py-[120px] grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    <div className="order-2 lg:order-1">
      <h2 className="text-3xl lg:text-5xl font-satoBold text-brand_dark leading-tight">
        Todo a tu favor, de principio a fin
      </h2>
      <p className="text-lg text-brand_gray font-satoshi mt-4">
        Deník hace que reservar sea cómodo para ti, no solo para el negocio.
      </p>
      <div className="grid sm:grid-cols-2 gap-5 mt-8">
        {HIGHLIGHTS.map((h) => (
          <div
            key={h.title}
            className="py-5"
          >
            <span className="text-2xl">{h.icon}</span>
            <h3 className="text-base font-satoBold text-brand_dark mt-2">
              {h.title}
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-1.5">
              {h.text}
            </p>
          </div>
        ))}
      </div>
    </div>
    <div className="order-1 lg:order-2">
      <img
        src="/images/photos/image4.webp"
        alt="Cliente disfrutando un servicio reservado con Deník"
        className="w-full aspect-[4/3] object-cover rounded-[32px] shadow-xl"
      />
    </div>
  </section>
)

// ==================== CTA NEGOCIOS (banner) ====================

const BUSINESS_AVATARS = [
  "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200",
]

const BusinessCta = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto py-20 md:py-[120px]">
    <div className="relative rounded-[32px] md:rounded-[40px] bg-brand_dark px-6 py-14 md:py-20 overflow-hidden text-center">
      <Meteors />

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex -space-x-3 mb-6">
          {BUSINESS_AVATARS.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="w-11 h-11 md:w-12 md:h-12 rounded-full border-[3px] border-brand_dark object-cover"
            />
          ))}
        </div>
        <h2 className="text-3xl lg:text-5xl font-satoBold text-white leading-tight max-w-5xl">
          ¿Tienes un negocio?
        </h2>
        <p className="text-lg lg:text-2xl text-brand_ash/80 font-satoshi mt-5 max-w-5xl mx-auto">
           Empieza a recibir reservas hoy. Crea tu agenda en línea, cobra por adelantado y deja que tus clientes
          reserven solos. Gratis y listo en menos de un minuto.
        </p>
        <div className="flex justify-center mt-10">
          <PrimaryButton as="Link" to="/signin">
            Crear mi cuenta gratis <ArrowRight />
          </PrimaryButton>
        </div>
      </div>
    </div>
  </section>
)
