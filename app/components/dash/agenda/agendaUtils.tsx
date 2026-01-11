// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import type { HourOrDay } from "~/components/hooks/useCoordinates";

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
export const fromMinsToLocaleTimeString = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const today = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    h,
    m,
    0
  );
  return today.toLocaleTimeString("es-MX");
};
export const fromMinsToTimeString = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:00`; // @TODO: real secs
};
export const generateHours = ({
  fromHour,
  toHour,
}: {
  fromHour: number | string;
  toHour: number | string;
  justNumbers?: boolean;
}) => {
  // fh = Number(fromHour);
  // th = Number(toHour)
  return Array.from({ length: toHour - fromHour }).map((_, index) =>
    fromHour + index < 10 ? `0${fromHour + index}:00` : `${fromHour + index}:00`
  );
};

export const generateSecuense = (
  fromMins: number,
  toMins: number,
  mins: number,
  min: number = 0
) => {
  let count = fromMins;
  const slots = [];
  while (count < toMins) {
    if (count > min) slots.push(count);
    count += mins;
  }
  return slots;
};

export const getMonday = (today: Date = new Date()) => {
  const day = today.getDay();
  const diff = today.getDate() - day + (day == 1 ? -6 : 1); // the magic 🪄
  return new Date(today.setDate(diff));
};

export const completeWeek = (date: Date) => {
  const startDate = new Date(date);
  const day = new Date(startDate).getDay();
  const offset = -day + 1; // looking for monday 🤓
  startDate.setDate(startDate.getDate() + offset);
  return [0, 1, 1, 1, 1, 1, 1].map((n) => {
    startDate.setDate(startDate.getDate() + n);
    return new Date(startDate);
  });
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

export const addMinutesToDate = (date: Date, mins?: number) => {
  if (!date || !mins) return;
  const d = new Date(date);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes() + mins
  );
};

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
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const numberOfMissing = 6 - lastDay.getDay();
  const leftOffset = firstDay.getDay();
  // initial offset
  firstDay.setDate(firstDay.getDate() - leftOffset); // first week offset
  // defining array and first day
  const days = [];
  days.push(new Date(firstDay)); // first day
  // loops
  while (firstDay < lastDay) {
    firstDay.setDate(firstDay.getDate() + 1);
    days.push(new Date(firstDay));
  }
  for (let i = 0; i < numberOfMissing; i++) {
    firstDay.setDate(firstDay.getDate() + 1);
    days.push(new Date(firstDay));
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

export const areSameDates = (d1: Date, d2: Date | null) => {
  if (!d1 || !d2 || d1 instanceof Date || d2 instanceof Date) return false;
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return date1.getTime() === date2.getTime();
};

export const fromDateToTimeString = (date: Date, locale: "es-MX" = "es-MX") => {
  return new Date(date).toLocaleTimeString();
};

export const from12To24 = (string: string) => {
  const meridiem = string.split(" ")[1];
  const h = Number(string.split(":")[0]);
  const m = Number(string.split(":")[1]);
  return meridiem === "p.m."
    ? `${(h === 12 ? 0 : h) + 12}:${m < 10 ? "0" + m : m}`
    : `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}`;
};

const days = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

export const convertDayToString = (number: number) => {
  return days[number];
};
