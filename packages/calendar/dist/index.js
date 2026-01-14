import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useSensors, useSensor, PointerSensor, KeyboardSensor, DndContext, closestCenter, DragOverlay, useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

// src/Calendar.tsx

// src/utils.ts
var getMonday = (today = /* @__PURE__ */ new Date()) => {
  const d = new Date(today);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};
var completeWeek = (date) => {
  const startDate = new Date(date);
  const day = startDate.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  startDate.setDate(startDate.getDate() + offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
};
var generateHours = ({
  fromHour,
  toHour
}) => {
  return Array.from({ length: toHour - fromHour }, (_, index) => {
    const hour = fromHour + index;
    return hour < 10 ? `0${hour}:00` : `${hour}:00`;
  });
};
var isToday = (date) => {
  const today = /* @__PURE__ */ new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
var areSameDates = (d1, d2) => {
  if (!d1 || !d2) return false;
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};
var addDaysToDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
var addMinutesToDate = (date, mins) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + mins);
  return result;
};
var fromMinsToTimeString = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}`;
};
var fromMinsToLocaleTimeString = (mins, locale = "es-MX") => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const today = /* @__PURE__ */ new Date();
  today.setHours(h, m, 0, 0);
  return today.toLocaleTimeString(locale);
};
var fromDateToTimeString = (date, locale = "es-MX") => {
  return new Date(date).toLocaleTimeString(locale);
};
var getDaysInMonth = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const numberOfMissing = 6 - lastDay.getDay();
  const leftOffset = firstDay.getDay();
  firstDay.setDate(firstDay.getDate() - leftOffset);
  const days = [];
  days.push(new Date(firstDay));
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

// src/useCalendarEvents.ts
function useCalendarEvents(events) {
  const hasOverlap = useCallback(
    (start, duration, excludeId) => {
      const hour = start.getHours() + start.getMinutes() / 60;
      const endHour = hour + duration / 60;
      return events.some((existing) => {
        if (excludeId && existing.id === excludeId) return false;
        const existingStart = new Date(existing.start);
        if (existingStart.getDate() !== start.getDate() || existingStart.getMonth() !== start.getMonth() || existingStart.getFullYear() !== start.getFullYear()) {
          return false;
        }
        const existingHour = existingStart.getHours() + existingStart.getMinutes() / 60;
        const existingEnd = existingHour + existing.duration / 60;
        return hour >= existingHour && hour < existingEnd || endHour > existingHour && endHour <= existingEnd || hour <= existingHour && endHour >= existingEnd;
      });
    },
    [events]
  );
  const findConflicts = useCallback(
    (start, duration, excludeId) => {
      const hour = start.getHours() + start.getMinutes() / 60;
      const endHour = hour + duration / 60;
      return events.filter((existing) => {
        if (excludeId && existing.id === excludeId) return false;
        const existingStart = new Date(existing.start);
        if (existingStart.getDate() !== start.getDate() || existingStart.getMonth() !== start.getMonth() || existingStart.getFullYear() !== start.getFullYear()) {
          return false;
        }
        const existingHour = existingStart.getHours() + existingStart.getMinutes() / 60;
        const existingEnd = existingHour + existing.duration / 60;
        return hour >= existingHour && hour < existingEnd || endHour > existingHour && endHour <= existingEnd || hour <= existingHour && endHour >= existingEnd;
      });
    },
    [events]
  );
  const canMove = useCallback(
    (eventId, newStart) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return false;
      return !hasOverlap(newStart, event.duration, eventId);
    },
    [events, hasOverlap]
  );
  const getEventsForDay = useCallback(
    (date) => {
      return events.filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate.getDate() === date.getDate() && eventDate.getMonth() === date.getMonth() && eventDate.getFullYear() === date.getFullYear();
      });
    },
    [events]
  );
  const getEventsForWeek = useCallback(
    (date) => {
      const week = completeWeek(date);
      const start = week[0];
      const end = new Date(week[6]);
      end.setHours(23, 59, 59, 999);
      return events.filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate >= start && eventDate <= end;
      });
    },
    [events]
  );
  const findAvailableSlots = useCallback(
    (date, duration, startHour = 8, endHour = 18) => {
      const slots = [];
      const dayEvents = getEventsForDay(date);
      for (let hour = startHour; hour <= endHour - duration / 60; hour++) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        const hasConflict = dayEvents.some((event) => {
          const eventStart = new Date(event.start);
          const eventHour = eventStart.getHours();
          const eventEnd = eventHour + event.duration / 60;
          const slotEnd = hour + duration / 60;
          return hour >= eventHour && hour < eventEnd || slotEnd > eventHour && slotEnd <= eventEnd || hour <= eventHour && slotEnd >= eventEnd;
        });
        if (!hasConflict) {
          slots.push(slotStart);
        }
      }
      return slots;
    },
    [getEventsForDay]
  );
  return {
    hasOverlap,
    findConflicts,
    canMove,
    getEventsForDay,
    getEventsForWeek,
    findAvailableSlots
  };
}
var useEventOverlap = useCalendarEvents;
function useClickOutside({
  isActive,
  onOutsideClick
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!isActive) return;
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActive, onOutsideClick]);
  return ref;
}
function formatDate(date, locale = "es-MX") {
  return new Date(date).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
var cn = (...classes) => classes.filter(Boolean).join(" ");
var DefaultTrashIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "w-4 h-4", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" }) });
var DefaultEditIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "w-4 h-4", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" }) });
var DefaultCloseIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "w-4 h-4", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" }) });
var DayHeader = ({
  date,
  locale,
  index,
  resource,
  renderColumnHeader
}) => {
  const isToday2 = isToday(date);
  if (renderColumnHeader) {
    return /* @__PURE__ */ jsx("div", { className: "grid place-items-center", children: renderColumnHeader({ date, index, isToday: isToday2, locale, resource }) });
  }
  if (resource) {
    return /* @__PURE__ */ jsxs("div", { className: "grid place-items-center gap-1", children: [
      resource.icon && /* @__PURE__ */ jsx("div", { className: "w-8 h-8 flex items-center justify-center", children: resource.icon }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: resource.name })
    ] });
  }
  return /* @__PURE__ */ jsxs("p", { className: "grid place-items-center", children: [
    /* @__PURE__ */ jsx("span", { className: "capitalize", children: date.toLocaleDateString(locale, { weekday: "short" }) }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: cn(
          isToday2 && "bg-blue-500 rounded-full p-1 text-white"
        ),
        children: date.getDate()
      }
    )
  ] });
};
function Calendar({
  date = /* @__PURE__ */ new Date(),
  events = [],
  resources,
  onEventClick,
  onNewEvent,
  onEventMove,
  onAddBlock,
  onRemoveBlock,
  config = {}
}) {
  const { locale = "es-MX", icons = {}, renderColumnHeader } = config;
  const week = completeWeek(date);
  const [activeId, setActiveId] = useState(null);
  const { canMove } = useCalendarEvents(events);
  const isResourceMode = !!resources && resources.length > 0;
  const columnCount = isResourceMode ? resources.length : 7;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor)
  );
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const eventId = active.id.toString().replace("event-", "");
    const [, colIndexStr, hourStr] = over.id.toString().split("-");
    const colIndex = parseInt(colIndexStr);
    const hour = parseInt(hourStr);
    const targetDay = isResourceMode ? date : week[colIndex];
    const newStart = new Date(targetDay);
    newStart.setHours(hour, 0, 0, 0);
    const movedEvent = events.find((e) => e.id === eventId);
    if (!movedEvent) return;
    const currentStart = new Date(movedEvent.start);
    if (currentStart.getDate() === newStart.getDate() && currentStart.getHours() === newStart.getHours()) {
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
  const activeEvent = activeId ? events.find((e) => `event-${e.id}` === activeId) : null;
  const getColumnEvents = (colIndex) => {
    if (isResourceMode) {
      const resourceId = resources[colIndex].id;
      return events.filter((event) => {
        const eventDate = new Date(event.start);
        return event.resourceId === resourceId && areSameDates(eventDate, date);
      });
    }
    const dayOfWeek = week[colIndex];
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === dayOfWeek.getDate() && eventDate.getMonth() === dayOfWeek.getMonth();
    });
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `auto repeat(${columnCount}, minmax(120px, 1fr))`
  };
  return /* @__PURE__ */ jsxs(
    DndContext,
    {
      sensors,
      collisionDetection: closestCenter,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel,
      children: [
        /* @__PURE__ */ jsxs("article", { className: "w-full bg-white shadow rounded-xl overflow-hidden", children: [
          /* @__PURE__ */ jsxs(
            "section",
            {
              style: gridStyle,
              className: "place-items-center py-4 border-b",
              children: [
                /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: Intl.DateTimeFormat().resolvedOptions().timeZone }) }),
                isResourceMode ? resources.map((resource, index) => /* @__PURE__ */ jsx(
                  DayHeader,
                  {
                    date,
                    locale,
                    index,
                    resource,
                    renderColumnHeader
                  },
                  resource.id
                )) : week.map((day, index) => /* @__PURE__ */ jsx(
                  DayHeader,
                  {
                    date: day,
                    locale,
                    index,
                    renderColumnHeader
                  },
                  day.toISOString()
                ))
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "section",
            {
              style: gridStyle,
              className: cn(
                "max-h-[80vh] overflow-y-auto",
                isResourceMode && "overflow-x-auto"
              ),
              children: [
                /* @__PURE__ */ jsx(TimeColumn, {}),
                Array.from({ length: columnCount }, (_, colIndex) => /* @__PURE__ */ jsx(
                  Column,
                  {
                    dayIndex: colIndex,
                    dayOfWeek: isResourceMode ? date : week[colIndex],
                    events: getColumnEvents(colIndex),
                    onNewEvent,
                    onAddBlock,
                    onRemoveBlock,
                    onEventClick,
                    locale,
                    icons,
                    resourceId: isResourceMode ? resources[colIndex].id : void 0
                  },
                  isResourceMode ? resources[colIndex].id : week[colIndex].toISOString()
                ))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(DragOverlay, { children: activeEvent ? /* @__PURE__ */ jsx(EventOverlay, { event: activeEvent }) : null })
      ]
    }
  );
}
var Cell = ({
  date,
  hours,
  children,
  onClick,
  className,
  dayIndex
}) => {
  const isTodayCell = date ? isToday(date) : false;
  const isThisHour = isTodayCell && hours === (/* @__PURE__ */ new Date()).getHours();
  const { setNodeRef, isOver } = useDroppable({
    id: dayIndex !== void 0 ? `cell-${dayIndex}-${hours}` : `time-${hours}`,
    disabled: dayIndex === void 0
  });
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: setNodeRef,
      tabIndex: 0,
      onKeyDown: (e) => e.code === "Space" && onClick?.(),
      onClick,
      role: "button",
      className: cn(
        "bg-slate-50 w-full h-16 border-gray-300 border-[.5px] border-dashed text-gray-500 flex justify-center items-start relative cursor-pointer",
        isTodayCell && isThisHour && "border-t-2 border-t-blue-500",
        isOver && dayIndex !== void 0 && "bg-blue-100",
        className
      ),
      children: children || hours
    }
  );
};
var EmptyButton = ({
  hours,
  date,
  onNewEvent,
  onAddBlock
}) => {
  const d = new Date(date);
  d.setHours(hours, 0, 0, 0);
  const [show, setShow] = useState(false);
  const buttonRef = useRef(null);
  const outsideRef = useClickOutside({
    isActive: show,
    onOutsideClick: () => setShow(false)
  });
  const handleReserva = (event) => {
    event.stopPropagation();
    onNewEvent?.(d);
    setShow(false);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "button",
      tabIndex: 0,
      ref: buttonRef,
      className: "w-full h-full text-xs hover:bg-blue-50 relative",
      onClick: () => setShow(true),
      children: show && /* @__PURE__ */ jsxs(
        "div",
        {
          ref: outsideRef,
          className: "absolute border bg-white rounded-lg grid p-1 bottom-[-100%] left-0 z-20 shadow-lg",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleReserva,
                className: "hover:bg-blue-50 px-4 py-2 rounded-lg text-left",
                children: "Reserve"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  onAddBlock?.(d);
                  setShow(false);
                },
                className: "hover:bg-blue-50 px-4 py-2 rounded-lg text-left",
                children: "Block"
              }
            )
          ]
        }
      )
    }
  );
};
var calculateOverlapPositions = (events) => {
  if (events.length === 0) return [];
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const positions = /* @__PURE__ */ new Map();
  const groups = [];
  let currentGroup = [];
  let groupEnd = 0;
  for (const event of sorted) {
    const eventStart = new Date(event.start);
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = startHour + event.duration / 60;
    if (currentGroup.length === 0 || startHour < groupEnd) {
      currentGroup.push(event);
      groupEnd = Math.max(groupEnd, endHour);
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
      groupEnd = endHour;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  for (const group of groups) {
    const totalColumns = group.length;
    group.forEach((event, index) => {
      positions.set(event.id, { column: index, totalColumns });
    });
  }
  return sorted.map((event) => ({
    event,
    ...positions.get(event.id)
  }));
};
var Column = ({
  onEventClick,
  events = [],
  dayOfWeek,
  onNewEvent,
  onAddBlock,
  onRemoveBlock,
  dayIndex,
  locale,
  icons,
  resourceId
}) => {
  const columnRef = useRef(null);
  const eventsWithPositions = calculateOverlapPositions(events);
  useEffect(() => {
    if (!columnRef.current) return;
    const today = /* @__PURE__ */ new Date();
    const isColumnToday = dayOfWeek.getDate() === today.getDate() && dayOfWeek.getMonth() === today.getMonth() && dayOfWeek.getFullYear() === today.getFullYear();
    if (!isColumnToday) return;
    const currentHour = today.getHours();
    const currentCell = columnRef.current.children[currentHour];
    if (currentCell) {
      setTimeout(() => {
        currentCell.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [dayOfWeek]);
  const findEventsAtHour = (hours) => {
    const eventsStartingHere = eventsWithPositions.filter(
      ({ event }) => new Date(event.start).getHours() === hours
    );
    if (eventsStartingHere.length > 0) {
      return eventsStartingHere.map(({ event, column, totalColumns }) => /* @__PURE__ */ jsx(
        DraggableEvent,
        {
          onClick: () => onEventClick?.(event),
          event,
          onRemoveBlock,
          locale,
          icons,
          overlapColumn: column,
          overlapTotal: totalColumns
        },
        event.id
      ));
    }
    const eventSpansHere = events.find((event) => {
      const eventStart = new Date(event.start);
      const startHour = eventStart.getHours();
      const endHour = startHour + event.duration / 60;
      return hours > startHour && hours < endHour;
    });
    if (eventSpansHere) return null;
    return /* @__PURE__ */ jsx(
      EmptyButton,
      {
        hours,
        date: dayOfWeek,
        onNewEvent,
        onAddBlock
      }
    );
  };
  return /* @__PURE__ */ jsx("div", { ref: columnRef, className: "grid", children: Array.from({ length: 24 }, (_, hours) => /* @__PURE__ */ jsx(
    Cell,
    {
      hours,
      date: dayOfWeek,
      className: "relative",
      dayIndex,
      children: findEventsAtHour(hours)
    },
    hours
  )) });
};
var TimeColumn = () => /* @__PURE__ */ jsx("div", { className: "grid", children: Array.from({ length: 24 }, (_, i) => /* @__PURE__ */ jsx(Cell, { children: `${i < 10 ? "0" : ""}${i}:00` }, i)) });
var DraggableEvent = ({
  event,
  onClick,
  onRemoveBlock,
  locale,
  icons,
  overlapColumn = 0,
  overlapTotal = 1
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${event.id}`,
    disabled: event.type === "BLOCK"
  });
  const widthPercent = event.type === "BLOCK" ? 100 : 90 / overlapTotal;
  const leftPercent = event.type === "BLOCK" ? 0 : overlapColumn * (90 / overlapTotal);
  const style = {
    height: event.duration / 60 * 64,
    transform: transform ? CSS.Translate.toString(transform) : void 0,
    width: `${widthPercent}%`,
    left: `${leftPercent}%`
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: setNodeRef,
        style,
        onClick: event.type === "BLOCK" ? () => setShowOptions(true) : () => onClick?.(event),
        ...listeners,
        ...attributes,
        className: cn(
          "border grid gap-y-1 overflow-hidden place-content-start",
          "text-xs text-left pl-1 absolute top-0 bg-blue-500 text-white rounded-md z-10",
          event.type === "BLOCK" && "bg-gray-300 h-full w-full text-center cursor-not-allowed relative p-0",
          event.type !== "BLOCK" && "cursor-grab",
          isDragging && event.type !== "BLOCK" && "cursor-grabbing opacity-50"
        ),
        children: [
          event.type === "BLOCK" && /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" }),
          /* @__PURE__ */ jsx("span", { children: event.title }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: event.service?.name })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Options,
      {
        event,
        onClose: () => setShowOptions(false),
        isOpen: showOptions,
        onRemoveBlock,
        locale,
        icons
      }
    )
  ] });
};
var EventOverlay = ({ event }) => /* @__PURE__ */ jsxs(
  "div",
  {
    className: cn(
      "border grid gap-y-1 overflow-hidden place-content-start",
      "text-xs text-left pl-1 bg-blue-500 text-white rounded-md w-[200px] opacity-90 shadow-lg",
      event.type === "BLOCK" && "bg-gray-300"
    ),
    style: { height: event.duration / 60 * 64 },
    children: [
      event.type === "BLOCK" && /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0 w-1 bg-gray-500 rounded-l-full pointer-events-none" }),
      /* @__PURE__ */ jsx("span", { children: event.title }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: event.service?.name })
    ]
  }
);
var Options = ({
  event,
  onClose,
  isOpen,
  onRemoveBlock,
  locale,
  icons
}) => {
  const mainRef = useClickOutside({
    isActive: isOpen,
    onOutsideClick: onClose
  });
  const eventDate = formatDate(event.start, locale);
  const TrashIcon = icons?.trash ?? /* @__PURE__ */ jsx(DefaultTrashIcon, {});
  const EditIcon = icons?.edit ?? /* @__PURE__ */ jsx(DefaultEditIcon, {});
  const CloseIcon = icons?.close ?? /* @__PURE__ */ jsx(DefaultCloseIcon, {});
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: mainRef,
      style: { top: "-100%", left: "-350%" },
      className: "text-left z-20 bg-white absolute border rounded-lg grid p-3 w-[264px] shadow-lg",
      children: [
        /* @__PURE__ */ jsxs("header", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Blocked Time" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: eventDate })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute flex left-0 right-0 justify-end gap-3 px-2 py-2 overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "border-l-2 border-b-2 rounded-full absolute pointer-events-none left-[65%] right-0 h-10 -top-2" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                onRemoveBlock?.(event.id);
                onClose();
              },
              type: "button",
              className: "hover:bg-blue-50 rounded-lg p-1",
              children: TrashIcon
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "button", className: "hover:bg-blue-50 rounded-lg p-1", children: EditIcon }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              type: "button",
              className: "hover:bg-blue-50 rounded-lg p-1",
              children: CloseIcon
            }
          )
        ] })
      ]
    }
  );
};
var DefaultPrevIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "w-5 h-5", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" }) });
var DefaultNextIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "w-5 h-5", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" }) });
function CalendarControls({
  controls,
  todayLabel = "HOY",
  weekLabel = "SEMANA",
  dayLabel = "D\xCDA",
  showViewToggle = true,
  prevIcon,
  nextIcon,
  actions,
  className = ""
}) {
  const { label, goToToday, goToPrev, goToNext, view, toggleView, isToday: isToday2 } = controls;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-center justify-between gap-4 py-3 ${className}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: goToToday,
              disabled: isToday2,
              className: `px-4 py-2 text-sm font-medium rounded-full border transition-colors ${isToday2 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`,
              children: todayLabel
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: goToPrev,
              className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
              "aria-label": "Previous",
              children: prevIcon ?? /* @__PURE__ */ jsx(DefaultPrevIcon, {})
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: goToNext,
              className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
              "aria-label": "Next",
              children: nextIcon ?? /* @__PURE__ */ jsx(DefaultNextIcon, {})
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-medium capitalize ml-2", children: label })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          showViewToggle && /* @__PURE__ */ jsxs(
            "select",
            {
              value: view,
              onChange: toggleView,
              className: "px-4 py-2 text-sm font-medium border rounded-lg bg-white hover:bg-gray-50 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("option", { value: "week", children: weekLabel }),
                /* @__PURE__ */ jsx("option", { value: "day", children: dayLabel })
              ]
            }
          ),
          actions
        ] })
      ]
    }
  );
}
function useCalendarControls(options = {}) {
  const {
    initialDate = /* @__PURE__ */ new Date(),
    initialView = "week",
    locale = "es-MX"
  } = options;
  const [date, setDate] = useState(initialDate);
  const [view, setView] = useState(initialView);
  const week = useMemo(() => completeWeek(date), [date]);
  const goToToday = useCallback(() => {
    setDate(/* @__PURE__ */ new Date());
  }, []);
  const goToPrev = useCallback(() => {
    setDate((d) => addDaysToDate(d, view === "week" ? -7 : -1));
  }, [view]);
  const goToNext = useCallback(() => {
    setDate((d) => addDaysToDate(d, view === "week" ? 7 : 1));
  }, [view]);
  const toggleView = useCallback(() => {
    setView((v) => v === "week" ? "day" : "week");
  }, []);
  const isToday2 = useMemo(() => {
    const today = /* @__PURE__ */ new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }, [date]);
  const label = useMemo(() => {
    if (view === "week") {
      const monthName = week[0].toLocaleDateString(locale, { month: "long" });
      const year = week[0].getFullYear();
      const endMonth = week[6].getMonth();
      if (week[0].getMonth() !== endMonth) {
        const endMonthName = week[6].toLocaleDateString(locale, {
          month: "short"
        });
        return `${week[0].getDate()} ${week[0].toLocaleDateString(locale, { month: "short" })} - ${week[6].getDate()} ${endMonthName} ${year}`;
      }
      return `${week[0].getDate()} - ${week[6].getDate()} ${monthName} ${year}`;
    }
    return date.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, [view, week, date, locale]);
  return {
    date,
    view,
    week,
    label,
    goToToday,
    goToPrev,
    goToNext,
    toggleView,
    setDate,
    setView,
    isToday: isToday2
  };
}

export { Calendar, CalendarControls, Calendar as SimpleBigWeekView, addDaysToDate, addMinutesToDate, areSameDates, completeWeek, formatDate, fromDateToTimeString, fromMinsToLocaleTimeString, fromMinsToTimeString, generateHours, getDaysInMonth, getMonday, isToday, useCalendarControls, useCalendarEvents, useClickOutside, useEventOverlap };
