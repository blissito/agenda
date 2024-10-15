import { useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import {
  getServices,
  getUserAndOrgOrRedirect,
  getUserOrRedirect,
} from "~/.server/userGetters";
import {
  addDaysToDate,
  generateWeek,
  getMonday,
} from "~/components/dash/agenda/agendaUtils";
import SimpleBigWeekView from "~/components/dash/agenda/SimpleBigWeekView";
import WeekSelector from "~/components/dash/agenda/WeekSelector";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  const orgServices = await db.service.findMany({
    where: {
      orgId: org.id,
    },
  });
  const orgIds = orgServices.map((org) => org.id);
  const yesterday = new Date();
  yesterday.setDate(new Date().getDate() - 1);
  const events = await db.event.findMany({
    where: {
      serviceId: {
        in: orgIds,
      },
      start: {
        gt: yesterday,
      },
    },
  });
  return { events };
};

export default function Page() {
  const { events } = useLoaderData<typeof loader>();
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
      <WeekSelector />
      <SimpleBigWeekView events={events} />
      {/* <Paginator
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
      /> */}
      {/* </Suspense> */}
    </>
  );
}
