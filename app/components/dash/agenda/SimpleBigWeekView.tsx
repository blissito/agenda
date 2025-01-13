import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { completeWeek } from "./agendaUtils";
import { type Event } from "@prisma/client";
import { motion } from "framer-motion";
import { cn } from "~/utils/cn";
import { useClickOutside } from "~/utils/hooks/useClickOutside";
import { Form } from "react-router";
import { useMexDate } from "~/utils/hooks/useMexDate";
import { useOutsideClick } from "~/components/hooks/useOutsideClick";
import { FaTrash } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FiEdit } from "react-icons/fi";

export const noop = () => false;

export const getComparableTime = (date: Date) => {
  date = new Date(date);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
};

export const isToday = (date: Date) => {
  date = new Date(date);
  const hoy = new Date();
  const one = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const two = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return one.getTime() === two.getTime();
};

const DayHeader = ({ date }: { date: Date }) => {
  date = new Date(date);

  return (
    <p className="grid place-items-center">
      <span className="capitalize">
        {date.toLocaleDateString("es-MX", {
          weekday: "short",
        })}
      </span>
      <span
        className={cn({
          "bg-brand_blue rounded-full p-1 text-white": isToday(date),
        })}
      >
        {date.getDate()}
      </span>
    </p>
  );
};

