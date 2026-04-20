import { useEffect, useRef, useState } from "react"
import { FaRobot } from "react-icons/fa"
import { type MetaFunction } from "react-router"
import { WobbleCard } from "~/components/animated/WoobleCard"
import { Footer } from "~/components/common/Footer"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { TopBar } from "~/components/common/topBar"
import { FinalCta } from "~/components/home/FinalCta"
import { StatsBelt } from "~/components/home/StatsBelt"
import { ArrowRight } from "~/components/icons/arrowRight"
import { People } from "~/components/icons/people"
import { StarLights } from "~/components/icons/starLights"

export const meta: MetaFunction = () => [
  { title: "IA en Denik — Tu copiloto para tu negocio" },
  {
    name: "description",
    content:
      "Tres asistentes de IA que trabajan contigo: crean tu sitio de reservas, atienden a tus clientes por chat y te acompañan en WhatsApp.",
  },
]

const STYLES: Record<
  string,
  { c1: string; c2: string; title: string; desc: string; url: string }
> = {
  warm: {
    c1: "#FFC166",
    c2: "#F19B3D",
    title: "Clases de música para adultos",
    desc: "Piano y violín en el corazón de CDMX. Reserva tu primera sesión gratis.",
    url: "estudiomilan.denik.me",
  },
  mod: {
    c1: "#11151A",
    c2: "#3A3F46",
    title: "Escuela de música · Milán",
    desc: "Técnica clásica, método moderno. Clases 1:1 con profesores certificados.",
    url: "milan.denik.me",
  },
  playful: {
    c1: "#5158F6",
    c2: "#9DA3FF",
    title: "Aprende música sin drama 🎹",
    desc: "Clases chidas para adultos. Sin tarea, con ganas. Prueba una clase gratis.",
    url: "estudio-milan.denik.me",
  },
}

type ChatStep =
  | { side: "in" | "out"; text: string; delay: number }
  | { typing: true; delay: number }
  | { card: true; delay: number }

const CHAT_SCRIPT: ChatStep[] = [
  {
    side: "in",
    text: "¡Hola! Soy el asistente de Estudio Milán 🎵 ¿Te ayudo a agendar una clase?",
    delay: 400,
  },
  { side: "in", text: "¿Qué te interesa: piano, violín o canto?", delay: 1400 },
  { typing: true, delay: 1200 },
  { side: "out", text: "Piano, para mi hija de 9 años", delay: 0 },
  { typing: true, delay: 900 },
  {
    side: "in",
    text: "¡Perfecto! Tenemos clases infantiles los sábados 10:00 y 12:00. ¿Cuál prefieres?",
    delay: 1600,
  },
  { typing: true, delay: 1100 },
  { side: "out", text: "Las 10:00 de este sábado", delay: 0 },
  { typing: true, delay: 1000 },
  { card: true, delay: 1400 },
  {
    side: "in",
    text: "¿Confirmamos? Te mando el recordatorio por WhatsApp 📩",
    delay: 800,
  },
]

type RenderItem =
  | { kind: "msg"; side: "in" | "out"; text: string; id: number }
  | { kind: "card"; id: number }
  | { kind: "typing"; id: number }

