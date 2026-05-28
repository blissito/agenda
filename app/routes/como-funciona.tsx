import { useEffect, useRef, useState } from "react"
import { type MetaFunction, useNavigate } from "react-router"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { FinalCta } from "~/components/home/FinalCta"
import { StatsBelt } from "~/components/home/StatsBelt"
import { Calendar } from "~/components/icons/calendar"
import { HandShake } from "~/components/icons/handshake"
import { Lamp } from "~/components/icons/lamp"
import { Rocket } from "~/components/icons/rocket"
import { Card, Carousel } from "~/components/ui/cards-carrusel"
import { getMetaTags } from "~/utils/getMetaTags"

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
        <section className="flex flex-col justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto mb-20 md:mb-[160px] pt-40">
          <h1 className="group text-3xl lg:text-6xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center">
            <span className="mr-4">Cómo funciona</span>
            <Calendar className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />
          </h1>
          <p className="text-lg lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[70%]">
            En solo 3 pasos tendrás tu agenda en línea lista para recibir citas
            y hacer crecer tu negocio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-10 lg:mt-20">
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
        <StatsBelt />

        {/* Social Proof */}
        <section className="max-w-[90%] xl:max-w-7xl mx-auto mt-[80px] lg:mt-[160px]">
          <h2 className="group text-3xl lg:text-6xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center">
            <span className="mr-4">Lo que dicen</span>
            <Lamp className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10 lg:w-14 lg:h-14" />
            <span className="ml-4">nuestros clientes</span>
          </h2>
          <p className="text-lg text-brand_gray font-satoshi mt-4 text-center">
            Esto es lo que opinan quienes ya usan Deník para gestionar sus
            citas.
          </p>
          <div className="mt-10 md:mt-16">
            <TestiCarousel />
          </div>
        </section>
        {/* Final CTA */}
        <FinalCta>
          <h2 className="group text-3xl lg:text-6xl font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center px-1">
            <span className="mr-4">¿Listo para</span>
            <Rocket className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />
            <span className="ml-4">empezar?</span>
          </h2>
          <h2 className="text-3xl lg:text-6xl font-satoBold text-brand_dark mb-16 mt-2">
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
      <h3 className="relative text-2xl font-satoBold text-brand_dark mt-6">
        {title}
      </h3>
      <p className="relative text-brand_gray font-satoshi mt-3 leading-relaxed">
        {description}
      </p>
    </div>
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

function TestiCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState<number | null>(null)

  const scrollByCard = (dir: number) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>("[data-card]")
    const amount = card ? card.offsetWidth + 20 : 320
    el.scrollBy({ left: dir * amount, behavior: "smooth" })
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5 md:-mx-10 md:px-10 py-6"
      >
        {testimonials.map((t, i) => (
          <VideoTesti
            key={t.name}
            {...t}
            playing={playing === i}
            onPlay={() => setPlaying(i)}
          />
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scrollByCard(-1)}
          className="w-11 h-11 rounded-full border border-black/10 bg-white grid place-items-center text-brand_dark hover:bg-black/5 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current">
            <path
              d="M15 6l-6 6 6 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => scrollByCard(1)}
          className="w-11 h-11 rounded-full border border-black/10 bg-white grid place-items-center text-brand_dark hover:bg-black/5 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current">
            <path
              d="M9 6l6 6-6 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

function VideoTesti({
  name,
  role,
  img,
  comment,
  video,
  playing,
  onPlay,
}: {
  name: string
  role: string
  img: string
  comment: string
  video?: string
  playing: boolean
  onPlay: () => void
}) {
  return (
    <article
      data-card
      className="snap-start shrink-0 w-[260px] md:w-[300px] aspect-[3/4] rounded-[24px] overflow-hidden relative bg-brand_dark"
    >
      {video && playing ? (
        <video
          src={video}
          poster={img}
          controls
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          <img
            src={img}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
          <button
            type="button"
            aria-label={`Reproducir testimonio de ${name}`}
            onClick={onPlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 grid place-items-center shadow-lg hover:scale-105 transition-transform"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 translate-x-[1px] fill-brand_dark"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[13px] leading-snug text-white/90 mb-3">
              "{comment}"
            </p>
            <div className="font-bold text-sm font-satoBold">{name}</div>
            <div className="text-xs text-white/60">{role}</div>
          </div>
        </>
      )}
    </article>
  )
}

const businessData = [
  {
    category: "Clases de idiomas",
    title: "Clases de idiomas",
    src: "/images/photos/image7.webp",
    titleAside: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
        </div>
        <span className="hidden text-xs md:text-sm font-satoshi text-brand_gray">
          +200 alumnos
          <br />
          ya reservan con Deník
        </span>
      </div>
    ),
    content: (
      <div className="space-y-8">
        <p className="text-base md:text-lg text-brand_gray font-satoshi">
          Deník es la agenda ideal para{" "}
          <strong className="font-satoBold text-brand_dark">
            escuelas de idiomas, profesores independientes y centros de
            enseñanza
          </strong>
          . Olvídate del WhatsApp y los cobros manuales: gestiona alumnos,
          clases y pagos desde un solo lugar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">📅</span>Reservas 24/7
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Tus alumnos eligen idioma, nivel y horario desde tu landing. Sin
              chats, sin idas y vueltas.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🔔</span>Recordatorios automáticos
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cada alumno recibe confirmación y recordatorio por email. Reduce
              ausencias y cancelaciones de último minuto.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💳</span>Paquetes y cobros en línea
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cobra clases sueltas o paquetes con MercadoPago. El pago se
              confirma antes de que empiece la sesión.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">👩‍🏫</span>Múltiples profesores
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Asigna distintos maestros por idioma o nivel, cada uno con su
              propia disponibilidad.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">📊</span>Seguimiento de alumnos
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Historial de clases, notas y contacto de cada estudiante en un
              solo expediente.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">⭐</span>Programa de lealtad
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Premia a tus alumnos con puntos por cada clase tomada. Fomenta
              constancia y recompra.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    category: "Estudio de belleza",
    title: "Estudio de belleza",
    src: "/images/photos/image3.webp",
    titleAside: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
        </div>
      </div>
    ),
    content: (
      <div className="space-y-8">
        <p className="text-base md:text-lg text-brand_gray font-satoshi">
          Deník es la agenda perfecta para{" "}
          <strong className="font-satoBold text-brand_dark">
            salones, estilistas, manicuristas y centros de estética
          </strong>
          . Llena tu agenda, reduce los no-shows y consiente a tus clientas
          frecuentes sin perder horas en WhatsApp.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">✂️</span>Reservas por servicio
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Tus clientas eligen el servicio (corte, color, manicure, facial) y
              el horario que les acomoda. Tú solo llegas a atender.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🔔</span>Adiós a los no-shows
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Recordatorios automáticos por email antes de cada cita. Menos
              huecos en tu agenda y menos pérdidas.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💳</span>Anticipo al reservar
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cobra el servicio o un anticipo con MercadoPago al momento de
              agendar. Asegura la cita y protege tu tiempo.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💇‍♀️</span>Múltiples estilistas
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Gestiona la agenda de cada profesional del salón con sus propios
              servicios y horarios disponibles.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">📋</span>Ficha de clienta
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Guarda fórmulas de color, alergias, preferencias e historial de
              visitas. Cada clienta se siente como en casa.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">⭐</span>Premia a tus regulares
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Programa de lealtad con puntos por visita. Convierte clientas
              ocasionales en clientas frecuentes.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    category: "Consultorios médicos",
    title: "Consultorios médicos",
    src: "/images/photos/image6.webp",
    titleAside: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
        </div>
      </div>
    ),
    content: (
      <div className="space-y-8">
        <p className="text-base md:text-lg text-brand_gray font-satoshi">
          Deník es la agenda profesional para{" "}
          <strong className="font-satoBold text-brand_dark">
            consultorios privados, clínicas, dentistas y especialistas
          </strong>
          . Reduce inasistencias, organiza a varios médicos y mantén el
          historial de tus pacientes en un solo lugar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🩺</span>Notas del paciente al reservar
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cada paciente puede dejar el motivo de su visita o detalles
              relevantes en las notas al agendar. Llegas preparado a la
              consulta.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🔔</span>Reduce inasistencias
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Recordatorios automáticos por email antes de cada cita. Menos
              huecos en tu consulta y más pacientes atendidos.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💳</span>Cobro de consulta en línea
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cobra la consulta o un anticipo con MercadoPago al momento de
              reservar. Confirma compromiso y protege tu agenda.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🌐</span>Tu landing profesional
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Una página web propia donde tus pacientes reservan directo, con tu
              marca y sin descargar nada. Comparte el link en tus tarjetas o
              redes.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">📋</span>Expediente del paciente
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Historial de visitas, notas privadas y datos de contacto de cada
              paciente, siempre a la mano.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">⏰</span>Duración por servicio
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Configura tiempos distintos para primera consulta, seguimiento o
              procedimientos. Tu agenda se ajusta sola.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    category: "Gimnasios",
    title: "Gimnasios",
    src: "/images/photos/image5.webp",
    titleAside: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
        </div>
      </div>
    ),
    content: (
      <div className="space-y-8">
        <p className="text-base md:text-lg text-brand_gray font-satoshi">
          Cada sesión cancelada a último minuto es tiempo y dinero perdidos.
          Deník ayuda a{" "}
          <strong className="font-satoBold text-brand_dark">
            gimnasios, entrenadores personales, estudios de yoga y boutique
            fitness
          </strong>{" "}
          a llenar su agenda, asegurar pagos por adelantado y construir
          comunidad con sus miembros más constantes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💪</span>Reservas de sesión 1-a-1
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Tus clientes eligen el tipo de entrenamiento y el horario que les
              acomoda. Tú solo llegas a entrenar.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🔔</span>Adiós a las ausencias
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Recordatorios automáticos por email antes de cada sesión. Menos
              huecos en tu agenda y más disciplina en tus alumnos.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💳</span>Cobro por adelantado
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cobra la sesión o un anticipo con MercadoPago al reservar. Asegura
              el compromiso antes de prender la luz del estudio.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🌐</span>Tu landing profesional
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Una página propia con tu marca donde tus clientes reservan
              directo. Compártela en Instagram o tu bio sin fricciones.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🤖</span>Tu agente IA 24/7
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Un chatbot que responde dudas, recomienda servicios y agenda
              sesiones por ti, incluso a media noche. Atiende más sin dejar de
              entrenar.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">⭐</span>Premia la constancia
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Programa de lealtad con puntos por cada sesión. Convierte clientes
              ocasionales en miembros frecuentes.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    category: "Centros deportivos",
    title: "Centros deportivos",
    src: "/images/photos/image2.webp",
    titleAside: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
        </div>
      </div>
    ),
    content: (
      <div className="space-y-8">
        <p className="text-base md:text-lg text-brand_gray font-satoshi">
          Olvídate de la libreta de reservas y los mensajes a deshoras. Deník
          automatiza la gestión de{" "}
          <strong className="font-satoBold text-brand_dark">
            centros deportivos, clubes, escuelas de fútbol, tenis, pádel y
            academias
          </strong>{" "}
          para que tus socios reserven directo y tú dediques tu tiempo a
          entrenar y enseñar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🎾</span>Reservas por cancha o disciplina
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cada instalación o clase como un servicio independiente. Tus
              socios eligen qué y cuándo reservar.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🔔</span>Confirmación instantánea
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cada reserva manda confirmación y recordatorio por email. Sin
              llamadas a deshoras ni dobles reservas.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💳</span>Apartado con anticipo
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cobra el costo completo o un anticipo con MercadoPago al reservar.
              Adiós a las canchas vacías.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🌐</span>Tu sitio del club
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Una landing propia con tu marca donde tus socios reservan directo.
              Ideal para compartir en redes y bio.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">📋</span>Ficha del jugador
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Nivel, contacto, historial de reservas y notas privadas en cada
              socio. Conoce mejor a tu comunidad.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">⭐</span>Premia a tus socios
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Programa de lealtad con puntos por reserva. Convierte jugadores
              ocasionales en habituales del club.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    category: "Spas",
    title: "Spas",
    src: "/images/photos/image4.webp",
    titleAside: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
        </div>
      </div>
    ),
    content: (
      <div className="space-y-8">
        <p className="text-base md:text-lg text-brand_gray font-satoshi">
          Tus huéspedes vienen a desconectarse, no a pelear con WhatsApp para
          cuadrar una cita. Deník permite a{" "}
          <strong className="font-satoBold text-brand_dark">
            spas urbanos, day spas, centros de bienestar y resorts wellness
          </strong>{" "}
          ofrecer reservas, pagos y comunicación tan fluidos como sus
          tratamientos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">✨</span>Reservas de experiencias
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cada tratamiento como un servicio: masajes, faciales, hidroterapia
              o paquetes de día completo. Tus huéspedes eligen y reservan en
              segundos.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🔔</span>Llega relajado, no apurado
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Confirmación y recordatorios automáticos por email. Menos
              huéspedes que olvidan su cita y más cabinas ocupadas.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💳</span>Reserva con anticipo
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cobra el tratamiento o un anticipo con MercadoPago al reservar.
              Asegura compromiso para tus servicios premium.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🌐</span>Tu sitio del spa
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Una landing propia con tu marca y estética. Comparte el link en
              Instagram y deja que la magia visual venda por ti.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">📋</span>Preferencias del huésped
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Aceites favoritos, alergias, presión deseada o tipo de piel. Cada
              huésped recibe una experiencia personalizada.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">⭐</span>Programa de lealtad
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Premia a tus huéspedes con puntos por cada visita. Convierte
              escapadas ocasionales en rituales mensuales.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    category: "Experiencias turísticas",
    title: "Experiencias turísticas",
    src: "/images/photos/image1.webp",
    titleAside: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
            alt=""
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white object-cover shadow-sm"
          />
        </div>
      </div>
    ),
    content: (
      <div className="space-y-8">
        <p className="text-base md:text-lg text-brand_gray font-satoshi">
          Los viajeros deciden en segundos. Si tu reserva no es instantánea, tu
          próximo cliente ya está en el tour de la competencia. Deník permite a{" "}
          <strong className="font-satoBold text-brand_dark">
            operadores turísticos, tours guiados, experiencias gastronómicas y
            agencias de aventura
          </strong>{" "}
          convertir interesados en reservas confirmadas las 24 horas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🌎</span>Reservas online de tours
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cada experiencia como un servicio independiente. Tus viajeros
              eligen fecha, horario y reservan en segundos, desde cualquier
              parte del mundo.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🔔</span>Confirmación instantánea
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Email automático con todos los detalles del tour. Tus clientes
              reciben tranquilidad y tú no contestas el mismo mensaje 20 veces.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">💳</span>Cobro al reservar
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Cobra el tour completo o un anticipo con MercadoPago. Cero riesgo
              de no-shows con turistas que cambian de planes.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🌐</span>Tu sitio profesional
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Una landing propia visible 24/7 para viajeros buscando
              experiencias en tu destino. Compártela en TripAdvisor, redes o tu
              bio.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">🤖</span>Tu agente IA 24/7
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Responde dudas de viajeros en cualquier zona horaria: qué llevar,
              punto de encuentro, duración. Convierte preguntas en reservas
              mientras duermes.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-base font-satoBold text-brand_dark">
              <span className="mr-2">📋</span>Notas del viajero
            </h3>
            <p className="text-sm text-brand_gray font-satoshi mt-2">
              Restricciones alimentarias, alergias, idioma o nivel de
              experiencia. Personaliza cada tour antes de que el grupo llegue.
            </p>
          </div>
        </div>
      </div>
    ),
  },
]

const Business = () => {
  const cards = businessData.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ))
  return (
    <section className="relative">
      <div className="h-[1200px] mx-auto rounded-[40px] max-w-7xl  max-w-[90%] xl:max-w-7xl mx-auto pt-40 lg:pt-[320px] ">
        <h2 className="group text-4xl lg:text-6xl font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center">
          <span className="mr-4">Para todos los negocios</span>
          <HandShake className="group-hover:animate-vibration-effect cursor-pointer w-16 h-16 md:w-20 md:h-20 mr-3" />
        </h2>
        <p className="text-lg lg:text-2xl text-brand_gray font-satoshi mt-4 md:mt-6 w-full text-center mx-auto md:w-[90%]">
          Deník se adapta a cualquier tipo de negocio. Descubre cómo podemos
          ayudarte a gestionar tus citas y hacer crecer tu marca.
        </p>
        <div className="mt-10 flex justify-center">
          <NegociosSlugBar />
        </div>
      </div>
      <div className="-mt-[700px] md:-mt-[640px]">
        <Carousel items={cards} />
      </div>
    </section>
  )
}