export function SimpleBigWeekView({
  date = new Date(),
  events = [],
  onEventClick,
  onNewEvent,
}: {
  onNewEvent?: (arg0: Date) => void;
  onEventClick?: (arg0: Event) => void;
  date?: Date;
  events: Date[];
}) {
  const week = completeWeek(date);

  return (
    <article className="w-full bg-white shadow rounded-xl">
      <section className="grid grid-cols-8 place-items-center py-4">
        <p>
          <span>GTM-6</span>
          <span></span>
        </p>
        <DayHeader date={week[0]} />
        <DayHeader date={week[1]} />
        <DayHeader date={week[2]} />
        <DayHeader date={week[3]} />
        <DayHeader date={week[4]} />
        <DayHeader date={week[5]} />
        <DayHeader date={week[6]} />
      </section>
      <section className="grid grid-cols-8 max-h-[80vh] overflow-y-auto">
        <TimeColumn />
        {week.map((dayOfWeek) => (
          <Column
            onNewEvent={onNewEvent}
            dayOfWeek={dayOfWeek}
            onEventClick={onEventClick}
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

const Cell = ({
  date,
  hours,
  children,
  onClick,
  className,
}: {
  className?: string;
  data?: Date;
  onClick?: () => void;
  hours?: number;
  children?: ReactNode;
}) => {
  const isToday = () =>
    getComparableTime(date) === getComparableTime(new Date());

  const isThisHour = () => {
    if (!isToday()) return false;
    return hours === new Date().getHours();
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => e.code === "Space" && onClick?.()}
      onClick={onClick}
      role="button"
      className={cn(
        "bg-slate-50 w-full h-16 border-gray-300 border-[.5px] border-dashed text-brand_gray flex justify-center items-start relative cursor-pointer",
        {
          "border-t-2 border-t-brand_blue": isToday() && isThisHour(),
        },
        className
      )}
    >
      {children || hours}
    </div>
  );
};

const EmptyButton = ({
  hours,
  date,
  onNewEvent,
}: {
  onNewEvent?: (arg0: Date) => void;
  onClick?: () => void;
  hours: number;
  date: Date;
}) => {
  const d = new Date(date);
  d.setHours(hours);
  const [show, setShow] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const outsideRef = useClickOutside<HTMLButtonElement>({
    isActive: show,
    onOutsideClick: () => setShow(false),
  });
  const [rect, setRect] = useState({});

  useEffect(() => {
    if (!buttonRef.current) return;
    const r = buttonRef.current?.getBoundingClientRect();
    setRect(r);
  }, [buttonRef]);

  const handleClick = () => {
    setRect((buttonRef.current as HTMLButtonElement).getBoundingClientRect());
    setShow(true);
  };

  const handleReserva = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onNewEvent?.(d);
    setShow(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        ref={buttonRef}
        className="w-full h-full text-xs hover:bg-brand_blue/10 relative"
        onClick={handleClick}
      >
        {show && (
          <div
            ref={outsideRef}
            style={{
              height: rect.height + 24,
            }}
            className="absolute border bg-white rounded-lg grid p-1 bottom-[-100%] left-0 z-20"
          >
            <button
              onClick={handleReserva}
              className="hover:bg-brand_blue/10 px-4 py-2 rounded-lg"
            >
              Reservar
            </button>
            <Form method="POST" action="/dash/agenda">
              <input
                type="hidden"
                name="start"
                value={new Date(d).toISOString()}
              />
              <button
                onClick={() => setTimeout(() => setShow(false), 1000)}
                name="intent"
                value="add_block"
                type="submit"
                className="hover:bg-brand_blue/10 px-4 py-2 rounded-lg"
              >
                Bloquear
              </button>
            </Form>
          </div>
        )}
      </div>
    </>
  );
};

// @TODO: scroll intoview
const Column = ({
  events = [],
  dayOfWeek,
  onNewEvent,
}: {
  onNewEvent?: (arg0: Date) => void;
  dayOfWeek?: Date;
  events: Event[];
}) => {
  const findEvent = (hours, events) => {
    const event = events.find(
      (event) => new Date(event.start).getHours() === hours
    );

    return event ? (
      <Event event={event} />
    ) : (
      <EmptyButton hours={hours} date={dayOfWeek} onNewEvent={onNewEvent} />
    );
  };

  return (
    <div className="grid">
      {[
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 0,
      ].map((hours) => (
        <Cell hours={hours} key={hours} date={dayOfWeek} className="relative">
          {findEvent(hours, events)}
        </Cell>
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

const Event = ({
  event,
  onClick,
}: {
  onClick?: (arg0: Event) => void;
  event: Event;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleBlockClick = () => {
    setShowOptions(true);
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={
          event.type == "BLOCK" ? handleBlockClick : () => onClick?.(event)
        }
        dragSnapToOrigin
        drag
        className={cn(
          "grid gap-y-1 overflow-hidden",
          "text-xs text-left pl-1 absolute top-0 left-0 bg-brand_blue text-white rounded-md z-10 w-[90%]",
          event.duration < 31 ? "h-8" : "h-14",
          new Date(event.start).getMinutes() > 29 && "top-8 h-8",
          "active:cursor-grabbing",
          {
            "bg-gray-300 h-full w-full text-center cursor-not-allowed relative p-0":
              event.type === "BLOCK",
          }
        )}
      >
        {event.type === "BLOCK" && (
          <div className="absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" />
        )}
        <span>{event.title}</span>
        <span className="text-gray-300">{event.service?.name}</span>
      </motion.button>
      <Options
        event={event}
        onClose={() => setShowOptions(false)}
        isOpen={showOptions}
      />
    </>
  );
};

export const Options = ({
  event,
  onClose = noop,
  isOpen,
}: {
  event: Event;
  onClose?: () => void;
  isOpen?: boolean;
}) => {
  const mainRef = useOutsideClick({
    isActive: isOpen,
    onClickOutside: onClose,
  });

  const eventDate = useMexDate(event.start);
  return isOpen ? (
    <div
      ref={mainRef}
      style={{ top: "-100%", left: "-350%" }}
      className={cn(
        "text-left z-20 bg-white",
        "absolute border rounded-lg grid p-3 w-[264px]"
      )}
    >
      <header>
        <h3>Horario bloqueado</h3>
        <p className="text-xs text-brand_gray">{eventDate}</p>
      </header>
      <Form
        method="POST"
        action="/dash/agenda"
        className="absolute flex left-0 right-0 justify-end gap-3 px-2 py-2 overflow-hidden"
      >
        <input type="hidden" name="eventId" value={event.id} />
        <div className="border-l-2 border-b-2 rounded-full absolute pointer-events-none left-[65%] right-0 h-10 -top-2" />
        <button
          onClick={() => setTimeout(onClose, 1000)}
          name="intent"
          value="remove_block"
          type="submit"
          className="hover:bg-brand_blue/10 rounded-lg active:text-black"
        >
          <FaTrash />
        </button>
        <button
          onClick={() => setTimeout(onClose, 1000)}
          name="intent"
          value="edit_block"
          type="button"
          className="hover:bg-brand_blue/10 rounded-lg"
        >
          <FiEdit />
        </button>
        <button
          onClick={onClose}
          name="intent"
          value="remove_block"
          type="button"
          className="hover:bg-brand_blue/10 rounded-lg"
        >
          <RxCross2 />
        </button>
      </Form>
    </div>
  ) : null;
};
