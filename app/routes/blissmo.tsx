import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
// import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { createRef, useEffect, useMemo, useRef } from "react";
//
import Calendar from "@event-calendar/core";
import TimeGrid from "@event-calendar/time-grid";
import "@event-calendar/core/index.css";

// Styles
import "react-big-calendar/lib/css/react-big-calendar.css";
import { PrismaClient } from "@prisma/client";

export const loader = async (props: LoaderFunctionArgs) => {
  const prisma = new PrismaClient();
  const day = new Date();
  day.setDate(new Date().getDate() + 1);
  // set hour @TODO
  // const event = await db.event.create({
  //   data: {
  //     end: day,
  //     start: day,
  //     title: "EXAMPLE Event",
  //   },
  // });
  const myEvents = await prisma.event.findMany();
  return { myEvents };
};

export default function Page() {
  const { myEvents } = useLoaderData<typeof loader>();

  // const localizer = momentLocalizer(moment);
  // const { defaultDate } = useMemo(
  //   () => ({
  //     defaultDate: new Date(),
  //   }),
  //   []
  // );
  const nodeRef = useRef<HTMLDivElement>(null);
  const ec = useRef();

  useEffect(() => {
    ec.current = new Calendar({
      target: nodeRef.current,
      // target: document.createElement("div"),
      props: {
        plugins: [TimeGrid],
        options: {
          view: "timeGridWeek",
          events: [
            // List of events
            ...myEvents,
          ],
        },
      },
    });
  }, []);

  return (
    <article>
      <div ref={nodeRef} />
      {/* <Calendar
        defaultDate={defaultDate}
        localizer={localizer}
        events={myEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100vh" }}
      /> */}
    </article>
  );
}
