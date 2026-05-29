import { HandShake } from "~/components/icons/handshake"
import { OrbitingStars } from "~/components/icons/orbiting-stars"

export function StatsBelt() {
  return (
    <section className="max-w-[90%] xl:max-w-7xl mx-auto py-10 md:py-16">
      <div className="relative rounded-2xl md:rounded-[40px] bg-brand_dark p-8 md:p-12 overflow-hidden text-white">
        <OrbitingStars />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.05fr_1.35fr] items-center gap-10 md:gap-14">
          <div className="text-left">
            <h2 className="group font-satoBold text-2xl md:text-4xl text-white leading-tight tracking-tight mb-4">
              La IA no reemplaza tu{" "}
              <span className="relative inline-block whitespace-nowrap">
                toque humano
                <span className="absolute -left-1 -right-1 bottom-[2px] h-3 bg-brand_yellow opacity-40 -z-[1] rounded" />
              </span>{" "}
              <HandShake
                fill="#FFD75E"
                className="inline-block w-9 h-9 md:w-11 md:h-11 align-middle group-hover:animate-vibration-effect cursor-pointer"
              />
            </h2>
            <p className="text-brand_ash text-base md:text-lg leading-relaxed max-w-lg">
              <b className="text-white font-satoBold">Te ahorra tiempo.</b>{" "}
              Automatizamos lo aburrido —agendar, responder lo repetitivo y
              generar reportes— para que puedas enfocarte en lo que realmente
              marca la diferencia: tu servicio y la atención que solo tú sabes
              dar.
            </p>
            <div className="flex mt-6">
              <BeltAv src="https://i.imgur.com/RAiyJBc.jpg" />
              <BeltAv src="https://i.imgur.com/TFQxcIu.jpg" />
              <BeltAv src="https://www.formmy.app/home/abraham.webp" />
              <BeltAv bg="bg-white/10 text-white/90">+</BeltAv>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BeltStat
              color="cloud"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              value={
                <>
                  <span className="text-[28px] opacity-60 -mr-0.5">+</span>9
                  <span className="text-[22px] opacity-60 ml-1">h</span>
                </>
              }
              label="Horas ahorradas cada semana, en promedio"
              sub="vs. operar a mano"
            />
            <BeltStat
              color="lime"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
              value={
                <>
                  87
                  <span className="text-[22px] opacity-60 ml-1">%</span>
                </>
              }
              label="De las reservas se completan sin que intervengas"
              sub="el chatbot hace el resto"
            />
            <BeltStat
              color="yellow"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              }
              value={
                <>
                  2
                  <span className="text-[22px] opacity-60 ml-1">min</span>
                </>
              }
              label="Para tener tu sitio de reservas listo y publicado"
              sub="de prompt a URL viva"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function BeltAv({
  bg,
  src,
  children,
}: {
  bg?: string
  src?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={`${bg ?? ""} w-[38px] h-[38px] rounded-full border-2 border-brand_dark -ml-2 first:ml-0 grid place-items-center text-xs font-bold text-white overflow-hidden`}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        children
      )}
    </div>
  )
}

function BeltStat({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  sub: string
  color: "cloud" | "lime" | "yellow"
}) {
  const text = {
    cloud: "text-brand_cloud",
    lime: "text-brand_lime",
    yellow: "text-brand_yellow",
  }[color]
  return (
    <div className="rounded-2xl p-5 bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
      <div
        className={`w-10 h-10 rounded-xl grid place-items-center mb-4 bg-white/10 ${text} [&>svg]:w-5 [&>svg]:h-5`}
      >
        {icon}
      </div>
      <div className="font-satoBold text-[48px] tracking-tight leading-none flex items-baseline gap-0.5 text-white">
        {value}
      </div>
      <div className="text-brand_ash text-[13px] leading-snug mt-3 font-satoshi">
        {label}
      </div>
      <div className="text-[11px] text-white/40 mt-2 font-satoshi">{sub}</div>
    </div>
  )
}
