import { twMerge } from "tailwind-merge"

const messages = [
  {
    from: "user",
    text: "Hola, quiero agendar un corte para mañana",
  },
  {
    from: "ai",
    text: "¡Hola! Claro, tenemos disponibilidad mañana a las 10:00, 12:30 y 4:00pm. ¿Cuál prefieres?",
  },
  {
    from: "user",
    text: "A las 12:30 por favor",
  },
  {
    from: "ai",
    text: "Listo, tu cita de Corte + Barba queda confirmada para mañana a las 12:30pm. Te envié un recordatorio por WhatsApp.",
  },
]

export const AiChatIllustration = ({
  className,
}: {
  className?: string
}) => (
  <div
    className={twMerge(
      "flex flex-col gap-3 max-w-xs ml-auto",
      className
    )}
  >
    {messages.map((msg, i) => (
      <div
        key={i}
        className={twMerge(
          "flex",
          msg.from === "user" ? "justify-end" : "justify-start"
        )}
      >
        {msg.from === "ai" && (
          <img src="/images/avatar.svg" alt="Nik" className="w-6 h-6 rounded-full shrink-0 mr-2 mt-1 -scale-x-100" />
        )}
        <div
          className={twMerge(
            "rounded-2xl px-3 py-2 max-w-[75%] text-[11px] leading-relaxed",
            msg.from === "user"
              ? "bg-brand_blue text-white rounded-br-sm text-right"
              : "bg-white/10 text-white/80 rounded-bl-sm text-left"
          )}
        >
          {msg.text}
        </div>
        {msg.from === "user" && (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2 mt-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white" fillOpacity="0.7">
              <circle cx="8" cy="5" r="3" />
              <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            </svg>
          </div>
        )}
      </div>
    ))}
  </div>
)