function NegociosSlugBar() {
  const [slug, setSlug] = useState<string>("")
  const navigate = useNavigate()

  const trimmedSlug = slug.trim()
  const isDisabled = trimmedSlug.length === 0

  const goSignin = () => {
    if (isDisabled) return
    // Persistimos el nombre del negocio para pre-llenarlo en el step 1 del
    // onboarding. localStorage sobrevive el flujo de magic link, donde el
    // usuario regresa desde su correo a una URL distinta.
    if (typeof window !== "undefined") {
      window.localStorage.setItem("denik_pending_org_name", trimmedSlug)
    }
    navigate(`/signin?slug=${encodeURIComponent(trimmedSlug)}`)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-full pl-5 pr-1.5 py-1.5 flex items-center justify-between gap-3 border border-outline">
        <div className="flex items-center flex-1 min-w-0">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goSignin()
            }}
            placeholder="tunegocio"
            className="w-full min-w-0 text-right !bg-transparent !border-0 !outline-none !ring-0 focus:!ring-0 focus:!outline-none text-brand_gray placeholder:text-brand_gray/70"
          />
          <span className="font-semibold text-brand_dark shrink-0">
            .denik.me
          </span>
        </div>
        <button
          type="button"
          onClick={goSignin}
          disabled={isDisabled}
          className="bg-brand_blue text-white lg:px-6 px-4 py-3 rounded-full text-sm md:text-base font-satoMedium whitespace-nowrap transition disabled:bg-brand_blue/40 disabled:cursor-not-allowed enabled:hover:-translate-y-0.5"
        >
          Crear mi agenda <span className="hidden md:inline"> en línea </span>
        </button>
      </div>
    </div>
  )
}
