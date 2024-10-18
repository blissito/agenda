import { ReactNode } from "react";
import { completeWeek } from "./agendaUtils";
import { Event } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export function SimpleBigWeekView({
  date = new Date(),
  events = [],
}: {
  date?: Date;
  events: Date[];
}) {
  //   const today = new Date();
  const week = completeWeek(date);

  return (
    <article className="w-full bg-white shadow rounded-xl">
      <section className="grid grid-cols-8 place-items-center py-4">
        <p>
          <span>GTM-6</span>
          <span></span>
        </p>
        <p className="grid place-items-center">
          <span>Lun</span>
          <span>{week[0].getDate()}</span>
        </p>
        <p className="grid place-items-center">
          Mar
          <span>{week[1].getDate()}</span>
        </p>
        <p className="grid place-items-center">
          Miér
          <span>{week[2].getDate()}</span>
        </p>
        <p className="grid place-items-center">
          Jue
          <span>{week[3].getDate()}</span>
        </p>
        <p className="grid place-items-center">
          Vie
          <span>{week[4].getDate()}</span>
        </p>
        <p className="grid place-items-center">
          Sáb
          <span>{week[5].getDate()}</span>
        </p>
        <p className="grid place-items-center">
          Dom
          <span>{week[6].getDate()}</span>
        </p>
      </section>
      <section className="grid grid-cols-8 max-h-[80vh] overflow-y-auto">
        <TimeColumn />
        {week.map((dayOfWeek) => (
          <Column
            key={dayOfWeek.toISOString()}
            events={events.filter((event) => {
              const date = new Date(event.start);
              return (
                date.getDate() + date.getMonth() ===
                dayOfWeek.getDate() + dayOfWeek.getMonth()
              );
            })}
          />
        ))}
      </section>
    </article>
  );
}

const Cell = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="bg-slate-50 w-full h-16 border-gray-300 border-[.5px] border-dashed text-brand_gray flex justify-center items-start relative cursor-pointer">
      {children}
    </div>
  );
};
// @TODO: scroll intoview
const Column = ({ events = [] }: { events: Event[] }) => {
  const findEvent = (hours, events) => {
    const event = events.find(
      (event) => new Date(event.start).getHours() === hours
    );
    return event ? (
      <motion.span
        dragSnapToOrigin
        drag
        className={twMerge(
          "text-xs absolute top-0 left-0 bg-brand_blue text-white rounded-md z-10 w-[80%]",
          new Date(event.start).getMinutes() > 29 && "top-8"
        )}
      >
        {event.title}
      </motion.span>
    ) : null;
  };

  return (
    <div className="grid">
      {[
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 0,
      ].map((hours) => (
        <Cell key={hours}>{findEvent(hours, events)}</Cell>
      ))}
    </div>
  );
};

const TimeColumn = () => {
  return (
    <div className="grid">
      <Cell>01:00</Cell>
      <Cell>02:00</Cell>
      <Cell>03:00</Cell>
      <Cell>04:00</Cell>
      <Cell>05:00</Cell>
      <Cell>06:00</Cell>
      <Cell>07:00</Cell>
      <Cell>08:00</Cell>
      <Cell>09:00</Cell>
      <Cell>10:00</Cell>
      <Cell>11:00</Cell>
      <Cell>12:00</Cell>
      <Cell>13:00</Cell>
      <Cell>14:00</Cell>
      <Cell>15:00</Cell>
      <Cell>16:00</Cell>
      <Cell>17:00</Cell>
      <Cell>18:00</Cell>
      <Cell>19:00</Cell>
      <Cell>20:00</Cell>
      <Cell>21:00</Cell>
      <Cell>22:00</Cell>
      <Cell>23:00</Cell>
      <Cell>00:00</Cell>
    </div>
  );
};
