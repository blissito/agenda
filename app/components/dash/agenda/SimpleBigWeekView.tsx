// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { completeWeek } from "./agendaUtils";
import { type Event } from "@prisma/client";
import { cn } from "~/utils/cn";
import { useClickOutside } from "~/utils/hooks/useClickOutside";
import { Form, useFetcher } from "react-router";
import { useMexDate } from "~/utils/hooks/useMexDate";
import { useOutsideClick } from "~/components/hooks/useOutsideClick";
import { FaTrash } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FiEdit } from "react-icons/fi";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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
  onEventMove,
}: {
  onNewEvent?: (arg0: Date) => void;
  onEventClick?: (arg0: Event) => void;
  onEventMove?: (eventId: string, newStart: Date) => void;
  date?: Date;
  events: Event[];
}) {
  const week = completeWeek(date);
  const [activeId, setActiveId] = useState<string | null>(null);
  const fetcher = useFetcher();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts (prevents conflict with click)
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return; // Dropped outside droppable area

    // Parse the event ID and target cell
    const eventId = active.id.toString().replace("event-", "");
    const [_, dayIndexStr, hourStr] = over.id.toString().split("-");
    const dayIndex = parseInt(dayIndexStr);
    const hour = parseInt(hourStr);

    // Calculate new start date
    const targetDay = week[dayIndex];
    const newStart = new Date(targetDay);
    newStart.setHours(hour, 0, 0, 0);

    // Find the event being moved
    const movedEvent = events.find((e) => e.id === eventId);
    if (!movedEvent) return;

    // Check if dropped in same position
    const currentStart = new Date(movedEvent.start);
    if (
      currentStart.getDate() === newStart.getDate() &&
      currentStart.getHours() === newStart.getHours()
    ) {
      return; // No change
    }

    // Validation: Check for overlapping events
    const durationInHours = movedEvent.duration / 60;
    const targetEndHour = hour + durationInHours;

    const hasOverlap = events.some((existingEvent) => {
      if (existingEvent.id === eventId) return false; // Skip the event being moved

      const existingStart = new Date(existingEvent.start);
      const existingHour = existingStart.getHours();
      const existingDuration = existingEvent.duration / 60;
      const existingEndHour = existingHour + existingDuration;

      // Check if on same day
      if (
        existingStart.getDate() !== newStart.getDate() ||
        existingStart.getMonth() !== newStart.getMonth()
      ) {
        return false;
      }

      // Check time overlap
      return (
        (hour >= existingHour && hour < existingEndHour) ||
        (targetEndHour > existingHour && targetEndHour <= existingEndHour) ||
        (hour <= existingHour && targetEndHour >= existingEndHour)
      );
    });

    if (hasOverlap) {
      console.warn("Cannot move event: time slot is occupied");
      // TODO: Show toast notification to user
      return;
    }

    // Optimistic update: update local state immediately before server responds
    onEventMove?.(eventId, newStart);

    // Update event on server
    const formData = new FormData();
    formData.append("intent", "move_event");
    formData.append("eventId", eventId);
    formData.append("newStart", newStart.toISOString());

    fetcher.submit(formData, { method: "POST" });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Find active event for DragOverlay
  const activeEvent = activeId
    ? events.find((e) => `event-${e.id}` === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
          {week.map((dayOfWeek, dayIndex) => (
            <Column
              dayIndex={dayIndex}
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
      <DragOverlay>
        {activeEvent ? <EventOverlay event={activeEvent} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

const Cell = ({
  date,
  hours,
  children,
  onClick,
  className,
  dayIndex,
}: {
  className?: string;
  data?: Date;
  onClick?: () => void;
  hours?: number;
  children?: ReactNode;
  dayIndex?: number;
}) => {
  const isToday = () =>
    getComparableTime(date) === getComparableTime(new Date());

  const isThisHour = () => {
    if (!isToday()) return false;
    return hours === new Date().getHours();
  };

  // Make cell droppable (only if dayIndex is provided - i.e., not TimeColumn)
  const { setNodeRef, isOver } = useDroppable({
    id: dayIndex !== undefined ? `cell-${dayIndex}-${hours}` : `time-${hours}`,
    disabled: dayIndex === undefined, // Disable for TimeColumn cells
  });

  return (
    <div
      ref={setNodeRef}
      tabIndex={0}
      onKeyDown={(e) => e.code === "Space" && onClick?.()}
      onClick={onClick}
      role="button"
      className={cn(
        "bg-slate-50 w-full h-16 border-gray-300 border-[.5px] border-dashed text-brand_gray flex justify-center items-start relative cursor-pointer",
        {
          "border-t-2 border-t-brand_blue": isToday() && isThisHour(),
          "bg-brand_blue/20": isOver && dayIndex !== undefined, // Visual feedback when dragging over
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
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
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

const Column = ({
  onEventClick,
  events = [],
  dayOfWeek,
  onNewEvent,
  dayIndex,
}: {
  onEventClick?: (event: Event) => void;
  onNewEvent?: (arg0: Date) => void;
  dayOfWeek?: Date;
  events: Event[];
  dayIndex: number;
}) => {
  const columnRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current hour on mount (only for today's column)
  useEffect(() => {
    if (!dayOfWeek || !columnRef.current) return;

    const today = new Date();
    const isColumnToday =
      dayOfWeek.getDate() === today.getDate() &&
      dayOfWeek.getMonth() === today.getMonth() &&
      dayOfWeek.getFullYear() === today.getFullYear();

    if (!isColumnToday) return;

    const currentHour = today.getHours();
    // Find the cell for current hour
    const currentCell = columnRef.current.children[currentHour] as HTMLElement;

    if (currentCell) {
      // Scroll with some offset so the current hour is visible but not at the top
      setTimeout(() => {
        currentCell.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [dayOfWeek]);
  const findEvent = (hours: number, events: Event[]) => {
    // Find event that STARTS at this hour
    const eventStartsHere = events.find(
      (event) => new Date(event.start).getHours() === hours
    );

    if (eventStartsHere) {
      return (
        <DraggableEvent
          onClick={() => onEventClick?.(eventStartsHere)}
          event={eventStartsHere}
        />
      );
    }

    // Check if any event SPANS this hour (multi-hour events)
    const eventSpansHere = events.find((event) => {
      const eventStart = new Date(event.start);
      const startHour = eventStart.getHours();
      const durationInHours = event.duration / 60;
      const endHour = startHour + durationInHours;

      // This hour is within the event's duration (but event doesn't start here)
      return hours > startHour && hours < endHour;
    });

    // If a multi-hour event spans this cell, don't show EmptyButton
    if (eventSpansHere) {
      return null; // Cell is occupied but we don't render the event again
    }

    // Cell is empty, show EmptyButton
    return <EmptyButton hours={hours} date={dayOfWeek} onNewEvent={onNewEvent} />;
  };

  return (
    <div ref={columnRef} className="grid">
      {[
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ].map((hours) => (
        <Cell
          hours={hours}
          key={hours}
          date={dayOfWeek}
          className="relative"
          dayIndex={dayIndex}
        >
          {findEvent(hours, events)}
        </Cell>
      ))}
    </div>
  );
};

const TimeColumn = () => {
  return (
    <div className="grid">
      <Cell>00:00</Cell>
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
    </div>
  );
};

const DraggableEvent = ({
  event,
  onClick,
}: {
  onClick?: (arg0: Event) => void;
  event: Event;
}) => {
  const [showOptions, setShowOptions] = useState(false);

  // Make event draggable (but not BLOCK events)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event-${event.id}`,
      disabled: event.type === "BLOCK", // Blocks can't be dragged
    });

  const style = {
    height: (event.duration / 60) * 60, // Calculate height based on duration
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  const handleBlockClick = () => {
    setShowOptions(true);
  };

  return (
    <>
      <button
        ref={setNodeRef}
        style={style}
        onClick={
          event.type == "BLOCK" ? handleBlockClick : () => onClick?.(event)
        }
        {...listeners}
        {...attributes}
        className={cn(
          "border",
          "grid gap-y-1 overflow-hidden place-content-start",
          "text-xs text-left pl-1 absolute top-0 left-0 bg-brand_blue text-white rounded-md z-10 w-[90%]",
          {
            "bg-gray-300 h-full w-full text-center cursor-not-allowed relative p-0":
              event.type === "BLOCK",
            "cursor-grab": event.type !== "BLOCK",
            "cursor-grabbing opacity-50": isDragging && event.type !== "BLOCK",
          }
        )}
      >
        {event.type === "BLOCK" && (
          <div className="absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" />
        )}
        <span>{event.title}</span>
        <span className="text-gray-300">{event.service?.name}</span>
      </button>
      <Options
        event={event}
        onClose={() => setShowOptions(false)}
        isOpen={showOptions}
      />
    </>
  );
};

// EventOverlay component for DragOverlay
const EventOverlay = ({ event }: { event: Event }) => {
  return (
    <div
      className={cn(
        "border",
        "grid gap-y-1 overflow-hidden place-content-start",
        "text-xs text-left pl-1 bg-brand_blue text-white rounded-md w-[200px] opacity-90 shadow-lg",
        {
          "bg-gray-300": event.type === "BLOCK",
        }
      )}
      style={{
        height: (event.duration / 60) * 60,
      }}
    >
      {event.type === "BLOCK" && (
        <div className="absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" />
      )}
      <span>{event.title}</span>
      <span className="text-gray-300">{event.service?.name}</span>
    </div>
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
