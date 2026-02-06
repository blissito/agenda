import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5"

export function WeekSelector({
  onClick,
  week,
}: {
  week: Date[]
  onClick?: (arg0: -1 | 1) => void
}) {
  const monthString = week[week.length - 1].toLocaleString("es-MX", {
    month: "long",
  })
  return (
    <nav className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onClick?.(-1)}
          className="hover:bg-gray-100 rounded-full p-1"
        >
          <IoChevronBackOutline />
        </button>
        <button
          onClick={() => onClick?.(1)}
          className="hover:bg-gray-100 rounded-full p-1"
        >
          <IoChevronForward />
        </button>
      </div>
      <h3 className="text-base text-brand_gray font-satoMiddle">
        {week[0].getDate()} - {week[week.length - 1].getDate()} de {monthString}
      </h3>
    </nav>
  )
}
