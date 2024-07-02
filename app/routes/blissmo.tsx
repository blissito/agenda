import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { useMemo } from "react";

// Styles
import "react-big-calendar/lib/css/react-big-calendar.css";

export const loader = async (props: LoaderFunctionArgs) => {
  const day = new Date();
  day.setDate(new Date().getDate() + 1);
  // set hour @TODO
  const event = await db.event.create({
    data: {
      end: day,
      start: day,
      title: "EXAMPLE Event",
    },
  });
  return { myEvents: [event] };
};

export default function Page() {
  const { myEvents } = useLoaderData<typeof loader>();
  console.log("EVENTS: ", myEvents);
  const localizer = momentLocalizer(moment);
  const { defaultDate } = useMemo(
    () => ({
      defaultDate: new Date(),
    }),
    []
  );
  return (
    <article>
      <Calendar
        defaultDate={defaultDate}
        localizer={localizer}
        events={myEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100vh" }}
      />
    </article>
  );
}
