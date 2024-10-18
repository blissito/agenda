import { ClientActionFunctionArgs, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { completeWeek } from "~/components/dash/agenda/agendaUtils";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { db } from "~/utils/db.server";
import { SimpleBigWeekView } from "~/components/dash/agenda/SimpleBigWeekView";
import { WeekSelector } from "~/components/dash/agenda/WeekSelector";
import { Spinner } from "~/components/common/Spinner";

export const action = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "fetch_week") {
    const { org } = await getUserAndOrgOrRedirect(request);
    const orgServices = await db.service.findMany({
      where: {
        orgId: org.id,
      },
    });
    const serviceIds = orgServices.map((org) => org.id);
    const monday = new Date(formData.get("monday") as string);
    const sunday = new Date(formData.get("sunday") as string);
    const events = await db.event.findMany({
      where: {
        serviceId: {
          in: serviceIds,
        },
        start: {
          gte: monday,
          lte: sunday,
        },
      },
    });
    return { events };
  }
  return null;
};

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
  const fetcher = useFetcher();
  const { events } = useLoaderData();
  const [weekEvents, setWeekEvents] = useState(events);

  const handleWeekNavigation = (direction: -1 | 1) => {
    let d;
    if (direction < 0) {
      d = new Date(week[0]);
      d.setDate(d.getDate() - 2);
    } else {
      d = new Date(week[week.length - 1]);
      d.setDate(d.getDate() + 1);
    }
    const w = completeWeek(d);
    setWeek(w);
    fetcher.submit(
      {
        intent: "fetch_week",
        monday: w[0],
        sunday: w[w.length - 1],
      },
      { method: "post" }
    );
  };

  useEffect(() => {
    if (fetcher.data?.events?.length > 0) {
      setWeekEvents(fetcher.data.events);
    }
  }, [fetcher]);

  return (
    <>
      <RouteTitle>
        Mi agenda {new Date(events[0]?.start || undefined).getFullYear()}
      </RouteTitle>
      <WeekSelector onClick={handleWeekNavigation} week={week} />
      {fetcher.state !== "idle" && <Spinner />}
      <SimpleBigWeekView events={weekEvents} date={week[0]} />
    </>
  );
}