export default function IA() {
  const [items, setItems] = useState<RenderItem[]>([])
  const [inputValue, setInputValue] = useState("")
  const chatBodyRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(0)
  const nextId = () => ++idRef.current

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const schedule = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(() => resolve(), ms)
        timers.push(t)
      })
    const runChat = async () => {
      while (!cancelled) {
        setItems([])
        for (const step of CHAT_SCRIPT) {
          if (cancelled) return
          await schedule(step.delay)
          if (cancelled) return
          setItems((prev) => {
            const cleaned = prev.filter((p) => p.kind !== "typing")
            if ("typing" in step)
              return [...cleaned, { kind: "typing", id: nextId() }]
            if ("card" in step)
              return [...cleaned, { kind: "card", id: nextId() }]
            return [
              ...cleaned,
              { kind: "msg", side: step.side, text: step.text, id: nextId() },
            ]
          })
          requestAnimationFrame(() => {
            const el = chatBodyRef.current
            if (el) el.scrollTop = el.scrollHeight
          })
        }
        await schedule(8000)
      }
    }
    runChat()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    const el = chatBodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [items])

  const handleChatSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    const v = inputValue.trim()
    if (!v) return
    setInputValue("")
    setItems((prev) => [
      ...prev,
      { kind: "msg", side: "out", text: v, id: nextId() },
    ])
    setTimeout(
      () => setItems((prev) => [...prev, { kind: "typing", id: nextId() }]),
      300,
    )
    setTimeout(() => {
      setItems((prev) => {
        const cleaned = prev.filter((p) => p.kind !== "typing")
        return [
          ...cleaned,
          {
            kind: "msg",
            side: "in",
            text: "¡Claro! Déjame checar los horarios disponibles 🙂",
            id: nextId(),
          },
        ]
      })
    }, 1600)
  }

  const s = STYLES.warm

  return (
    <section className="bg-brand_dark">
      <TopBar />
      <main className="bg-white min-h-screen rounded-b-[40px] flex flex-col font-satoshi text-brand_dark antialiased">
        {/* HERO */}
        <section className="relative min-h-svh flex items-center overflow-hidden pt-[140px] pb-10">
          <div className="w-full max-w-7xl mx-auto px-5 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-[1.05fr_.95fr] items-center gap-10 md:gap-14">
              <div>
                <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white border border-black/5 text-[13px] font-medium text-brand_gray shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(17,21,26,.04)]">
                  <img
                    src="/images/nik.svg"
                    alt="Nik"
                    className="w-[22px] h-[22px] rounded-full object-contain"
                  />
                  Nik IA — incluido en todos los planes
                </div>
                <h1 className="group mt-5 text-4xl md:text-5xl lg:text-6xl font-satoBold text-brand_dark  tracking-tight">
                  Tu negocio
                  <br />
                  con un{" "}
                  <span className="text-brand_blue italic">copiloto</span>{" "}
                  <StarLights className="inline-block w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 align-middle group-hover:animate-vibration-effect cursor-pointer" />
                  <br />
                  que nunca duerme.
                </h1>
                <p className="mt-5 md:mt-6 text-lg md:text-2xl text-brand_gray font-satoshi leading-relaxed max-w-[540px]">
                  Tres herramientas de Inteligencia Artificial que trabajan
                  contigo: crean tu sitio de reservas, atienden a tus clientes y
                  te ayudan a tomar decisiones — todo desde un solo lugar.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-7">
                  <PrimaryButton as="Link" to="/signin">
                    Empezar gratis <ArrowRight />
                  </PrimaryButton>
                  <SecondaryButton>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Ver demo (1:30)
                  </SecondaryButton>
                </div>
              </div>

              {/* Hero visual */}
              <div className="relative h-[500px] md:h-[560px]">
                <div className="pointer-events-none absolute left-[-40px] top-10 w-80 h-80 rounded-full blur-[60px] opacity-55 bg-[#E5ECFF]" />
                <div className="pointer-events-none absolute right-[-20px] bottom-10 w-64 h-64 rounded-full blur-[60px] opacity-55 bg-[#FFF3DC]" />
                <span className="absolute top-[4%] left-[18%] -rotate-[8deg] text-brand_blue text-[22px] font-['Gloria_Hallelujah',cursive]">
                  ✨ magia
                </span>
                <span className="absolute bottom-[14%] right-[6%] rotate-[6deg] text-brand_dark text-[20px] font-['Gloria_Hallelujah',cursive]">
                  24/7 activo
                </span>

                {/* Site card */}
                <div className="absolute right-[4%] top-[6%] w-[340px] bg-white border border-black/5 rounded-[20px] shadow-[0_8px_32px_rgba(204,204,204,.25)] overflow-hidden ia-floaty-slow">
                  <div className="flex gap-1.5 px-3.5 py-2.5 border-b border-[#EFEFEF] items-center">
                    <i className="block w-2.5 h-2.5 rounded-full bg-[#FF6057]" />
                    <i className="block w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <i className="block w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
                    <span className="ml-2 text-[11px] text-brand_gray font-mono">
                      estudiomilan.denik.me
                    </span>
                  </div>
                  <div className="relative h-24 grid place-items-end p-2.5 text-white text-[10px] tracking-widest uppercase font-bold overflow-hidden">
                    <img
                      src="/images/img2.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="relative">Estudio Milán · Música</span>
                  </div>
                  <div className="px-3.5 pt-3 pb-3.5">
                    <h4 className="m-0 mb-1 text-[15px] font-bold font-satoBold">
                      Reserva tu clase
                    </h4>
                    <div className="text-[11px] text-brand_gray">
                      Mar–Sáb · CDMX
                    </div>
                    <div className="flex gap-1.5 mt-2.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full border border-[#EFEFEF] text-[10px]">
                        Piano
                      </span>
                      <span className="px-2 py-0.5 rounded-full border border-[#EFEFEF] text-[10px]">
                        Violín
                      </span>
                      <span className="px-2 py-0.5 rounded-full border border-[#EFEFEF] text-[10px]">
                        Canto
                      </span>
                    </div>
                    <div className="flex gap-2 items-center mt-3 p-2 rounded-xl bg-[#F8F8F8]">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand_cloud to-[#38A6A0]" />
                      <div>
                        <div className="text-[11px] font-semibold">
                          Clase de piano
                        </div>
                        <div className="text-[10px] text-brand_gray">
                          45 min · $350
                        </div>
                      </div>
                      <div className="ml-auto px-2.5 py-1.5 rounded-full bg-brand_blue text-white text-[10px] font-semibold">
                        Reservar
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat bubble card */}
                <div className="absolute left-[8%] top-[36%] w-[280px] bg-white border border-black/5 rounded-[20px] p-3.5 shadow-[0_8px_32px_rgba(204,204,204,.25)] ia-floaty">
                  <div className="px-3.5 py-2.5 rounded-[14px] rounded-bl text-[13px] leading-snug max-w-[220px] mb-2 bg-[#F3F4F6] text-brand_dark">
                    ¿Tienen cupo el sábado?
                  </div>
                  <div className="px-3.5 py-2.5 rounded-[14px] rounded-br text-[13px] leading-snug max-w-[220px] mb-2 bg-brand_blue text-white ml-auto">
                    ¡Sí! Te puedo apartar las 11:00 o 13:30 🎶
                  </div>
                  <div className="inline-flex gap-0.5 px-3.5 py-2.5 bg-[#F3F4F6] rounded-[14px] rounded-bl ia-typ">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                  </div>
                </div>

                {/* WhatsApp card */}
                <div className="absolute left-[28%] bottom-[2%] w-[260px] bg-white border border-black/5 rounded-[20px] p-3 shadow-[0_8px_32px_rgba(204,204,204,.25)] rotate-[3deg] ia-floaty-rot">
                  <div className="flex gap-2 items-center pb-2 border-b border-[#EFEFEF] mb-2.5">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#25D366] grid place-items-center text-white">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4a8 8 0 0 0-6.8 12.16L4 20l3.92-1.2A8 8 0 0 0 12 20a8 8 0 0 0 5.6-13.68z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold">Denik Agente</div>
                      <div className="text-[10px] text-brand_gray">
                        Ingresos esta semana
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2 rounded-[10px] rounded-bl text-xs mb-1.5 max-w-[85%] bg-[#F0F0F0]">
                    📊 Subiste 18% vs semana pasada
                  </div>
                  <div className="px-2.5 py-2 rounded-[10px] rounded-br text-xs mb-1.5 max-w-[85%] bg-[#DCF8C6] ml-auto">
                    ¡Qué buena onda! Manda reporte
                  </div>
                </div>
              </div>
            </div>

            {/* Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 mt-14 divide-y md:divide-y-0 md:divide-x divide-brand_pale">
              <Pillar
                bg="bg-brand_ash/20"
                color="text-brand_gray"
                title="Sitio web con IA"
                desc="Generado en minutos, listo para reservar"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M9 13l2 2 4-4" />
                  </svg>
                }
              />
              <Pillar
                bg="bg-brand_ash/20"
                color="text-brand_iron"
                title="Chatbot para clientes"
                desc="Responde y reserva por ti, 24/7"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />
                  </svg>
                }
              />
              <Pillar
                bg="bg-brand_ash/20"
                color="text-brand_dark"
                title="Agente para tu negocio"
                desc="Te responde en WhatsApp y te guía"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* SECTION HEAD + FEATURE 1 — Landing builder */}
        <section className="py-20 md:py-[80px]">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <SectionHead>
              Nik
              <img
                src="/images/nik.svg"
                alt="Nik"
                className="inline-block w-16 h-16 -mt-3 align-middle mx-2 group-hover:animate-vibration-effect cursor-pointer"
              />
              , el mejor asistente en un solo lugar
            </SectionHead>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-20 mt-8">
              <div>
                <h3 className="font-satoBold text-2xl lg:text-4xl text-brand_dark !leading-tight">
                  Una{" "}
                  <Highlight color="bg-[#FFC166]">
                    landing de reservas
                  </Highlight>{" "}
                  lista en 2 minutos
                </h3>
                <p className="text-brand_gray text-xl lg:text-2xl font-satoshi mt-3 lg:mt-6 mb-4">
                  Nik arma tu sitio: paleta, textos, servicios y botón para
                  reservar. Tú solo ajustas lo que quieras.
                </p>
                <FeatPoints
                  color="bg-brand_blue"
                  items={[
                    "Diseño de tu landing page con base en tu tipo de negocios",
                    "Botones de reserva conectados con tu agenda desde el primer clic",
                    <>
                      Dominio gratis{" "}
                      <code className="font-mono text-[13px] text-[#7A5512] bg-[#FFF3DC] px-1.5 py-px rounded">
                        tunegocio.denik.me
                      </code>
                    </>,
                    "Editable sin código — cambia lo que quieras en un clic",
                  ]}
                />
                <div className="flex flex-wrap gap-2.5 items-center">
                  <PrimaryButton as="Link" to="/signin">
                    Probar el constructor
                  </PrimaryButton>
                  <SecondaryButton>Ver ejemplos →</SecondaryButton>
                </div>
              </div>

              <WobbleCard className="w-full md:w-[80%] mx-auto lg:w-[90%] min-h-[600px] grid place-items-center">
                {/* Site preview */}
                <div className="bg-white rounded-[18px] flex flex-col relative w-full max-w-[440px] mx-auto shadow-[0_20px_50px_rgba(17,21,26,.12)] border border-black/5 overflow-hidden">
                  <div className="absolute top-3.5 right-4 z-10 px-2.5 py-1.5 rounded-full bg-brand_dark text-white text-[11px] flex items-center gap-1.5 font-semibold shadow-[0_6px_20px_rgba(17,21,26,.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#78DA89] ia-pulse" />{" "}
                    Generando con IA…
                  </div>
                  {/* Browser chrome */}
                  <div className="flex gap-[5px] px-3 py-2 border-b border-[#F2F2F2] items-center">
                    <i className="block w-[9px] h-[9px] rounded-full bg-[#FF6057]" />
                    <i className="block w-[9px] h-[9px] rounded-full bg-[#FFBD2E]" />
                    <i className="block w-[9px] h-[9px] rounded-full bg-[#28CA41]" />
                    <span className="ml-2 flex-1 bg-[#F5F5F7] rounded-full px-2.5 py-0.5 text-[11px] text-brand_gray font-mono text-center">
                      {s.url}
                    </span>
                  </div>
                  {/* Mini nav */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F2F2F2]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-brand_lime grid place-items-center text-brand_dark text-[10px] font-bold">
                        M
                      </div>
                      <span className="text-[11px] font-satoBold font-bold">
                        Estudio Milán
                      </span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-brand_gray">
                      <span>Servicios</span>
                      <span>Nosotros</span>
                      <span className="text-brand_dark font-semibold">
                        Reservar
                      </span>
                    </div>
                  </div>
                  {/* Hero image full-width */}
                  <div className="relative h-[160px] overflow-hidden">
                    <img
                      src="/images/img3.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h5 className="m-0 font-satoBold font-extrabold text-[18px] leading-tight tracking-tight">
                        {s.title}
                      </h5>
                      <div className="text-[11px] text-white/90 mt-1 leading-snug">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                  {/* Primary CTA */}
                  <div className="px-4 pt-3">
                    <button
                      type="button"
                      className="w-full bg-brand_lime text-brand_dark rounded-full px-4 py-2.5 text-[12px] font-satoBold font-bold shadow-[0_6px_16px_rgba(191,221,120,.35)]"
                    >
                      Reservar ahora →
                    </button>
                  </div>
                  {/* Services */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-brand_gray">
                        Servicios
                      </span>
                      <span className="text-[10px] text-brand_blue font-semibold">
                        Ver todos →
                      </span>
                    </div>
                    <div className="flex gap-2 p-2 rounded-[10px] bg-[#FAFAFA] mb-1.5 items-center">
                      <div className="w-[36px] h-[36px] rounded-lg bg-gradient-to-br from-brand_blue to-[#9DA3FF] grid place-items-center text-white text-base">
                        ♫
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold">
                          Clase de piano
                        </div>
                        <div className="text-[10px] text-brand_gray">
                          45 min · individual · Prof. Ana M.
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-bold text-brand_dark">
                          $350
                        </div>
                        <div className="text-[9px] text-brand_gray">
                          por clase
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 rounded-[10px] bg-[#FAFAFA] mb-1.5 items-center">
                      <div className="w-[36px] h-[36px] rounded-lg bg-gradient-to-br from-[#FFC166] to-[#F19B3D] grid place-items-center text-white text-base">
                        𝄞
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold">
                          Clase de violín
                        </div>
                        <div className="text-[10px] text-brand_gray">
                          60 min · grupal · hasta 4 personas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-bold text-brand_dark">
                          $480
                        </div>
                        <div className="text-[9px] text-brand_gray">
                          por clase
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Trust row */}
                  <div className="px-4 pb-4 flex items-center gap-3 text-[10px] text-brand_gray">
                    <div className="flex items-center gap-1">
                      <span className="text-[#FFC166]">★★★★★</span>
                      <span className="font-semibold text-brand_dark">4.9</span>
                    </div>
                    <span>·</span>
                    <span>+120 alumnos activos</span>
                  </div>
                </div>
              </WobbleCard>
            </div>
          </div>
        </section>

        {/* FEATURE 2 — Chatbot */}
        <section className="pt-5 pb-20 md:py-20">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-20">
              <div className="order-2 md:order-1">
                <WobbleCard className="w-full md:w-[80%] mx-auto lg:w-[90%] min-h-[600px] grid place-items-center">
                  <div className="w-full max-w-[420px] bg-gray-100 rounded-[22px] overflow-hidden border-brand_stroke border ">
                    <div className="bg-brand_yellow p-4 flex gap-3 items-center text-brand_dark">
                      <div className="relative w-10 h-10">
                        <div className="w-10 h-10 rounded-full bg-white grid place-items-center overflow-hidden">
                          <img
                            src="/images/nik.svg"
                            alt="Nik"
                            className="w-7 h-7 object-contain"
                          />
                        </div>
                        <span className="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-[#78DA89]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm font-satoBold">
                          Nik
                        </div>
                        <div className="text-[11px] opacity-70">
                          En línea · responde al instante
                        </div>
                      </div>
                      <div className="ml-auto w-7 h-7 rounded-full bg-brand_dark/10 grid place-items-center cursor-pointer">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                    <div
                      className="p-4 bg-[#FAFBFF] h-[380px] overflow-y-auto flex flex-col gap-2.5"
                      ref={chatBodyRef}
                    >
                      {items.map((it) => {
                        if (it.kind === "typing") {
                          return (
                            <div
                              key={it.id}
                              className="inline-flex gap-1 px-3.5 py-2.5 bg-white border border-[#EFEFEF] rounded-2xl rounded-bl-md w-max ia-typ"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                            </div>
                          )
                        }
                        if (it.kind === "card") {
                          return (
                            <div
                              key={it.id}
                              className="ia-msg-anim max-w-[78%]"
                            >
                              <div className="bg-white border border-[#EFEFEF] rounded-[14px] p-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-xs text-brand_gray font-semibold">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#FFD75E"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                  >
                                    <rect
                                      x="3"
                                      y="4"
                                      width="18"
                                      height="18"
                                      rx="2"
                                    />
                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                  </svg>
                                  Clase de piano infantil
                                </div>
                                <div className="font-bold text-sm">
                                  Sábado 18 abr · 10:00
                                </div>
                                <div className="text-xs text-brand_gray">
                                  45 min · Profa. Ana M. · $350
                                </div>
                                <button
                                  type="button"
                                  className="mt-1 bg-brand_yellow text-brand_dark rounded-full px-3 py-2 text-xs font-semibold text-center border-0 cursor-pointer font-satoshi"
                                >
                                  Confirmar reserva →
                                </button>
                              </div>
                            </div>
                          )
                        }
                        const side = it.side
                        return (
                          <div
                            key={it.id}
                            className={
                              "max-w-[78%] px-3.5 py-2.5 text-sm leading-snug rounded-2xl ia-msg-anim " +
                              (side === "in"
                                ? "bg-white border border-[#EFEFEF] text-brand_dark rounded-bl-md"
                                : "bg-brand_dark text-white self-end rounded-br-md")
                            }
                          >
                            {it.text}
                          </div>
                        )
                      })}
                    </div>
                    <div className="p-3 border-t border-[#EFEFEF] flex gap-2 items-center bg-white">
                      <input
                        placeholder="Escribe tu mensaje…"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleChatSend}
                        className="flex-1 border-0 outline-none px-3 py-2 rounded-full bg-[#F4F5F7] text-[13px] font-satoshi"
                      />
                      <button
                        type="button"
                        aria-label="Enviar"
                        className="w-9 h-9 rounded-full bg-brand_yellow grid place-items-center cursor-pointer border-0"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="#11151A"
                        >
                          <path d="M2 12l20-9-9 20-2-9z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </WobbleCard>
              </div>

              <div className="order-1 md:order-2">
                <h3 className="font-satoBold text-2xl lg:text-4xl text-brand_dark leading-[1.02] tracking-tight my-3.5">
                  Un asistente que{" "}
                  <Highlight color="bg-[#78DA89]">atiende y reserva</Highlight>{" "}
                  por ti
                </h3>
                <p className="text-xl lg:text-2xl text-brand_gray mb-6 max-w-[540px]">
                  Se agrega a tu sitio en 1 clic. Aprende de tus servicios,
                  horarios y precios — y responde a tus clientes incluso a las 3
                  AM.
                </p>
                <FeatPoints
                  color="bg-brand_blue"
                  items={[
                    "Contesta preguntas sobre precios, ubicación y horarios",
                    "Agenda citas directas en tu calendario de Denik",
                    "Hace upsell: sugiere paquetes y servicios relacionados",
                    "Escala a humano cuando la conversación lo amerita",
                  ]}
                />
                <div className="flex flex-wrap gap-2.5 items-center">
                  <PrimaryButton as="Link" to="/signin">
                    Activar chatbot
                  </PrimaryButton>
                  <SecondaryButton>Cómo se entrena →</SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE 3 — Agent WhatsApp */}
        <section className="pt-5 pb-20 md:py-20">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-20">
              <div>
                <h3 className="font-satoBold text-2xl lg:text-4xl text-brand_dark leading-[1.02] tracking-tight my-3.5">
                  Tu <Highlight color="bg-brand_cloud">mano derecha</Highlight>,
                  directo en WhatsApp.
                </h3>
                <p className="text-xl lg:text-2xl leading-relaxed text-brand_gray mb-6 max-w-[540px]">
                  Háblale cuando quieras. Conecta tu número y pidele agendar una
                  cita o pregúntale por ganancias, clientes y servicios.
                </p>
                <FeatPoints
                  color="bg-brand_blue"
                  items={[
                    'Reportes a tu medida: "¿cómo voy este mes?"',
                    "Alertas proactivas: huecos en agenda, no-shows, pagos pendientes",
                    "Sugerencias de promociones según temporada y tu historial",
                    "Funciona con tu WhatsApp personal o business",
                  ]}
                />
                <div className="flex flex-wrap gap-2.5 items-center">
                  <PrimaryButton
                    as="Link"
                    to="/dash/asistente"
                    className="!bg-[#25D366]"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4a8 8 0 0 0-6.8 12.16L4 20l3.92-1.2A8 8 0 0 0 12 20a8 8 0 0 0 5.6-13.68z" />
                    </svg>
                    Conectar WhatsApp
                  </PrimaryButton>
                  <SecondaryButton>Ver todo lo que hace →</SecondaryButton>
                </div>
              </div>

              <div>
                <WobbleCard className="w-full md:w-[80%] mx-auto lg:w-[90%] min-h-[600px] grid place-items-center">
                  <div className="relative w-full max-w-[420px] mx-auto">
                    <div className="bg-[#E6E1D3] ia-wa-bg rounded-[22px] overflow-hidden">
                      <div className="bg-[#075E54] text-white px-4 py-3.5 flex gap-3 items-center">
                        <svg
                          className="opacity-80"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <div className="w-9 h-9 rounded-full bg-white grid place-items-center overflow-hidden">
                          <img
                            src="/images/nik.svg"
                            alt="Nik"
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Nik</div>
                          <div className="text-[11px] opacity-75">en línea</div>
                        </div>
                        <div className="ml-auto flex gap-4 opacity-85">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M15.54 5A10 10 0 0 1 19 12M17.07 2.93A14 14 0 0 1 22 12M8 5.5C8 8 10 10 13 10M13 10c3 0 5 2 5 4.5M13 10v5M8 5.5H5a2 2 0 0 0-2 2v2a17 17 0 0 0 17 17h2a2 2 0 0 0 2-2v-3" />
                          </svg>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </div>
                      </div>
                      <div className="p-3.5 min-h-[360px] flex flex-col gap-1.5">
                        <div className="self-center bg-white/70 px-2.5 py-0.5 rounded-lg text-[10px] text-[#555] my-2.5">
                          HOY
                        </div>
                        <WaMsg side="out">
                          ¿Cómo voy este mes? <Ts side="out">10:24 ✓✓</Ts>
                        </WaMsg>
                        <WaMsg side="in">
                          📈 Llevas <b>$42.800</b> — 18% arriba vs mes pasado.
                          <br />
                          Viernes es tu día más fuerte.
                          <Ts side="in">10:24</Ts>
                        </WaMsg>
                        <WaMsg side="in">
                          Ojo: <b>3 clientes habituales</b> no han vuelto en 30+
                          días. ¿Les mando promo?
                          <Ts side="in">10:24</Ts>
                        </WaMsg>
                        <WaMsg side="out">
                          Sí, un 15% de descuento <Ts side="out">10:25 ✓✓</Ts>
                        </WaMsg>
                        <WaMsg side="in">
                          Listo. Envié a Ana, Rodrigo y Sofía. Te aviso cuando
                          reserven. 🙌<Ts side="in">10:25</Ts>
                        </WaMsg>
                      </div>
                    </div>
                  </div>
                </WobbleCard>
              </div>
            </div>
          </div>
        </section>

        <StatsBelt />
        {/* TESTIMONIALS */}
        <section className="py-10 md:py-20">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="text-center max-w-[720px] mx-auto mb-10">
              <h2 className="font-satoBold font-extrabold text-[40px] md:text-[56px] leading-[1.02] tracking-tight mt-4 mb-3 text-brand_dark">
                Negocios que ya
                <br />
                duermen más tranquilos
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-5">
              <div className="md:row-span-2 p-6 rounded-[24px] bg-white border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(17,21,26,.04)] text-brand_dark flex flex-col gap-4 justify-between">
                <div className="font-satoBold font-semibold text-2xl leading-[1.25] tracking-tight">
                  "El chatbot reservó 23 citas mientras yo cerraba el salón el
                  viernes.{" "}
                  <em className="not-italic text-brand_blue font-bold font-['Caveat',cursive]">
                    Parece mentira
                  </em>{" "}
                  — pero es real."
                </div>
                <div className="flex gap-2.5 items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9DA3FF] to-brand_blue flex-none" />
                  <div>
                    <div className="font-bold text-sm font-satoBold">
                      Luisa Flores
                    </div>
                    <div className="text-xs text-brand_gray">
                      Salón Westeros · Monterrey
                    </div>
                  </div>
                  <div className="ml-auto text-[#FFC166]">★★★★★</div>
                </div>
              </div>
              <Testi
                q="Mi sitio se armó solo. Le cambié dos fotos, publiqué, y al día siguiente ya tenía reservas."
                name="Brenda Ortega"
                role="Estudio Milán · CDMX"
                avatar="from-[#FFC166] to-[#F19B3D]"
              />
              <Testi
                q="Le pregunto al agente cómo voy mientras manejo al trabajo. Es como tener socio que sí lleva las cuentas."
                name="Rodrigo Peña"
                role="Taller Moto · Guadalajara"
                avatar="from-[#78DA89] to-[#3ABE56]"
              />
              <Testi
                q="Pasé de contestar WhatsApp a las 11 PM a dedicar esas horas a mis hijos. Lo recomiendo mil."
                name="Sofía Márquez"
                role="Yoga Raíz · Puebla"
                avatar="from-brand_cloud to-[#38A6A0]"
              />
              <Testi
                q="El agente me avisó que un cliente top llevaba 6 semanas sin venir. Le mandamos promo y regresó."
                name="Ana Téllez"
                role="Spa Jade · Mérida"
                avatar="from-[#FFC166] to-[#F19B3D]"
              />
            </div>
          </div>
        </section>
        <FinalCta>
          <h2 className="group text-4xl lg:text-6xl	font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">Tu agenda. </span>
            <People className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> Tus clientes.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-satoBold  text-brand_dark mb-16 leading-normal ">
            Tu negocio.
          </h2>
        </FinalCta>
      </main>

      <Footer />
    </section>
  )
}

