import { useEffect } from "react"
import { Link, type MetaFunction } from "react-router"
import { MOCK_BUSINESSES } from "~/components/Community/mockBusinesses"
import { Footer } from "~/components/common/Footer"
import { PrimaryButton } from "~/components/common/primaryButton"
import { TopBar } from "~/components/common/topBar"
import { StatsBelt } from "~/components/home/StatsBelt"
import { ArrowRight } from "~/components/icons/arrowRight"
import { getMetaTags } from "~/utils/getMetaTags"

export const meta: MetaFunction = () =>
  getMetaTags({
    title: "Para clientes | Deník",
    description:
      "¿Vas a reservar con un negocio que usa Deník? Así de fácil agendas tu cita: elige servicio y horario, recibe recordatorios y paga en línea de forma segura.",
    url: "https://denik.me/para-clientes",
  })

const AVATARS = [
  "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200",
]

export default function ParaClientes() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] overflow-hidden">
        <TopBar />
        <Hero />
        <Steps />
        <Showcase />
        <Highlight />
        <StatsBelt />
        <BusinessCta />
      </div>
      <Footer />
    </main>
  )
}

// ==================== HERO ====================

const Hero = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto pt-40 pb-16 md:pb-[120px] grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    <div className="text-center lg:text-left">
      <span className="inline-block text-brand_blue bg-brand_blue/10 rounded-full px-4 py-1.5 text-sm font-satoMedium">
        Para quienes agendan
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
  <section className="max-w-[90%] xl:max-w-7xl mx-auto mb-20 md:mb-[120px]">
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
            <span className="absolute top-4 left-4 w-10 h-10 rounded-full bg-brand_blue text-white font-satoBold grid place-items-center shadow-md">
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
  const businesses = MOCK_BUSINESSES.slice(0, 8)
  return (
    <section className="max-w-[90%] xl:max-w-7xl mx-auto mb-20 md:mb-[120px]">
      <div className="text-center">
        <h2 className="text-3xl lg:text-5xl font-satoBold text-brand_dark">
          Negocios que ya usan Deník
        </h2>
        <p className="text-lg lg:text-2xl text-brand_gray font-satoshi mt-4 md:w-[60%] mx-auto">
          Spas, salones, consultorios, clases y mucho más. Explora la comunidad
          y encuentra el tuyo.
        </p>
      </div>
      <div className="mt-10 lg:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square relative">
              <img
                src={b.image}
                alt={b.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4 text-center">
              <h3 className="font-satoBold text-brand_dark truncate">
                {b.name}
              </h3>
              <p className="text-sm text-brand_gray">{b.category}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-brand_dark text-brand_dark font-satoMedium hover:bg-brand_dark hover:text-white transition-colors"
        >
          Explorar la comunidad <ArrowRight />
        </Link>
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
  <section className="max-w-[90%] xl:max-w-7xl mx-auto mb-20 md:mb-[120px] grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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
            className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
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

// ==================== CTA NEGOCIOS ====================

const BusinessCta = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto mb-[120px] md:mb-[160px]">
    <div className="bg-brand_dark rounded-[40px] px-6 py-16 md:py-24 text-center">
      <h2 className="text-3xl lg:text-5xl font-satoBold text-white leading-tight">
        ¿Tienes un negocio?
      </h2>
      <p className="text-lg lg:text-2xl text-brand_pale font-satoshi mt-4 w-full mx-auto md:w-[60%]">
        Recibe reservas así de fáciles, cobra en línea y haz crecer tu marca.
        Crea tu agenda gratis en menos de un minuto.
      </p>
      <div className="flex justify-center mt-10">
        <PrimaryButton as="Link" to="/signin">
          Crear mi cuenta gratis <ArrowRight />
        </PrimaryButton>
      </div>
    </div>
  </section>
)
