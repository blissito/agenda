import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import { twMerge } from "tailwind-merge";
import { PrimaryButton } from "~/components/common/primaryButton";
import { getUserOrNull } from "~/db/userGetters";

import {
  ClientForm,
  DateAndTimePicker,
  ServiceList,
  Success,
} from "~/components/forms/agenda/DateAndTimePicker";
import { useForm } from "react-hook-form";
import { WeekDaysType } from "~/components/forms/form_handlers/aboutYourCompanyHandler";
import {
  addMinutesToDate,
  fromDateToTimeString,
  getDaysInMonth,
} from "~/components/dash/agenda/agendaUtils";
import { Event } from "@prisma/client";
// @TODO: validate date and time is in the future
// @TODO: Improve mobile UX
const example =
  "https://img.freepik.com/vector-gratis/vector-degradado-logotipo-colorido-pajaro_343694-1365.jpg?size=338&ext=jpg";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "date_time_selected") {
    const data = JSON.parse(formData.get("data") as string);
    const user = await getUserOrNull(request);
    const service = await db.service.findUnique({
      where: { slug: params.serviceSlug },
    });
    // @TODO: Validation????? 🤬
    const evnt = {
      start: data.date,
      duration: service?.duration,
      end: addMinutesToDate(data.date, service?.duration),
      serviceId: service?.id,
      userId: user?.id, // @TODO: Improve
      title: service?.name,
      // orgId: "prueba",
    };
    const event = await db.event.create({
      data: evnt,
    });
    return { screen: "form", eventId: event.id };
  }
  if (intent === "save_customer") {
    const data = JSON.parse(formData.get("data") as string);
    const user = await getUserOrNull(request);

    const newData = {
      customer: {
        loggedUserId: user?.id,
        displayName: data.displayName,
        email: data.email,
        tel: data.tel,
        comments: data.comments,
      },
    };
    const event = await db.event.update({
      where: { id: data.eventId },
      data: newData,
    });
    if (!event) throw json(null, { status: 404 });
    const url = new URL(request.url);
    url.searchParams.set("eventId", event.id);

    return redirect(url.toString());
  }
  console.info("MISSED::INTENT:: ", intent);
  return null;
};

export const weekDictionary = {
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábado",
  0: "domingo",
};

const getAvailableDays = (weekDays: WeekDaysType) => {
  // 1.- Map over the month?
  let days = getDaysInMonth(new Date()); // @TODO: better get grid?
  const daysInNextMonth = getDaysInMonth(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1)
  );
  const daysInAnotherMonth = getDaysInMonth(
    new Date(new Date().getFullYear(), new Date().getMonth() + 2)
  );
  // @TODO: Re-visit this, including just 3 months...
  days = days.concat(daysInNextMonth).concat(daysInAnotherMonth);
  const availableDays = days
    .filter((day) => {
      const date = new Date(day);
      const includedDays = Object.keys(weekDays);
      const today = new Date();
      if (
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime() <
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ).getTime()
      ) {
        return false; // not yesterday ✅
      }
      return includedDays.includes(weekDictionary[date.getDay()]);
    })
    .map((d) => `${d.getMonth()}/${d.getDate()}`);
  // console.log("Available", availableDays.length);
  // console.log("DAYS: ", days);

  // 2.- group them up
  // console.log("Dates: ", availableDays);
  // 3.- if week includes day:
  // 3.1.- save in available
  // 3.2.- ^ this with days for now. 👷🏼‍♂️
  return availableDays;
};

const getScheduledDates = (events: Event[]) => {
  if (!events || !events.length) return [];
  const obj: { [x: string]: Record<string, string[]> } = { "0": { "1": [] } };
  events.forEach((e) => {
    // @TODO: get locale from client
    console.log("EL GUARDADO:", e.start);
    // const month = new Date(e.start).toLocaleString("es-MX").split("/")[1];
    const month = new Date(e.start).getMonth();
    console.log("El month: ", month);
    const date = new Date(e.start).getDate();
    console.log("El date: ", date);
    // {date,strings}
    // const timeString = fromDateToTimeString(e.start);
    const timeString = e.start;
    console.log("LOCALETIMESTRING: ", timeString);
    obj[month] ||= { "1": [] };
    obj[month][date] ||= [];
    obj[month][date] = [...new Set([...obj[month][date], timeString])]; // Avoiding repeatition
  });
  return obj;
}; // returns {7:{28:['16:45','09:00']}}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // experimenting with available days
  //@TODO: if user, use it to not ask user data
  const orgSlug = params.orgSlug;
  const org = await db.org.findUnique({ where: { slug: orgSlug } });
  if (!org) throw json(null, { status: 404 });
  const service = await db.service.findUnique({
    where: {
      slug: params.serviceSlug,
    },
    include: {
      events: {
        where: {
          status: "ACTIVE", // chulada 🤤
        },
      },
    },
  });

  if (!service) return json(null, { status: 404 });
  // availability stuff
  const availableDays = getAvailableDays(
    (service.weekDays || org.weekDays) as WeekDaysType
  );
  const scheduledDates = getScheduledDates(service.events);
  const event = url.searchParams.has("eventId") // coming from form action
    ? await db.event.findUnique({
        where: { id: url.searchParams.get("eventId") || undefined },
      })
    : null;

  return {
    scheduledDates,
    availableDays,
    event, // If event will show success screen ✅
    org,
    service,
  };
};

