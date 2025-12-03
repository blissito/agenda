import { useFetcher } from "react-router";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { cn } from "~/utils/cn";
import { convertDayToString } from "~/components/dash/agenda/agendaUtils";
import { generateTimesFromRange } from "../TimePicker";
import type { DayTuple, WeekTuples } from "../TimesForm";
import { Spinner } from "~/components/common/Spinner";

export default function TimeView({
  selected,
  action,
  weekDays,
  onSelect,
  slotDuration,
  intent,
}: {
  onSelect?: (arg0: string, arg1: number, arg2: number) => void;
  selected: Date;
  action: string;
  weekDays: WeekTuples;
  slotDuration: number;
  intent: string;
}) {
  const [time, setTime] = useState("");
  const fetcher = useFetcher();
  useEffect(() => {
    if (selected) {
      fetcher.submit(
        {
          intent,
          date: new Date( // because we don't want to compare with time included
            selected.getFullYear(),
            selected.getMonth(),
            selected.getDate()
          ),
        },
        { method: "post", action }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const dayString = convertDayToString(selected.getDay());
  const dayRanges = weekDays[dayString] as DayTuple;

  const ranges = dayRanges?.flatMap((range: string[]) =>
    generateTimesFromRange(range, slotDuration)
  ); // @TODO: timeZoned ranges (create real dates from this strings)

  const handleClick = (timeString: string) => () => {
    setTime(timeString);
    const time = timeString.split(":").map((el) => Number(el));
    onSelect?.(timeString, time[0], time[1]);
  };

  const scheduledEvents = // @TODO: not all event info for privacy & security
    fetcher.data &&
    Array.isArray(fetcher.data.events) &&
    fetcher.data.events.length > 0
      ? fetcher.data.events.map((event) =>
          new Date(event.start).toTimeString().substring(0, 5)
        )
      : [];

  const isLoading = fetcher.state !== "idle"; // @todo should not load when select

  return (
    <>
      <section className="flex items-center flex-col flex-grow">
        <h3>
          {selected &&
            selected.toLocaleString("es-MX", {
              month: "long",
              day: "numeric",
              year: "numeric",
              //   hour: "numeric",
              //   minute: "numeric",
              timeZone: "Asia/Jakarta",
            })}
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
          {!isLoading &&
            ranges
              ?.filter((t) => !scheduledEvents.includes(t))
              .map((timeString) => (
                <TimeButton
                  isActive={timeString === time}
                  onClick={handleClick(timeString)}
                  key={nanoid()}
                  timeString={timeString}
                />
              ))}
          {!isLoading &&
            ranges.filter((t) => !scheduledEvents.includes(t)).length < 1 && (
              <h2 className="col-span-2 text-brand_gray text-sm">
                No hay horarios disponíbles
              </h2>
            )}
          {isLoading && <Spinner />}
        </div>

        {/* time zone */}
        <p className="text-xs mt-auto">
          Estas opciones corresponden a esta zona horaria:{" "}
          <select
            defaultValue={"América/Ciudad_de_México"}
            className="rounded pr-8 border-none shadow ml-1"
          >
            <option value="América/Ciudad_de_México">
              América/Ciudad_de_México
            </option>
            <option value="Asia/Jakarta">Asia/Jakarta</option>
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
  // @TODO: hide pased times for today, maybe when tomezoned?
  const now = Date.now();
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
