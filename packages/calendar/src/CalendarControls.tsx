import type { ReactNode } from "react";
import type { CalendarControls as CalendarControlsType } from "./useCalendarControls";

export interface CalendarControlsProps {
  /** Controls from useCalendarControls hook */
  controls: CalendarControlsType;
  /** Custom "Today" button label */
  todayLabel?: string;
  /** Custom "Week" label */
  weekLabel?: string;
  /** Custom "Day" label */
  dayLabel?: string;
  /** Show view toggle (default: true) */
  showViewToggle?: boolean;
  /** Custom prev icon */
  prevIcon?: ReactNode;
  /** Custom next icon */
  nextIcon?: ReactNode;
  /** Additional action buttons (export, add, etc.) */
  actions?: ReactNode;
  /** Custom class name */
  className?: string;
}

const DefaultPrevIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

const DefaultNextIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

/**
 * Pre-built calendar controls component
 *
 * @example
 * const controls = useCalendarControls();
 *
 * <CalendarControls
 *   controls={controls}
 *   actions={<button>Add Event</button>}
 * />
 * <Calendar date={controls.date} />
 */
export function CalendarControls({
  controls,
  todayLabel = "HOY",
  weekLabel = "SEMANA",
  dayLabel = "DÍA",
  showViewToggle = true,
  prevIcon,
  nextIcon,
  actions,
  className = "",
}: CalendarControlsProps) {
  const { label, goToToday, goToPrev, goToNext, view, toggleView, isToday } =
    controls;

  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        {/* Today button */}
        <button
          onClick={goToToday}
          disabled={isToday}
          className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
            isToday
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {todayLabel}
        </button>

        {/* Navigation */}
        <button
          onClick={goToPrev}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Previous"
        >
          {prevIcon ?? <DefaultPrevIcon />}
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Next"
        >
          {nextIcon ?? <DefaultNextIcon />}
        </button>

        {/* Date label */}
        <span className="text-lg font-medium capitalize ml-2">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* View toggle */}
        {showViewToggle && (
          <select
            value={view}
            onChange={toggleView}
            className="px-4 py-2 text-sm font-medium border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
          >
            <option value="week">{weekLabel}</option>
            <option value="day">{dayLabel}</option>
          </select>
        )}

        {/* Custom actions */}
        {actions}
      </div>
    </div>
  );
}
