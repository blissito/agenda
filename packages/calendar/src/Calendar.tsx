import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
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
import type { CalendarEvent, CalendarProps, CalendarConfig, ColumnHeaderProps } from "./types";
import { useCalendarEvents } from "./useCalendarEvents";
import { useClickOutside, formatDate } from "./hooks";
import { completeWeek, isToday as checkIsToday } from "./utils";

// Simple classname utility (inline clsx replacement)
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

// Default SVG Icons
const DefaultTrashIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const DefaultEditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const DefaultCloseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const getComparableTime = (date: Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const DayHeader = ({
  date,
  locale,
  index,
  renderColumnHeader,
}: {
  date: Date;
  locale: string;
  index: number;
  renderColumnHeader?: (props: ColumnHeaderProps) => ReactNode;
}) => {
  const isToday = checkIsToday(date);

  // Custom renderer takes priority
  if (renderColumnHeader) {
    return (
      <div className="grid place-items-center">
        {renderColumnHeader({ date, index, isToday, locale })}
      </div>
    );
  }

  // Default: weekday + date number
  return (
    <p className="grid place-items-center">
      <span className="capitalize">
        {date.toLocaleDateString(locale, { weekday: "short" })}
      </span>
      <span
        className={cn(
          isToday && "bg-blue-500 rounded-full p-1 text-white"
        )}
      >
        {date.getDate()}
      </span>
    </p>
  );
};

export function Calendar({
  date = new Date(),
  events = [],
  onEventClick,
  onNewEvent,
  onEventMove,
  onAddBlock,
  onRemoveBlock,
  config = {},
}: CalendarProps) {
  const { locale = "es-MX", icons = {}, renderColumnHeader } = config;
  const week = completeWeek(date);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { canMove } = useCalendarEvents(events);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const eventId = active.id.toString().replace("event-", "");
    const [, dayIndexStr, hourStr] = over.id.toString().split("-");
    const dayIndex = parseInt(dayIndexStr);
    const hour = parseInt(hourStr);

    const targetDay = week[dayIndex];
    const newStart = new Date(targetDay);
    newStart.setHours(hour, 0, 0, 0);

    const movedEvent = events.find((e) => e.id === eventId);
    if (!movedEvent) return;

    const currentStart = new Date(movedEvent.start);
    if (
      currentStart.getDate() === newStart.getDate() &&
      currentStart.getHours() === newStart.getHours()
    ) {
      return;
    }

    if (!canMove(eventId, newStart)) {
      console.warn("Cannot move event: time slot is occupied");
      return;
    }

    onEventMove?.(eventId, newStart);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

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
            <span className="text-sm text-gray-500">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </p>
          {week.map((day, index) => (
            <DayHeader
              key={day.toISOString()}
              date={day}
              locale={locale}
              index={index}
              renderColumnHeader={renderColumnHeader}
            />
          ))}
        </section>
        <section className="grid grid-cols-8 max-h-[80vh] overflow-y-auto">
          <TimeColumn />
          {week.map((dayOfWeek, dayIndex) => (
            <Column
              key={dayOfWeek.toISOString()}
              dayIndex={dayIndex}
              dayOfWeek={dayOfWeek}
              events={events.filter((event) => {
                const eventDate = new Date(event.start);
                return (
                  eventDate.getDate() === dayOfWeek.getDate() &&
                  eventDate.getMonth() === dayOfWeek.getMonth()
                );
              })}
              onNewEvent={onNewEvent}
              onAddBlock={onAddBlock}
              onRemoveBlock={onRemoveBlock}
              onEventClick={onEventClick}
              locale={locale}
              icons={icons}
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
  date?: Date;
  onClick?: () => void;
  hours?: number;
  children?: ReactNode;
  dayIndex?: number;
}) => {
  const isTodayCell = date ? checkIsToday(date) : false;
  const isThisHour = isTodayCell && hours === new Date().getHours();

  const { setNodeRef, isOver } = useDroppable({
    id: dayIndex !== undefined ? `cell-${dayIndex}-${hours}` : `time-${hours}`,
    disabled: dayIndex === undefined,
  });

  return (
    <div
      ref={setNodeRef}
      tabIndex={0}
      onKeyDown={(e) => e.code === "Space" && onClick?.()}
      onClick={onClick}
      role="button"
      className={cn(
        "bg-slate-50 w-full h-16 border-gray-300 border-[.5px] border-dashed text-gray-500 flex justify-center items-start relative cursor-pointer",
        isTodayCell && isThisHour && "border-t-2 border-t-blue-500",
        isOver && dayIndex !== undefined && "bg-blue-100",
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
  onAddBlock,
}: {
  onNewEvent?: (arg0: Date) => void;
  onAddBlock?: (start: Date) => void;
  hours: number;
  date: Date;
}) => {
  const d = new Date(date);
  d.setHours(hours, 0, 0, 0);

  const [show, setShow] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const outsideRef = useClickOutside<HTMLDivElement>({
    isActive: show,
    onOutsideClick: () => setShow(false),
  });

  const handleReserva = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onNewEvent?.(d);
    setShow(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      ref={buttonRef}
      className="w-full h-full text-xs hover:bg-blue-50 relative"
      onClick={() => setShow(true)}
    >
      {show && (
        <div
          ref={outsideRef}
          className="absolute border bg-white rounded-lg grid p-1 bottom-[-100%] left-0 z-20 shadow-lg"
        >
          <button
            onClick={handleReserva}
            className="hover:bg-blue-50 px-4 py-2 rounded-lg text-left"
          >
            Reserve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddBlock?.(d);
              setShow(false);
            }}
            className="hover:bg-blue-50 px-4 py-2 rounded-lg text-left"
          >
            Block
          </button>
        </div>
      )}
    </div>
  );
};

const Column = ({
  onEventClick,
  events = [],
  dayOfWeek,
  onNewEvent,
  onAddBlock,
  onRemoveBlock,
  dayIndex,
  locale,
  icons,
}: {
  onEventClick?: (event: CalendarEvent) => void;
  onNewEvent?: (arg0: Date) => void;
  onAddBlock?: (start: Date) => void;
  onRemoveBlock?: (eventId: string) => void;
  dayOfWeek: Date;
  events: CalendarEvent[];
  dayIndex: number;
  locale: string;
  icons: CalendarConfig["icons"];
}) => {
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!columnRef.current) return;

    const today = new Date();
    const isColumnToday =
      dayOfWeek.getDate() === today.getDate() &&
      dayOfWeek.getMonth() === today.getMonth() &&
      dayOfWeek.getFullYear() === today.getFullYear();

    if (!isColumnToday) return;

    const currentHour = today.getHours();
    const currentCell = columnRef.current.children[currentHour] as HTMLElement;

    if (currentCell) {
      setTimeout(() => {
        currentCell.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [dayOfWeek]);

  const findEvent = (hours: number) => {
    const eventStartsHere = events.find(
      (event) => new Date(event.start).getHours() === hours
    );

    if (eventStartsHere) {
      return (
        <DraggableEvent
          onClick={() => onEventClick?.(eventStartsHere)}
          event={eventStartsHere}
          onRemoveBlock={onRemoveBlock}
          locale={locale}
          icons={icons}
        />
      );
    }

    const eventSpansHere = events.find((event) => {
      const eventStart = new Date(event.start);
      const startHour = eventStart.getHours();
      const endHour = startHour + event.duration / 60;
      return hours > startHour && hours < endHour;
    });

    if (eventSpansHere) return null;

    return (
      <EmptyButton
        hours={hours}
        date={dayOfWeek}
        onNewEvent={onNewEvent}
        onAddBlock={onAddBlock}
      />
    );
  };

  return (
    <div ref={columnRef} className="grid">
      {Array.from({ length: 24 }, (_, hours) => (
        <Cell
          key={hours}
          hours={hours}
          date={dayOfWeek}
          className="relative"
          dayIndex={dayIndex}
        >
          {findEvent(hours)}
        </Cell>
      ))}
    </div>
  );
};

const TimeColumn = () => (
  <div className="grid">
    {Array.from({ length: 24 }, (_, i) => (
      <Cell key={i}>{`${i < 10 ? "0" : ""}${i}:00`}</Cell>
    ))}
  </div>
);

const DraggableEvent = ({
  event,
  onClick,
  onRemoveBlock,
  locale,
  icons,
}: {
  onClick?: (arg0: CalendarEvent) => void;
  onRemoveBlock?: (eventId: string) => void;
  event: CalendarEvent;
  locale: string;
  icons?: CalendarConfig["icons"];
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event-${event.id}`,
      disabled: event.type === "BLOCK",
    });

  const style = {
    height: (event.duration / 60) * 64,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  return (
    <>
      <button
        ref={setNodeRef}
        style={style}
        onClick={
          event.type === "BLOCK"
            ? () => setShowOptions(true)
            : () => onClick?.(event)
        }
        {...listeners}
        {...attributes}
        className={cn(
          "border grid gap-y-1 overflow-hidden place-content-start",
          "text-xs text-left pl-1 absolute top-0 left-0 bg-blue-500 text-white rounded-md z-10 w-[90%]",
          event.type === "BLOCK" &&
            "bg-gray-300 h-full w-full text-center cursor-not-allowed relative p-0",
          event.type !== "BLOCK" && "cursor-grab",
          isDragging && event.type !== "BLOCK" && "cursor-grabbing opacity-50"
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
        onRemoveBlock={onRemoveBlock}
        locale={locale}
        icons={icons}
      />
    </>
  );
};

const EventOverlay = ({ event }: { event: CalendarEvent }) => (
  <div
    className={cn(
      "border grid gap-y-1 overflow-hidden place-content-start",
      "text-xs text-left pl-1 bg-blue-500 text-white rounded-md w-[200px] opacity-90 shadow-lg",
      event.type === "BLOCK" && "bg-gray-300"
    )}
    style={{ height: (event.duration / 60) * 64 }}
  >
    {event.type === "BLOCK" && (
      <div className="absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" />
    )}
    <span>{event.title}</span>
    <span className="text-gray-300">{event.service?.name}</span>
  </div>
);

const Options = ({
  event,
  onClose,
  isOpen,
  onRemoveBlock,
  locale,
  icons,
}: {
  event: CalendarEvent;
  onClose: () => void;
  isOpen?: boolean;
  onRemoveBlock?: (eventId: string) => void;
  locale: string;
  icons?: CalendarConfig["icons"];
}) => {
  const mainRef = useClickOutside<HTMLDivElement>({
    isActive: isOpen,
    onOutsideClick: onClose,
  });

  const eventDate = formatDate(event.start, locale);

  const TrashIcon = icons?.trash ?? <DefaultTrashIcon />;
  const EditIcon = icons?.edit ?? <DefaultEditIcon />;
  const CloseIcon = icons?.close ?? <DefaultCloseIcon />;

  if (!isOpen) return null;

  return (
    <div
      ref={mainRef}
      style={{ top: "-100%", left: "-350%" }}
      className="text-left z-20 bg-white absolute border rounded-lg grid p-3 w-[264px] shadow-lg"
    >
      <header>
        <h3 className="font-medium">Blocked Time</h3>
        <p className="text-xs text-gray-500">{eventDate}</p>
      </header>
      <div className="absolute flex left-0 right-0 justify-end gap-3 px-2 py-2 overflow-hidden">
        <div className="border-l-2 border-b-2 rounded-full absolute pointer-events-none left-[65%] right-0 h-10 -top-2" />
        <button
          onClick={() => {
            onRemoveBlock?.(event.id);
            onClose();
          }}
          type="button"
          className="hover:bg-blue-50 rounded-lg p-1"
        >
          {TrashIcon}
        </button>
        <button type="button" className="hover:bg-blue-50 rounded-lg p-1">
          {EditIcon}
        </button>
        <button
          onClick={onClose}
          type="button"
          className="hover:bg-blue-50 rounded-lg p-1"
        >
          {CloseIcon}
        </button>
      </div>
    </div>
  );
};

// Also export as SimpleBigWeekView for backwards compatibility
export { Calendar as SimpleBigWeekView };
