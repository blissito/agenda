import { Suspense, useState } from "react";
import { useLoaderData } from "react-router";
import {
  addDaysToDate,
  BasicBoxType,
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
export const loader = async () => {
  const date = new Date();
  const today = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    9
  );
  const tomorrow = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    10
  );
  const pastTomorrow = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 2,
    12
  );

  return {
    events: [
      {
        id: 1,
        title: "Charles Chaplin",
        text: "Clase de música",
        date: new Date(2024, 6, 17, 12),
      },
      {
        id: 2,
        title: "Julio Cortazar",
        text: "Clase de literatura",
        date: new Date(2024, 6, 16, 11),
      },
      {
        id: 3,
        title: "Jorge Luis Borges",
        text: "Clase de literatura inglesa",
        date: new Date(2024, 6, 18, 13),
      },
      {
        id: 4,
        title: "Roberto Bolaño",
        text: "Clase de ensayo",
        date: new Date(2024, 6, 9, 9),
      },
    ] as BasicBoxType[],
    fromHour: 9,
    toHour: 13,
    daysShown: [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      // "sábado",
      // "domingo",
    ],
  };
};

export default function Page() {
  const { events, fromHour, toHour, daysShown } =
    useLoaderData<typeof loader>();

  const [monday, setMonday] = useState<Date>(getMonday());
  const week = generateWeek(monday, 7);

  const updateMonday = (direction: number) =>
    setMonday(
      new Date(monday.setDate(addDaysToDate(direction > 0 ? 7 : -7, monday)))
    );

  const min = new Date(week[0].date).getTime();
  const max = new Date(week[week.length - 1].date).getTime();
  // const month = week[days.length - 1].date.getMonth();
  const filteredEvents = events.filter(
    (event) =>
      new Date(event.date).getTime() >= min &&
      new Date(event.date).getTime() <= max
  );

  return (
    <>
      <RouteTitle>Mi agenda {week[4].date.getFullYear()}</RouteTitle>
      <Paginator
        monday={monday}
        month={MONTHS[week[daysShown.length - 1].date.getMonth()]} // last day from
        onToday={() => setMonday(getMonday())}
        start={monday.getDate()}
        end={week[daysShown.length - 1].date?.getDate()}
        onPrev={() => updateMonday(-1)}
        onNext={() => updateMonday(1)}
      />
      <CalendarGrid
        grid="quarter"
        events={filteredEvents}
        hours={generateHours({ fromHour, toHour })}
        week={week}
        days={daysShown}
      />
      {/* </Suspense> */}
    </>
  );
}
