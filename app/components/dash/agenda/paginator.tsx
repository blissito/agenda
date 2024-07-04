import { twMerge } from "tailwind-merge";
import { generateWeek } from "./agendaUtils";

export const Paginator = ({
  onNext,
  month,
  end,
  start,
  onPrev,
  onToday,
  monday,
}: {
  month: string;
  end: number;
  start: number;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  monday: Date;
}) => {
  const today = new Date();

  const isTodayInWeek = generateWeek(monday).some(
    (day) =>
      day.date.getDate() === today.getDate() &&
      day.date.getMonth() === today.getMonth()
  );

  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-2 ">
        <p className="w-[180px] text-right pr-4">
          {" "}
          {start} - {end} de {month}{" "}
        </p>
        <button
          onClick={onPrev}
          className="px-4 py-2 shadow flex bg-white rounded-xl items-center justify-center"
        >
          &#60;
        </button>{" "}
        <button
          onClick={onNext}
          className="px-4 py-2 shadow flex bg-white rounded-xl items-center justify-center"
        >
          &#62;
        </button>
        {onToday && (
          <button
            onClick={onToday}
            className={twMerge(
              "px-4 py-2 shadow flex bg-white rounded-xl items-center justify-center",
              isTodayInWeek && "bg-brand_blue text-white"
            )}
          >
            Hoy
          </button>
        )}
      </div>
      <select className="rounded-3xl border- mr-10">
        <option value="">Semanal</option>
        <option disabled>Mensual</option>
      </select>
    </nav>
  );
};
