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
import type {
  CalendarEvent,
  CalendarProps,
  CalendarConfig,
  ColumnHeaderProps,
  Resource,
  EventColors,
  EventParticipant,
  ParticipantsDisplayConfig,
} from "./types";
import { useCalendarEvents } from "./useCalendarEvents";
import { useClickOutside, formatDate } from "./hooks";
import { completeWeek, isToday as checkIsToday, areSameDates } from "./utils";

// Simple classname utility (inline clsx replacement)
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

// Default color preset mapping
const DEFAULT_COLORS: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  gray: "bg-gray-400",
  default: "bg-blue-500",
};

/**
 * Resolve event color to CSS class
 */
const resolveColorClass = (
  color: string | undefined,
  colors: EventColors = {}
): string => {
  if (!color) return colors.default || DEFAULT_COLORS.default;

  // Check if it's a preset
  const mergedColors: Record<string, string | undefined> = { ...DEFAULT_COLORS, ...colors };
  if (color in mergedColors) {
    return mergedColors[color] || DEFAULT_COLORS.default;
  }

  // Check if it's a hex color (will use inline style instead)
  if (color.startsWith("#")) {
    return "";
  }

  // Assume it's a tailwind class
  return color;
};

/**
 * Get inline style for hex colors
 */
const getColorStyle = (color: string | undefined): React.CSSProperties => {
  if (color?.startsWith("#")) {
    return { backgroundColor: color };
  }
  return {};
};

/**
 * Format time range for display
 */
const formatTimeRange = (
  start: Date,
  duration: number,
  locale: string,
  format: "12h" | "24h" = "12h",
  customFormatter?: (start: Date, end: Date, locale: string) => string
): string => {
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);

  if (customFormatter) {
    return customFormatter(start, end, locale);
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: format === "12h",
  };

  const startStr = start.toLocaleTimeString(locale, options);
  const endStr = end.toLocaleTimeString(locale, options);

  return `${startStr} - ${endStr}`;
};

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

/**
 * Participant avatars component
 */
