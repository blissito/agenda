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
    <nav className="flex mb-6 ">
      <h3 className="text-base text-brand_gray font-satoMiddle">
        {/* {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} */}
        {week[0].getDate()} - {week[week.length - 1].getDate()} de {monthString}
      </h3>
      <button
        // disabled={isCurrentMonth()}
        onClick={() => onClick?.(-1)}
        className="disabled:text-gray-500 ml-2"
      >
        <IoChevronBackOutline />
      </button>

      <button
        // disabled={maxDate && currentDate > maxDate}
        className="disabled:text-gray-500 ml-2"
        onClick={() => onClick?.(1)}
      >
        <IoChevronForward />
      </button>
    </nav>
  )
}
