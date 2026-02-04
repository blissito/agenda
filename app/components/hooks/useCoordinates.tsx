import { createContext, useContext } from "react"

export type HourOrDay = {
  number: number
  string: string
}

type WeekDay = {
  date: Date
}

type GridContextType = {
  hours: HourOrDay[]
  days: HourOrDay[]
  week: WeekDay[]
}

export const GridContext = createContext<GridContextType>({
  hours: [],
  days: [],
  week: [],
})

export const useCoordinates = ({
  date,
}: {
  date: Date
}): { x: number; y: number; isVisible: boolean } => {
  const { hours, days, week } = useContext(GridContext)
  const monthWeek = new Date(date).getMonth()
  const dateMonth = week[4] ? new Date(week[4].date).getMonth() : -1
  const day = new Date(date).getDate()
  const hour = new Date(date).getHours() === 0 ? 24 : new Date(date).getHours()
  const y = hours.findIndex((h) => h.number === hour) + 1
  const x = days.findIndex((d) => d.number === day) + 1

  const isVisible = monthWeek === dateMonth && y > 0 && x > 0

  return {
    isVisible,
    x,
    y,
  }
}
