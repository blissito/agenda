import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import {
  getServices,
  getUserAndOrgOrRedirect,
  getUserOrRedirect,
} from "~/.server/userGetters";
import {
  addDaysToDate,
  completeWeek,
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
  const [week, setWeek] = useState(completeWeek(new Date()));
  // const fetcher = useFetcher();
  const { events } = useLoaderData<typeof loader>();
  const handleWeekNavigation = (direction: -1 | 1) => {
    let d;
    if (direction < 0) {
      d = new Date(week[0]);
      d.setDate(d.getDate() - 2);
    } else {
      d = new Date(week[week.length - 1]);
      d.setDate(d.getDate() + 1);
    }
    setWeek(completeWeek(d));
  };

  return (
    <>
      <RouteTitle>
        Mi agenda {new Date(events[0]?.start || undefined).getFullYear()}
      </RouteTitle>
      <WeekSelector onClick={handleWeekNavigation} week={week} />
      <SimpleBigWeekView events={events} date={week[0]} />
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