// ============ SUB-COMPONENTS ============

function Pillar({
  bg,
  color,
  title,
  desc,
  icon,
}: {
  bg: string
  color: string
  title: string
  desc: string
  icon: React.ReactNode
}) {
  return (
    <div className="px-5 py-5 md:px-6 flex gap-3.5 items-center">
      <div
        className={`${bg} ${color} w-11 h-11 rounded-xl grid place-items-center flex-none [&>svg]:w-5 [&>svg]:h-5`}
      >
        {icon}
      </div>
      <div>
        <div className="font-bold text-[15px] font-satoBold">{title}</div>
        <div className="text-[13px] text-brand_gray mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

function SectionHead({
  tag,
  children,
}: {
  tag?: string
  children: React.ReactNode
}) {
  return (
    <div className="text-center max-w-[720px] mx-auto mb-14">
      {tag && (
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5ECFF] text-brand_blue text-[13px] font-semibold">
          {tag}
        </span>
      )}
      <h2 className="group font-satoBold text-4xl lg:text-6xl leading-[1.02] tracking-tight mt-4 mb-3 text-brand_dark">
        {children}
      </h2>
    </div>
  )
}

function Highlight({
  color,
  children,
}: {
  color: string
  children: React.ReactNode
}) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <span
        className={`absolute -left-1 -right-1 bottom-[2px] h-3 ${color} opacity-40 -z-[1] rounded`}
      />
    </span>
  )
}