export default function Page() {
  const { org, service, event, availableDays, scheduledDates } =
    useLoaderData<typeof loader>();

  const [currentScreen, setCurrentScreen] = useState<
    "picker" | "form" | "success"
  >("picker");
  const [eventId, setEventId] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const handleTimeChange = (time: string) => {
    clearErrors();
    setTime(time);
    setValue("time", time, { shouldValidate: true });
    // update date
    setDate((d) => {
      d?.setHours(Number(time.split(":")[0]));
      d?.setMinutes(Number(time.split(":")[1]));
      return d;
    });
  };

  const handleDateChange = (selectedDate: Date) => {
    clearErrors();
    setTime("");
    setValue("time", "", { shouldValidate: true });
    setDate(selectedDate);
    setValue("date", selectedDate.toString(), { shouldValidate: true });
  };

  const {
    formState: { errors, isValid },
    setError,
    setValue,
    getValues,
    clearErrors,
  } = useForm({
    defaultValues: {
      date: "",
      time: "",
    },
  });
  const fetcher = useFetcher<typeof action>();
  const onSubmit = () => {
    const values = getValues();
    if (!values.date) return setError("date", { message: "Selecciona un día" });
    if (!values.time)
      return setError("time", { message: "Selecciona una hora" });
    fetcher.submit(
      {
        intent: "date_time_selected",
        data: JSON.stringify({ date: new Date(date).toISOString() }), // iso for mongodb? No.
      },
      { method: "post" }
    );
    setCurrentScreen("form");
  };

  useEffect(() => {
    if (fetcher.data?.screen === "form") {
      // change screen after post
      setCurrentScreen(fetcher.data?.screen);
      setEventId(fetcher.data.eventId);
    }
    if (fetcher.data?.screen === "success") {
      setCurrentScreen(fetcher.data?.screen);
    }
  }, [fetcher]);

  if (event)
    return (
      <Success
        onFinish={() => {
          setCurrentScreen("picker");
          setDate(null);
        }} // @TODO: improve with redirection from server on button submit
        org={org}
        event={event}
        service={service}
      />
    );

  console.log("??", scheduledDates);

  return (
    <article className=" bg-[#f8f8f8] min-h-screen h-screen">
      <div className="flex gap-3 items-center justify-center py-12">
        <img
          className="w-8 rounded-full"
          alt="org logo"
          src={org?.logo || example}
        />
        <h1 className="font-bold text-sm ">{org?.name}</h1>
      </div>
      <main className="bg-white shadow mx-auto rounded-xl p-6 w-[90%] md:w-fit">
        <section className={twMerge("flex flex-col md:flex-row")}>
          <div className="w-full max-w-[200px]">
            <span className="text-brand_gray text-xs font-thin">
              {org?.name}
            </span>
            <h2 className="text-lg font-medium mb-5">{service?.name}</h2>
            <ServiceList org={org} service={service} date={date || undefined} />
          </div>
          <hr className="border-l-brand_gray/10 md:my-0 md:h-44 md:w-1 w-full my-4 border-l md:mr-8 " />
          {currentScreen === "picker" && (
            <DateAndTimePicker
              scheduledDates={scheduledDates}
              weekDays={service.weekDays || org.weekDays}
              duration={service.duration}
              availableDays={availableDays}
              onDateChange={handleDateChange}
              onTimeChange={handleTimeChange}
              selectedDate={date}
              time={time}
            />
          )}
          {currentScreen === "form" && <ClientForm eventId={eventId} />}
        </section>

        {currentScreen === "picker" &&
          date && ( // @TODO move this into pciker form
            <>
              <p className="text-red-500 ml-auto text-xs pr-8 text-right h-1">
                {errors.time?.message}
                {errors.date?.message}
              </p>
              <PrimaryButton
                isLoading={fetcher.state !== "idle"}
                isDisabled={!isValid}
                onClick={onSubmit}
                className="ml-auto mr-6 mb-6 mt-14"
              >
                Continuar
              </PrimaryButton>
            </>
          )}
      </main>
    </article>
  );
}
//
