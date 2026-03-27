function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

const AVATAR_COLORS = [
  "bg-brand_cloud",
  "bg-brand_yellow",
  "bg-brand_orange",
  "bg-brand_lime",
  "bg-brand_purple",
]

export function getAvatarColor(name: string) {
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export const AppointmentItem = ({
  img,
  service,
  client,
  date,
  time,
}: {
  img?: string
  service: string
  client: string
  date: string
  time?: string
}) => {
  const initials = getInitials(client)

  return (
    <section className="flex items-center gap-2 py-4 border-b border-brand_stroke justify-between hover:scale-95 transition-all">
      <div className="flex gap-2 items-center">
        {img ? (
          <img className="h-10 w-10 rounded-full object-cover" src={img} />
        ) : (
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 ${getAvatarColor(client)}`}
          >
            {initials || "?"}
          </div>
        )}
        <div>
          <h3 className="text-brand_dark text-sm">{service}</h3>
          <p className="text-xs text-brand_gray">
            {client} · {date}
          </p>
        </div>
      </div>
      {time && (
        <span className="text-brand_iron text-xs text-left">{time}</span>
      )}
    </section>
  )
}