function FeatPoints({ items }: { color?: string; items: React.ReactNode[] }) {
  return (
    <ul className="list-none p-0 grid gap-3 mb-12">
      {items.map((it, i) => (
        <li
          key={i}
          className="text-brand_gray text-base lg:text-xl font-satoshi flex gap-2 "
        >
          <FaRobot className="flex-none text-brand_blue text-lg mt-0.5" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

function WaMsg({
  side,
  children,
}: {
  side: "in" | "out"
  children: React.ReactNode
}) {
  const base =
    "max-w-[76%] pt-1.5 pb-[18px] px-2.5 rounded-lg text-[13px] leading-tight relative shadow-[0_1px_.5px_rgba(0,0,0,.13)]"
  return (
    <div
      className={
        side === "in"
          ? `${base} bg-white rounded-tl-sm`
          : `${base} bg-[#DCF8C6] self-end rounded-tr-sm`
      }
    >
      {children}
    </div>
  )
}

function Ts({
  side,
  children,
}: {
  side: "in" | "out"
  children: React.ReactNode
}) {
  return (
    <span
      className={`absolute right-2 bottom-1 text-[9px] ${side === "out" ? "text-[#5A8F63]" : "text-[#888]"}`}
    >
      {children}
    </span>
  )
}

function _HowCard({
  num,
  title,
  desc,
  children,
}: {
  num: string
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="p-7 rounded-[24px] bg-white border border-black/5 relative overflow-hidden">
      <span className="absolute right-[18px] -top-1.5 text-[70px] text-brand_blue opacity-20 leading-none font-bold font-['Caveat',cursive]">
        {num}
      </span>
      <div className="w-11 h-11 rounded-xl bg-[#E5ECFF] text-brand_blue grid place-items-center mb-3.5 [&>svg]:w-[22px] [&>svg]:h-[22px]">
        {children}
      </div>
      <h4 className="font-satoBold font-bold text-xl m-0 mb-2 tracking-tight">
        {title}
      </h4>
      <p className="text-sm text-brand_gray leading-normal m-0">{desc}</p>
    </div>
  )
}

function Testi({
  q,
  name,
  role,
  avatar,
}: {
  q: string
  name: string
  role: string
  avatar: string
}) {
  return (
    <div className="p-6 rounded-[24px] bg-white border border-black/5 flex flex-col gap-4 shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(17,21,26,.04)]">
      <div className="text-[15px] leading-normal text-brand_dark">{q}</div>
      <div className="flex gap-2.5 items-center">
        <div
          className={`w-10 h-10 rounded-full flex-none bg-gradient-to-br ${avatar}`}
        />
        <div>
          <div className="font-bold text-sm font-satoBold">{name}</div>
          <div className="text-xs text-brand_gray">{role}</div>
        </div>
      </div>
      <div className="text-[#FFC166] text-sm">★★★★★</div>
    </div>
  )
}
