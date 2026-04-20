export function StatsBelt() {
  return (
    <section className="py-10 md:pt-10 md:pb-16">
      <div className="relative isolate max-w-[90%] md:max-w-7xl mx-auto w-full rounded-[24px] md:rounded-[40px] px-6 py-12 md:px-12 md:py-16 overflow-hidden text-white bg-brand_dark">
        <div className="absolute inset-0 pointer-events-none stats-belt-grid" />
        <div className="absolute -z-10 -top-[140px] -left-[100px] w-[380px] h-[380px] rounded-full blur-[80px] opacity-45 bg-[radial-gradient(circle,var(--tw-gradient-from)_0%,transparent_65%)] from-brand_blue" />
        <div className="absolute -z-10 -bottom-[140px] -right-20 w-80 h-80 rounded-full blur-[80px] opacity-20 bg-[radial-gradient(circle,#FFC166_0%,transparent_65%)]" />
        <div className="hidden md:block absolute top-8 right-[60px] w-[110px] h-[74px] -rotate-[6deg] opacity-50 text-[#FFC166]">
          <svg
            viewBox="0 0 120 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 40 C 20 10, 40 10, 60 40 S 100 70, 116 40" />
          </svg>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-[1.05fr_1.35fr] items-center gap-8 md:gap-14">
          <div className="relative z-[2]">
            <div className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold tracking-widest uppercase text-white/80">
              <span className="w-1.5 h-1.5 rounded-full bg-brand_yellow shadow-[0_0_10px_#FFD75E]" />{" "}
              filosofía
            </div>
            <h3 className="font-satoBold font-extrabold text-[32px] md:text-[44px] leading-[1.02] tracking-tight mt-4 mb-4">
              La IA no reemplaza
              <br />
              <span className="relative inline-block text-white/55">
                tu toque humano.
                <span className="absolute left-[-4px] right-[-4px] top-[56%] h-[3px] bg-brand_yellow rounded-sm -rotate-[1.5deg]" />
              </span>
              <span className="block text-brand_yellow text-[28px] md:text-[40px] mt-3.5 -rotate-[1.5deg] -translate-x-0.5 leading-[1.1] font-['Gloria_Hallelujah',cursive]">
                Te ahorra tiempo.
              </span>
            </h3>
            <p className="text-[15px] leading-relaxed text-white/70 mb-6 max-w-[460px]">
            Automatizamos lo aburrido —agendar, responder lo repetitivo y generar reportes— para que puedas enfocarte en lo que realmente marca la diferencia:  <b className="text-white font-bold">tu servicio y la atención que solo tú sabes dar.</b>
            </p>
            <div className="flex mb-2">
              <BeltAv src="https://i.imgur.com/RAiyJBc.jpg" />
              <BeltAv src="https://i.imgur.com/TFQxcIu.jpg" />
              <BeltAv src="https://www.formmy.app/home/abraham.webp" />
              <BeltAv bg="bg-white/10 text-white/90">+</BeltAv>
            </div>
          </div>

          <div className="relative z-[2] grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
                  <span className="text-[26px] opacity-70 -mr-0.5">+</span>9
                  <span className="text-[20px] font-bold opacity-75 ml-1">
                    h
                  </span>
                </>
              }
              label="Horas ahorradas cada semana, en promedio"
              barWidth="82%"
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
                  <span className="text-[20px] font-bold opacity-75 ml-1">
                    %
                  </span>
                </>
              }
              label="De las reservas se completan sin que intervengas"
              barWidth="87%"
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
                  <span className="text-[20px] font-bold opacity-75 ml-1">
                    min
                  </span>
                </>
              }
              label="Para tener tu sitio de reservas listo y publicado"
              barWidth="14%"
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
      className={`${bg ?? ""} w-[34px] h-[34px] rounded-full border-2 border-brand_dark -ml-2 first:ml-0 grid place-items-center text-xs font-bold text-white overflow-hidden`}
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
  barWidth,
  sub,
  color,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  barWidth: string
  sub: string
  color: "cloud" | "lime" | "yellow"
}) {
  const palette = {
    cloud: { text: "text-brand_cloud", bar: "bg-brand_cloud" },
    lime: { text: "text-brand_lime", bar: "bg-brand_lime" },
    yellow: { text: "text-brand_yellow", bar: "bg-brand_yellow" },
  }[color]
  return (
    <div className="relative rounded-[22px] px-4 py-5 backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-gradient-to-b from-white/5 to-white/5 border border-white/10 hover:border-white/20">
      <div
        className={`w-9 h-9 rounded-[10px] grid place-items-center mb-3.5 bg-white/10 ${palette.text} [&>svg]:w-[18px] [&>svg]:h-[18px]`}
      >
        {icon}
      </div>
      <div className="font-satoBold font-extrabold text-[52px] tracking-tight leading-[.95] flex items-baseline gap-0.5 text-white">
        {value}
      </div>
      <div className="text-white/75 text-[13px] leading-snug mt-2.5 font-medium max-w-[170px]">
        {label}
      </div>
      <div className="h-1 bg-white/10 rounded-full mt-4 overflow-hidden stats-belt-bar">
        <span
          className={`block h-full rounded-full ${palette.bar}`}
          style={{ width: barWidth }}
        />
      </div>
      <div className="mt-2 text-[11px] text-white/40 tracking-wider">{sub}</div>
    </div>
  )
}
