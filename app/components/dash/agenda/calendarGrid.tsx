import { twMerge } from "tailwind-merge";
import { defaultDays } from "./agendaUtils";
import { useState } from "react";

export interface Day {
  day: string;
  date: Date;
  meta?: any;
}

export const CalendarGrid = ({
  week = [...defaultDays],
  days = ["lunes", "martes", "miércoles", "jueves", "viernes"],
  hours,
}: {
  hours: string[];
  week: Day[];
  days?: string[];
}) => {
  const checkIfIsToday = (date: Date) =>
    date.getDate() === new Date().getDate() &&
    date.getMonth() === new Date().getMonth();

  return (
    <>
      <div className="bg-white rounded-2xl mt-6 mr-10 pr-6 pb-6 shadow-md ">
        {/* days and date */}
        <div className="flex pl-20">
          {week
            .filter((d) => days.includes(d.day))
            .map(({ day, date }, index) => {
              const isToday = checkIfIsToday(date);

              return (
                <h6
                  key={index}
                  className={twMerge(
                    "w-full text-center grid gap-2 mt-5 mb-3 text-gray-500 "
                  )}
                >
                  <span className={twMerge(isToday && "text-brand_blue")}>
                    {day}
                  </span>
                  <span>{new Date(date).getDate()}</span>
                </h6>
              );
            })}
        </div>

        <article className="flex items-center">
          {/* Times */}
          <section>
            {hours.map((hour, index) => (
              <p key={index} className="h-24 pl-6 pr-3 py-2 text-gray-700">
                <span>{hour}</span>
              </p>
            ))}
          </section>
          {/* Rowns drawer */}
          <section className="flex-1 relative">
            <Indicator week={week} hours={hours} length={days.length} />
            {hours.map((_, index) => (
              <Row length={days.length} key={index} isFirst={index === 0} />
            ))}
          </section>
        </article>
      </div>
    </>
  );
};

export const Indicator = ({
  week = [],
  length = 6,
  colIndex,
  hours,
}: {
  hours: string[];
  week?: Day[];
  colIndex?: number;
  rowIndex?: number;
  index?: number;
  length?: number;
}) => {
  const today = new Date(
    new Date().toLocaleString("en", { timeZone: "America/Mexico_City" })
  );

  console.log("TODAY: ", today);

  const hour = today.getHours();
  const minutes = today.getMinutes();

  const getHourIndex = () =>
    hours
      .map((h) => Number(h.replace(":00", "")))
      .findIndex((el) => el == hour);

  const isTodayInWeek = week.some(
    (day) =>
      day.date.getDate() === today.getDate() &&
      day.date.getMonth() === today.getMonth()
  );
  const [dayIndex] = useState(colIndex || today.getDay() - 1);
  const rIndex = getHourIndex();

  return (
    <div
      className={twMerge(
        "absolute w-full top-0 left-0 rounded",
        !isTodayInWeek && "hidden"
      )}
    >
      <div
        style={{
          width: `${100 / length}%`,
          top: 96 * rIndex + minutes,
          left: (100 / length) * dayIndex + "%",
        }}
        className="bg-brand_blue h-[1px] relative"
      >
        <div className="h-2 w-2 rounded-full bg-brand_blue -top-1 left-[-1px] absolute" />
      </div>
    </div>
  );
};

export const Row = ({
  length = 7,

  isFirst,
  ...props
}: {
  length?: number;
  isFirst?: boolean;
  props?: any;
}) => (
  <div {...props} className="flex border-l">
    {Array.from({ length }).map((_, index) => (
      <div
        key={index}
        className={twMerge(
          "w-full h-24 bg-white border border-l-0 border-gray-200 border-t-0",
          isFirst && "border-t"
        )}
      />
    ))}
  </div>
);