const ParticipantAvatars = ({
  participants,
  config = {},
}: {
  participants: EventParticipant[];
  config?: ParticipantsDisplayConfig;
}) => {
  const { maxVisible = 4, size = 20 } = config;

  if (!participants.length) return null;

  const visible = participants.slice(0, maxVisible);
  const remaining = participants.length - maxVisible;

  const avatarStyle = {
    width: size,
    height: size,
    minWidth: size,
  };

  return (
    <div className="flex -space-x-1 mt-1">
      {visible.map((participant) => (
        <div
          key={participant.id}
          className={cn(
            "rounded-full border border-white flex items-center justify-center text-[8px] bg-gray-200 overflow-hidden",
            participant.avatarColor
          )}
          style={avatarStyle}
          title={participant.name}
        >
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.name || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-medium text-gray-600">
              {participant.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="rounded-full border border-white bg-gray-300 flex items-center justify-center text-[8px] font-medium text-gray-600"
          style={avatarStyle}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

const getComparableTime = (date: Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const DayHeader = ({
  date,
  locale,
  index,
  resource,
  renderColumnHeader,
}: {
  date: Date;
  locale: string;
  index: number;
  resource?: Resource;
  renderColumnHeader?: (props: ColumnHeaderProps) => ReactNode;
}) => {
  const isToday = checkIsToday(date);

  // Custom renderer takes priority
  if (renderColumnHeader) {
    return (
      <div className="grid place-items-center">
        {renderColumnHeader({ date, index, isToday, locale, resource })}
      </div>
    );
  }

  // Resource mode: show icon + name
  if (resource) {
    return (
      <div className="grid place-items-center gap-1">
        {resource.icon && (
          <div className="w-8 h-8 flex items-center justify-center">
            {resource.icon}
          </div>
        )}
        <span className="text-sm font-medium">{resource.name}</span>
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
  resources,
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

  // Determine mode: resources (day view) or week view
  const isResourceMode = !!resources && resources.length > 0;
  const columnCount = isResourceMode ? resources.length : 7;

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
    const [, colIndexStr, hourStr] = over.id.toString().split("-");
    const colIndex = parseInt(colIndexStr);
    const hour = parseInt(hourStr);

    // In resource mode, date stays the same; in week mode, use day from week
    const targetDay = isResourceMode ? date : week[colIndex];
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

  // Get events for a specific column
  const getColumnEvents = (colIndex: number) => {
    if (isResourceMode) {
      // Resource mode: filter by resourceId + current date
      const resourceId = resources![colIndex].id;
      return events.filter((event) => {
        const eventDate = new Date(event.start);
        return (
          event.resourceId === resourceId &&
          areSameDates(eventDate, date)
        );
      });
    }
    // Week mode: filter by day
    const dayOfWeek = week[colIndex];
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === dayOfWeek.getDate() &&
        eventDate.getMonth() === dayOfWeek.getMonth()
      );
    });
  };

  // Dynamic grid columns: 1 for time + N for days/resources
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `auto repeat(${columnCount}, minmax(120px, 1fr))`,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <article className="w-full bg-white shadow rounded-xl overflow-hidden">
        {/* Header */}
        <section
          style={gridStyle}
          className="place-items-center py-4 border-b"
        >
          <p>
            <span className="text-sm text-gray-500">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </p>
          {isResourceMode
            ? resources!.map((resource, index) => (
                <DayHeader
                  key={resource.id}
                  date={date}
                  locale={locale}
                  index={index}
                  resource={resource}
                  renderColumnHeader={renderColumnHeader}
                />
              ))
            : week.map((day, index) => (
                <DayHeader
                  key={day.toISOString()}
                  date={day}
                  locale={locale}
                  index={index}
                  renderColumnHeader={renderColumnHeader}
                />
              ))}
        </section>

        {/* Grid - with horizontal scroll for resources */}
        <section
          style={gridStyle}
          className={cn(
            "max-h-[80vh] overflow-y-auto",
            isResourceMode && "overflow-x-auto"
          )}
        >
          <TimeColumn />
          {Array.from({ length: columnCount }, (_, colIndex) => (
            <Column
              key={isResourceMode ? resources![colIndex].id : week[colIndex].toISOString()}
              dayIndex={colIndex}
              dayOfWeek={isResourceMode ? date : week[colIndex]}
              events={getColumnEvents(colIndex)}
              onNewEvent={onNewEvent}
              onAddBlock={onAddBlock}
              onRemoveBlock={onRemoveBlock}
              onEventClick={onEventClick}
              locale={locale}
              icons={icons}
              resourceId={isResourceMode ? resources![colIndex].id : undefined}
              config={config}
            />
          ))}
        </section>
      </article>
      <DragOverlay>
        {activeEvent ? <EventOverlay event={activeEvent} config={config} /> : null}
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
      {children}
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

/**
 * Calculate overlap groups for events in a column
 * Returns events with their visual position (column index and total columns)
 */
const calculateOverlapPositions = (events: CalendarEvent[]) => {
  if (events.length === 0) return [];

  // Sort events by start time
  const sorted = [...events].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Track which events overlap with which
  const positions: Map<string, { column: number; totalColumns: number }> = new Map();

  // Find overlapping groups
  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [];
  let groupEnd = 0;

  for (const event of sorted) {
    const eventStart = new Date(event.start);
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = startHour + event.duration / 60;

    if (currentGroup.length === 0 || startHour < groupEnd) {
      // Event overlaps with current group
      currentGroup.push(event);
      groupEnd = Math.max(groupEnd, endHour);
    } else {
      // New group
      groups.push(currentGroup);
      currentGroup = [event];
      groupEnd = endHour;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Assign columns within each group
  for (const group of groups) {
    const totalColumns = group.length;
    group.forEach((event, index) => {
      positions.set(event.id, { column: index, totalColumns });
    });
  }

  return sorted.map((event) => ({
    event,
    ...positions.get(event.id)!,
  }));
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
  resourceId,
  config = {},
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
  resourceId?: string;
  config?: CalendarConfig;
}) => {
  const columnRef = useRef<HTMLDivElement>(null);

  // Calculate overlap positions for all events
  const eventsWithPositions = calculateOverlapPositions(events);

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

  const findEventsAtHour = (hours: number) => {
    // Find all events that START at this hour
    const eventsStartingHere = eventsWithPositions.filter(({ event }) =>
      new Date(event.start).getHours() === hours
    );

    if (eventsStartingHere.length > 0) {
      return eventsStartingHere.map(({ event, column, totalColumns }) => (
        <DraggableEvent
          key={event.id}
          onClick={() => onEventClick?.(event)}
          event={event}
          onRemoveBlock={onRemoveBlock}
          locale={locale}
          icons={icons}
          overlapColumn={column}
          overlapTotal={totalColumns}
          config={config}
        />
      ));
    }

    // Check if any event spans this hour (don't show empty button)
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
          {findEventsAtHour(hours)}
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
  overlapColumn = 0,
  overlapTotal = 1,
  config = {},
}: {
  onClick?: (arg0: CalendarEvent) => void;
  onRemoveBlock?: (eventId: string) => void;
  event: CalendarEvent;
  locale: string;
  icons?: CalendarConfig["icons"];
  overlapColumn?: number;
  overlapTotal?: number;
  config?: CalendarConfig;
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event-${event.id}`,
      disabled: event.type === "BLOCK",
    });

  // Calculate width and position for overlapping events
  const widthPercent = event.type === "BLOCK" ? 100 : (90 / overlapTotal);
  const leftPercent = event.type === "BLOCK" ? 0 : (overlapColumn * (90 / overlapTotal));

  // Resolve color
  const colorClass = event.type === "BLOCK"
    ? "bg-gray-300"
    : resolveColorClass(event.color, config.colors);
  const colorStyle = event.type === "BLOCK"
    ? {}
    : getColorStyle(event.color);

  // Determine if time should be shown
  const showTime = event.showTime ?? config.eventTime?.enabled ?? false;
  const timeString = showTime
    ? formatTimeRange(
        new Date(event.start),
        event.duration,
        locale,
        config.eventTime?.format,
        config.eventTime?.formatter
      )
    : "";

  // Custom renderer support
  if (config.renderEvent && event.type !== "BLOCK") {
    return (
      <>
        <button
          ref={setNodeRef}
          style={{
            height: (event.duration / 60) * 64,
            transform: transform ? CSS.Translate.toString(transform) : undefined,
            width: `${widthPercent}%`,
            left: `${leftPercent}%`,
          }}
          onClick={() => onClick?.(event)}
          {...listeners}
          {...attributes}
          className="absolute top-0 z-10 cursor-grab"
        >
          {config.renderEvent({
            event,
            timeString,
            colorClass,
            isDragging,
            onClick: () => onClick?.(event),
          })}
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
  }

  const style: React.CSSProperties = {
    height: (event.duration / 60) * 64,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    width: `${widthPercent}%`,
    left: `${leftPercent}%`,
    ...colorStyle,
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
          "border grid gap-y-0 overflow-hidden place-content-start",
          "text-xs text-left pl-2 pr-1 py-1 absolute top-0 text-white rounded-md z-10",
          colorClass,
          event.type === "BLOCK" &&
            "bg-gray-300 h-full w-full text-center cursor-not-allowed relative p-0",
          event.type !== "BLOCK" && "cursor-grab",
          isDragging && event.type !== "BLOCK" && "cursor-grabbing opacity-50"
        )}
      >
        {event.type === "BLOCK" && (
          <div className="absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" />
        )}
        {showTime && event.type !== "BLOCK" && (
          <span className="text-[10px] opacity-90 font-medium">{timeString}</span>
        )}
        <span className="font-medium truncate">{event.title}</span>
        <span className="text-white/70 truncate">{event.service?.name}</span>
        {event.participants && event.participants.length > 0 && (
          <ParticipantAvatars
            participants={event.participants}
            config={config.participants}
          />
        )}
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

const EventOverlay = ({
  event,
  config = {},
}: {
  event: CalendarEvent;
  config?: CalendarConfig;
}) => {
  const colorClass = event.type === "BLOCK"
    ? "bg-gray-300"
    : resolveColorClass(event.color, config.colors);
  const colorStyle = event.type === "BLOCK"
    ? {}
    : getColorStyle(event.color);

  return (
    <div
      className={cn(
        "border grid gap-y-0 overflow-hidden place-content-start",
        "text-xs text-left pl-2 pr-1 py-1 text-white rounded-md w-[200px] opacity-90 shadow-lg",
        colorClass
      )}
      style={{ height: (event.duration / 60) * 64, ...colorStyle }}
    >
      {event.type === "BLOCK" && (
        <div className="absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" />
      )}
      <span className="font-medium truncate">{event.title}</span>
      <span className="text-white/70 truncate">{event.service?.name}</span>
    </div>
  );
};

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
