// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { redirect } from "react-router";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { completeWeek } from "@hectorbliss/denik-calendar";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { db } from "~/utils/db.server";
import { Calendar as SimpleBigWeekView } from "@hectorbliss/denik-calendar";
import { WeekSelector } from "~/components/dash/agenda/WeekSelector";
import { Spinner } from "~/components/common/Spinner";
import { type Event } from "@prisma/client";
import { EventFormDrawer } from "~/components/forms/EventFormDrawer";
import { newEventSchema } from "~/utils/zod_schemas";
import { ClientFormDrawer } from "~/components/forms/ClientFormDrawer";
import type { Route } from "./+types/dash.agenda";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add_event") {
    const { org, user } = await getUserAndOrgOrRedirect(request);
    const validData = newEventSchema.parse(
      JSON.parse(formData.get("data") as string)
    );

    await db.event.create({
      data: {
        ...validData,
        orgId: org.id,
        userId: user.id,
        title: "Nuevo evento",
      },
    });
  }

  if (intent === "remove_block") {
    const id = formData.get("eventId") as string;
    const block = await db.event.findUnique({ where: { id } });
    if (block?.type === "BLOCK") {
      await db.event.delete({ where: { id } });
    }
  }

  if (intent === "add_block") {
    const start = formData.get("start") as string;
    const d = new Date(start);
    d.setMinutes(0);
    const { org, user } = await getUserAndOrgOrRedirect(request);
    /**
     * 1. create block event
     */
    await db.event.create({
      data: {
        type: "BLOCK",
        start: d,
        orgId: org.id,
        userId: user.id,
      },
    });
    throw redirect("/dash/agenda?success=1");
  }

  if (intent === "move_event") {
    const eventId = formData.get("eventId") as string;
    const newStart = formData.get("newStart") as string;

    // Update the event's start time
    await db.event.update({
      where: { id: eventId },
      data: { start: new Date(newStart) },
    });

    return { success: true };
  }

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
      include: {
        service: true,
      },
    });
    return { events };
  }
  return null;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request, {
    redirectURL: "/signup/1",
  });
  const yesterday = new Date();
  yesterday.setDate(new Date().getDate() - 1);
  const events = await db.event.findMany({
    where: {
      orgId: org.id,
      archived: false,
    },
    include: { service: true },
  });
  const customers = await db.customer.findMany({
    take: 1,
    where: {
      orgId: org.id,
    },
  });

  const employees = await db.user.findMany({
    take: 1,
    where: {
      orgId: org.id,
    },
  });

  const services = await db.service.findMany({
    take: 1,
    where: {
      orgId: org.id,
    },
  });

  return { events, customers, services, employees };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, customers, services, employees } = loaderData;
  const [week, setWeek] = useState(completeWeek(new Date()));
  const fetcher = useFetcher();
  const [weekEvents, setWeekEvents] = useState(events);
  const [editableEvent, setEditableEvent] = useState<Partial<Event> | null>(
    null
  );

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
        monday: w[0] as string,
        sunday: w[w.length - 1] as string,
      },
      {
        method: "post",
        // encType: "application/json"
      }
    );
  };

  useEffect(() => {
    if (fetcher.data?.events?.length > 0) {
      setWeekEvents(fetcher.data.events);
    }
  }, [fetcher]);

  useEffect(() => {
    setWeekEvents(events);
  }, [events]);

  const handleEventClick = (event: Event) => {
    setEditableEvent(event);
  };

  const handleNewEvent = (date: Date) => {
    setEditableEvent({ start: date });
  };

  // Optimistic update when moving events via drag & drop
  const handleEventMove = (eventId: string, newStart: Date) => {
    // Optimistic update
    setWeekEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, start: newStart } : event
      )
    );
    // Persist to server
    fetcher.submit(
      { intent: "move_event", eventId, newStart: newStart.toISOString() },
      { method: "POST" }
    );
  };

  const handleAddBlock = (start: Date) => {
    fetcher.submit(
      { intent: "add_block", start: start.toISOString() },
      { method: "POST" }
    );
  };

  const handleRemoveBlock = (eventId: string) => {
    // Optimistic update
    setWeekEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    );
    // Persist to server
    fetcher.submit(
      { intent: "remove_block", eventId },
      { method: "POST" }
    );
  };

  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false);
  const handleNewClientClick = () => {
    setShowNewClientDrawer(true);
  };

  return (
    <>
      <RouteTitle>Mi agenda {week[0].getFullYear()}</RouteTitle>
      {fetcher.state !== "idle" && <Spinner />}
      <WeekSelector onClick={handleWeekNavigation} week={week} />
      <SimpleBigWeekView
        onNewEvent={handleNewEvent}
        events={weekEvents}
        date={week[0]}
        onEventClick={handleEventClick}
        onEventMove={handleEventMove}
        onAddBlock={handleAddBlock}
        onRemoveBlock={handleRemoveBlock}
      />
      <EventFormDrawer
        services={services}
        employees={employees}
        customers={customers}
        onClose={() => setEditableEvent(null)}
        event={editableEvent}
        isOpen={!!editableEvent}
        onNewClientClick={handleNewClientClick}
      />
      <ClientFormDrawer
        onClose={() => setShowNewClientDrawer(false)}
        isOpen={showNewClientDrawer}
      />
    </>
  );
}
