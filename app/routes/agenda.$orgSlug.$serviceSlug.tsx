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
import { getDaysInMonth } from "~/components/dash/agenda/agendaUtils";
// @TODO: validate date and time is in the future
// @TODO: Improve mobile UX
const example =
  "https://img.freepik.com/vector-gratis/vector-degradado-logotipo-colorido-pajaro_343694-1365.jpg?size=338&ext=jpg";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "date_time_selected") {
    const data = JSON.parse(formData.get("data") as string);
    const user = await getUserOrNull(request);
    // @TODO: get title from service
    const evnt = {
      start: data.date,
      duration: data.duration,
      service: undefined,
      userId: user?.id,
      title: "Servicio de prueba",
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
  const days = getDaysInMonth(new Date()); // @TODO: better get grid?
  const availableDays = days.filter((day) => {
    const date = new Date(day);
    const includedDays = Object.keys(weekDays);
    if (date.getTime() < new Date().getTime()) return false; // not yesterday ✅
    return includedDays.includes(weekDictionary[date.getDay()]);
  });
  // console.log("Available", availableDays.length);
  // console.log("DAYS: ", days);

  // 2.- group them up
  // console.log("Dates: ", availableDays);
  // 3.- if week includes day:
  // 3.1.- save in available
  // 3.2.- ^ this with days for now. 👷🏼‍♂️
  return availableDays;
};

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
  });
  if (!service) return json(null, { status: 404 });
  // availability stuff
  const availableDays = getAvailableDays(
    (service.weekDays || org.weekDays) as WeekDaysType
  );
  const event = url.searchParams.has("eventId") // coming from form action
    ? await db.event.findUnique({
        where: { id: url.searchParams.get("eventId") || undefined },
      })
    : null;

  return {
    availableDays,
    event, // If event will show success screen ✅
    org,
    service,
  };
};

export default function Page() {
  const { org, service, event, availableDays } = useLoaderData<typeof loader>();

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
        data: JSON.stringify({ date }), // iso for mongodb? No.
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

  if (event) return <Success event={event} service={service} />;

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
            <ServiceList service={service} date={date || undefined} />
          </div>
          <hr className="border-l-brand_gray/10 md:my-0 md:h-44 md:w-1 w-full my-4 border-l md:mr-8 " />
          {currentScreen === "picker" && (
            <DateAndTimePicker
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
