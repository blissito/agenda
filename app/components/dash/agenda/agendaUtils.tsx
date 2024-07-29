import { HourOrDay } from "~/components/hooks/useCoordinates";
import { type Cell } from "./calendarGrid";

export interface Day {
  day: string;
  date: Date;
  meta?: any;
}

export type BasicBoxType = {
  x?: number;
  y?: number;
  id?: number;
  date: Date | string | number;
  title?: string;
  text?: string;
};

export const defaultDays: Day[] = [
  {
    day: "lunes",
    date: new Date(),
  },
  {
    day: "martes",
    date: new Date(),
  },
  {
    day: "miércoles",
    date: new Date(),
  },
  {
    day: "jueves",
    date: new Date(),
  },
  {
    day: "viernes",
    date: new Date(),
  },
  {
    day: "sábado",
    date: new Date(),
  },
  {
    day: "domingo",
    date: new Date(),
  },
];

export const toNumber = (string: string) => Number(string.replace(":00", ""));

export const generateHours = ({
  fromHour,
  toHour,
  justNumbers = false,
}: {
  fromHour: number;
  toHour: number;
  justNumbers?: boolean;
}) => {
  return Array.from({ length: toHour - fromHour }).map((_, index) =>
    fromHour + index < 10 ? `0${fromHour + index}:00` : `${fromHour + index}:00`
  );
};

export const getMonday = (today: Date = new Date()) => {
  const day = today.getDay();
  const diff = today.getDate() - day + (day == 1 ? -6 : 1); // the magic 🪄
  return new Date(today.setDate(diff));
};

export const generateWeek = (
  monday: Date = getMonday(),
  numberOfDays: 5 | 7 = 5
): Day[] => {
  const days = [...defaultDays];

  const fillWeek = () => {
    Array.from({ length: numberOfDays }).forEach((_, index) => {
      const m = new Date(monday);
      days[index].date = new Date(m.setDate(m.getDate() + index));
    });
  };
  // 1. encuentra el día de hoy
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayIndex = dayOfWeek - 1; // day is 0 when sunday, we want
  days[todayIndex].meta = { foo: "bar" }; // just to remember we have meta
  // 2. qué día de la semana es? No importa. Se encuentra el lunes y se rellena solo hacia adelante
  fillWeek();
  return [...days];
};

export const addDaysToDate = (days: number, date: Date) =>
  date.getDate() + days;

export const getCoord = ({
  coord = "x",
  index,
  colsLength,
}: {
  coord?: "x" | "y";
  index: number;
  colsLength: number;
}) =>
  coord.toLocaleLowerCase() === "y"
    ? Math.floor(index / colsLength)
    : Math.floor(index % colsLength);

export const generateWeekGrid = ({
  factor,
  week,
  hours,
  days,
}: {
  days: string[];
  factor: number;
  week: Day[];
  hours: HourOrDay[];
}) => {
  return [...Array(hours.length * factor * days.length).keys()].map((index) => {
    const y = Math.floor(index / days.length); // auto? D:
    const x = Math.floor(index % days.length);
    const hoursY = Math.floor(index / days.length / factor);
    const mins = (y % factor) * 15;
    return {
      index,
      y,
      x,
      day: days[x],
      dateNumber: new Date(week[x].date).getDate(),
      startDate: new Date(
        new Date(week[x].date).getFullYear(),
        new Date(week[x].date).getMonth(),
        new Date(week[x].date).getDate(),
        new Date(week[x].date).getHours(),
        mins
      ),
      hour: Number(hours[hoursY]?.replace(":00", "")), // improve
      mins: mins === 0 ? "00" : mins,
      month: new Date(week[x].date).getMonth(),
      year: new Date(week[x].date).getFullYear(),
      rect: null,
      endDate: new Date(
        new Date(week[x].date).getFullYear(),
        new Date(week[x].date).getMonth(),
        new Date(week[x].date).getDate(),
        new Date(week[x].date).getHours(),
        mins
      ),
    };
  });
};

/**
 *
 * @param date // Date
 * @returns date[]
 * @todo enero no funciona
 */
export const getDaysInMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const leftOffset = firstDay.getDay();
  firstDay.setDate(firstDay.getDate() - leftOffset); // first week offset
  const days = [];
  while (firstDay.getMonth() < date.getMonth() + 1) {
    days.push(new Date(firstDay));
    firstDay.setDate(firstDay.getDate() + 1);
  }
  // extra days:
  const lastDay = new Date(days[days.length - 1]);
  const numberOfMissing = 6 - lastDay.getDay();
  let count = 0;
  while (count < numberOfMissing) {
    count++;
    lastDay.setDate(lastDay.getDate() + 1);
    days.push(new Date(lastDay));
  }
  return days;
};

export const isToday = (_date: Date) => {
  // comparing without time
  return (
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    ).toString() ===
    new Date(_date.getFullYear(), _date.getMonth(), _date.getDate()).toString()
  );
};

export const areSameDates = (d1: Date, d2: Date) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return date1.getTime() === date2.getTime();
};
