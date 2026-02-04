import { useFetcher } from "react-router";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { cn } from "~/utils/cn";
import { convertDayToString } from "~/components/dash/agenda/agendaUtils";
import { generateTimesFromRange } from "../TimePicker";
import type { DayTuple, WeekTuples } from "../TimesForm";
import { Spinner } from "~/components/common/Spinner";
import {
  SUPPORTED_TIMEZONES,
  DEFAULT_TIMEZONE,
  formatDateInTimezone,
  formatTimeOnly,
  isTimePassed,
  type SupportedTimezone,
} from "~/utils/timezone";

export default function TimeView({
  selected,
  action,
  weekDays,
  onSelect,
  slotDuration,
  intent,
  timezone = DEFAULT_TIMEZONE,
  onTimezoneChange,
}: {
  onSelect?: (arg0: string, arg1: number, arg2: number) => void;
  selected: Date;
  action: string;
  weekDays: WeekTuples;
  slotDuration: number;
  intent: string;
  timezone?: SupportedTimezone;
  onTimezoneChange?: (timezone: SupportedTimezone) => void;
}) {
  const [time, setTime] = useState("");
  const fetcher = useFetcher();

  useEffect(() => {
    if (selected) {
      fetcher.submit(
        {
          intent,
          date: new Date(
            selected.getFullYear(),
            selected.getMonth(),
            selected.getDate()
          ).toISOString(),
        },
        { method: "post", action }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const dayString = convertDayToString(selected.getDay());
  const dayRanges = (weekDays as Record<string, DayTuple>)[dayString];

  const ranges = dayRanges?.flatMap((range: string[]) =>
    generateTimesFromRange(range, slotDuration)
  );

  const handleClick = (timeString: string) => () => {
    setTime(timeString);
    const timeParts = timeString.split(":").map((el) => Number(el));
    onSelect?.(timeString, timeParts[0], timeParts[1]);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value as SupportedTimezone;
    onTimezoneChange?.(newTimezone);
  };

  // Convert scheduled events to time strings in the correct timezone
  const scheduledEvents =
    fetcher.data &&
    Array.isArray(fetcher.data.events) &&
    fetcher.data.events.length > 0
      ? fetcher.data.events.map((event: { start: string | Date }) =>
          formatTimeOnly(new Date(event.start), timezone)
        )
      : [];

  // Check if selected date is today to filter passed times
  const isToday = (() => {
    const today = new Date();
    return (
      selected.getDate() === today.getDate() &&
      selected.getMonth() === today.getMonth() &&
      selected.getFullYear() === today.getFullYear()
    );
  })();

  // Filter out scheduled events and passed times (for today)
  const availableRanges = ranges?.filter((t) => {
    if (scheduledEvents.includes(t)) return false;
    if (isToday && isTimePassed(t, timezone)) return false;
    return true;
  });

  const isLoading = fetcher.state !== "idle";

  return (
    <>
      <section className="flex items-center flex-col flex-grow">
        <h3>
          {selected &&
            formatDateInTimezone(selected, timezone, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
        </h3>
        <div
          className={cn(
            "grid grid-cols-2 gap-x-4 gap-y-2 mt-6 relative",
            { "opacity-50 pointer-events-none": isLoading }
          )}
        >
          {availableRanges?.map((timeString) => (
            <TimeButton
              isActive={timeString === time}
              onClick={handleClick(timeString)}
              key={nanoid()}
              timeString={timeString}
            />
          ))}
          {!isLoading && availableRanges && availableRanges.length < 1 && (
            <h2 className="col-span-2 text-brand_gray text-sm">
              No hay horarios disponíbles
            </h2>
          )}
          {isLoading && <Spinner className="absolute inset-0 m-auto" />}
        </div>

        {/* Timezone selector */}
        <p className="text-xs mt-auto">
          Estas opciones corresponden a esta zona horaria:{" "}
          <select
            value={timezone}
            onChange={handleTimezoneChange}
            className="rounded pr-8 border-none shadow ml-1"
          >
            {SUPPORTED_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </p>
      </section>
    </>
  );
}

const TimeButton = ({
  timeString,
  isActive,
  onClick,
}: {
  onClick?: () => void;
  isActive?: boolean;
  timeString: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "hover:bg-brand_blue hover:text-white transition-all px-12 py-1 rounded border border-brand_blue text-brand_blue",
        {
          "bg-brand_blue text-white": isActive,
        }
      )}
    >
      {timeString}
    </button>
  );
};
