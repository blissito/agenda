import { Suspense, useState } from "react";
import { useLoaderData } from "react-router";
import {
  addDaysToDate,
  generateHours,
  generateWeek,
  getMonday,
} from "~/components/dash/agenda/agendaUtils";
import { CalendarGrid } from "~/components/dash/agenda/calendarGrid.client";
import { Paginator } from "~/components/dash/agenda/paginator";
import { RouteTitle } from "~/components/sideBar/routeTitle";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loader = async () => {
  return {
    fromHour: 19,
    toHour: 24,
    daysShown: [
      "lunes",
      "martes",
      "miércoles",
      "viernes",
      "jueves",
      "sábado",
      // "domingo",
    ],
  };
};

export default function Page() {
  const { fromHour, toHour, daysShown } = useLoaderData<typeof loader>();

  const [monday, setMonday] = useState<Date>(getMonday());
  const week = generateWeek(monday, 7);

  const updateMonday = (direction: number) =>
    setMonday(
      new Date(monday.setDate(addDaysToDate(direction > 0 ? 7 : -7, monday)))
    );

  return (
    <>
      <RouteTitle>Mi agenda {week[4].date.getFullYear()}</RouteTitle>
      <Paginator
        monday={monday}
        month={MONTHS[week[daysShown.length - 1].date.getMonth()]}
        onToday={() => setMonday(getMonday())}
        start={monday.getDate()}
        end={week[daysShown.length - 1].date?.getDate()}
        onPrev={() => updateMonday(1)}
        onNext={() => updateMonday(-1)}
      />
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center text-brand_blue opacity-70">
            Cargando calendario...
          </div>
        }
      >
        <CalendarGrid
          hours={generateHours({ fromHour, toHour })}
          week={week}
          days={daysShown}
        />
      </Suspense>
    </>
  );
}
