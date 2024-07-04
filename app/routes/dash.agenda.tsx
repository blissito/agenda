import { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  generateHours,
  generateWeek,
  getMonday,
} from "~/components/dash/agenda/agendaUtils";
import { CalendarGrid } from "~/components/dash/agenda/calendarGrid";
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
export const loader = async (_: LoaderFunctionArgs) => ({
  fromHour: 19,
  toHour: 24,
  daysShown: [
    "lunes",
    "martes",
    "miércoles",
    "viernes",
    "jueves",
    "sábado",
    //   "domingo",
  ],
});

export default function Page() {
  const { fromHour, toHour, daysShown } = useLoaderData<typeof loader>();

  const [monday, setMonday] = useState<Date>(getMonday());
  const week = generateWeek(monday, 7);

  const updateMonday = (numberOfWeeks: number) => {
    const days = numberOfWeeks * 7;
    const newDate = monday.getDate() + days;
    setMonday(new Date(monday.setDate(newDate)));
  };

  return (
    <article className="">
      <RouteTitle>Mi agenda {week[4].date.getFullYear()}</RouteTitle>
      <Paginator
        monday={monday}
        month={MONTHS[week[daysShown.length].date.getMonth()]}
        onToday={() => setMonday(getMonday())}
        start={monday.getDate()}
        end={week[daysShown.length].date?.getDate()}
        onPrev={() => updateMonday(-1)}
        onNext={() => updateMonday(1)}
      />
      <CalendarGrid
        hours={generateHours({ fromHour, toHour })}
        week={week}
        days={daysShown}
      />
    </article>
  );
}
