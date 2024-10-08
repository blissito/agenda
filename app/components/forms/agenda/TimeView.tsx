import { useFetcher } from "@remix-run/react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { cn } from "~/utils/cd";
import { WeekDaysType } from "../form_handlers/aboutYourCompanyHandler";
import {
  convertDayToString,
  generateHours,
} from "~/components/dash/agenda/agendaUtils";
import {
  addMinutesToString,
  generateTimesFromRange,
  getHourNumberFromString,
  TimePicker,
} from "../TimePicker";
import { DayTuple, WeekTuples } from "../TimesForm";

export default function TimeView({
  timeStrings = [],
  selected,
  action,
  weekDays,
  onSelect,
  slotDuration,
}: {
  onSelect?: (arg0: string, arg1: number, arg2: number) => void;
  selected: Date;
  timeStrings?: string[];
  action: string;
  weekDays: WeekTuples;
  slotDuration: number;
}) {
  const [time, setTime] = useState("");
  const fetcher = useFetcher();
  useEffect(() => {
    if (selected) {
      fetcher.submit(
        { intent: "get_times_for_selected_date", date: selected },
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
          {ranges?.map((timeString) => (
            <TimeButton
              isActive={timeString === time}
              onClick={handleClick(timeString)}
              key={nanoid()}
              timeString={timeString}
            />
          ))}
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
