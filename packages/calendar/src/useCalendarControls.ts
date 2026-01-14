import React, { useState, useCallback, useMemo } from "react";
import { completeWeek, addDaysToDate } from "./utils";

export type CalendarView = "week" | "day";

export interface UseCalendarControlsOptions {
  /** Initial date (default: today) */
  initialDate?: Date;
  /** Initial view mode (default: "week") */
  initialView?: CalendarView;
  /** Locale for date formatting (default: "es-MX") */
  locale?: string;
}

export interface CalendarControls {
  /** Current date */
  date: Date;
  /** Current view mode */
  view: CalendarView;
  /** Week days array (Mon-Sun) */
  week: Date[];
  /** Formatted label for current date/week */
  label: string;
  /** Navigate to today */
  goToToday: () => void;
  /** Navigate to previous period (week or day) */
  goToPrev: () => void;
  /** Navigate to next period (week or day) */
  goToNext: () => void;
  /** Toggle between week and day view (or pass event/value) */
  toggleView: (e?: React.ChangeEvent<HTMLSelectElement> | CalendarView) => void;
  /** Set specific date */
  setDate: (date: Date) => void;
  /** Set specific view */
  setView: (view: CalendarView) => void;
  /** Check if current date is today */
  isToday: boolean;
}

/**
 * Hook for calendar navigation controls
 *
 * @example
 * const controls = useCalendarControls();
 *
 * <button onClick={controls.goToToday}>HOY</button>
 * <button onClick={controls.goToPrev}>←</button>
 * <button onClick={controls.goToNext}>→</button>
 * <span>{controls.label}</span>
 *
 * <Calendar
 *   date={controls.date}
 *   resources={controls.view === "day" ? courts : undefined}
 * />
 */
export function useCalendarControls(
  options: UseCalendarControlsOptions = {}
): CalendarControls {
  const {
    initialDate = new Date(),
    initialView = "week",
    locale = "es-MX",
  } = options;

  const [date, setDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>(initialView);

  const week = useMemo(() => completeWeek(date), [date]);

  const goToToday = useCallback(() => {
    setDate(new Date());
  }, []);

  const goToPrev = useCallback(() => {
    setDate((d) => addDaysToDate(d, view === "week" ? -7 : -1));
  }, [view]);

  const goToNext = useCallback(() => {
    setDate((d) => addDaysToDate(d, view === "week" ? 7 : 1));
  }, [view]);

  const toggleView = useCallback(
    (e?: React.ChangeEvent<HTMLSelectElement> | CalendarView) => {
      if (typeof e === "string") {
        // Direct value passed
        setView(e);
      } else if (e?.target?.value) {
        // Select onChange event
        setView(e.target.value as CalendarView);
      } else {
        // No arg - toggle
        setView((v) => (v === "week" ? "day" : "week"));
      }
    },
    []
  );

  const isToday = useMemo(() => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, [date]);

  const label = useMemo(() => {
    if (view === "week") {
      const monthName = week[0].toLocaleDateString(locale, { month: "long" });
      const year = week[0].getFullYear();
      // Check if week spans two months
      const endMonth = week[6].getMonth();
      if (week[0].getMonth() !== endMonth) {
        const endMonthName = week[6].toLocaleDateString(locale, {
          month: "short",
        });
        return `${week[0].getDate()} ${week[0].toLocaleDateString(locale, { month: "short" })} - ${week[6].getDate()} ${endMonthName} ${year}`;
      }
      return `${week[0].getDate()} - ${week[6].getDate()} ${monthName} ${year}`;
    }
    // Day view
    return date.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
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
    isToday,
  };
}
