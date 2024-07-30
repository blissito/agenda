import { ReactNode, Suspense, useEffect, useState } from "react";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import { FaClock, FaMoneyBill } from "react-icons/fa";
import { Event, Service } from "@prisma/client";
import { FiMapPin } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { HiOutlineIdentification } from "react-icons/hi2";
import { PrimaryButton } from "~/components/common/primaryButton";
import { PiCalendarCheckBold } from "react-icons/pi";
import { SubmitHandler, useForm, UseFormHandleSubmit } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { getUserOrNull } from "~/db/userGetters";
import { BasicInput } from "~/components/forms/BasicInput";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { es } from "date-fns/locale";
import {
  areSameDates,
  generateWeek,
  getDaysInMonth,
  isToday,
} from "~/components/dash/agenda/agendaUtils";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";

// @TODO: get service from db
const fakeService = {
  duration: 45,
  price: 499,
  currency: "MXN",
  employeeName: "Brenda Ortega",
  address: "Av. Guerrero #224, col. centro, CDMX. México",
};
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
    console.log("Created: ", event);
    return redirect(url.toString());
  }
  console.info("MISSED::INTENT:: ", intent);
  return null;
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  //@TODO: if user, use it to not ask user data
  const orgSlug = params.orgSlug;
  const org = await db.org.findUnique({ where: { slug: orgSlug } });
  if (!org) throw json(null, { status: 404 });
  const event = url.searchParams.has("eventId") // coming from form action
    ? await db.event.findUnique({
        where: { id: url.searchParams.get("eventId") || undefined },
      })
    : null;
  // @TODO: create Service model
  console.log("event: ", event);
  return {
    event, // If event will show success screen
    org,
    service: fakeService,
  };
};

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<
    "picker" | "form" | "success"
  >("picker");
  const [eventId, setEventId] = useState<string | null>(null);
  const { org, service, event } = useLoaderData<typeof loader>();
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
      console.log("SUCCESS");
      setCurrentScreen(fetcher.data?.screen);
    }
  }, [fetcher]);

  if (event) return <Success event={event} />;

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
            <h2 className="text-lg font-medium mb-5">Clase de viola</h2>
            <ServiceList service={service} date={date || undefined} />
          </div>
          <hr className="border-l-brand_gray/10 md:my-0 md:h-44 md:w-1 w-full my-4 border-l md:mr-8 " />
          {currentScreen === "picker" && (
            <DateAndTimePicker
              selectedDate={date}
              onDateChange={handleDateChange}
              onTimeChange={handleTimeChange}
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

// Calendar picker and time
const DateAndTimePicker = ({
  onDateChange,
  selectedDate,
  onTimeChange,
  time,
}: {
  selectedDate: Date | null;
  time?: string;
  onTimeChange?: (arg0: string) => void;
  onDateChange: (arg0: Date) => void;
}) => {
  const handleDayPress = (date) => {
    onDateChange?.(date);
  };

  return (
    <main id="perro" className="min-w-fit">
      {/* <AnimatePresence> */}
      <h3 className="text-sm font-bold mb-5">Selecciona una fecha y horario</h3>
      <article className={twMerge("flex-1", "md:flex md:w-fit gap-6")}>
        <section className="w-full">
          <MonthView selectedDate={selectedDate} onDayPress={handleDayPress} />
        </section>
        {selectedDate && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            // className="w-full"
            className={
              twMerge()
              // selectedDate ? "block transition-all" : "hidden"
            }
          >
            <h4 className="text-xs font-medium my-4">Selecciona una:</h4>
            <div className="grid md:w-44 grid-cols-3 md:grid-cols-2 gap-x-3 gap-y-2 place-content-center">
              {[
                "08:00",
                "09:15",
                "10:00",
                "12:30",
                "13:00",
                "15:45",
                "16:00",
              ].map((t) => (
                <TimeButton
                  key={nanoid()}
                  defaultValue={t}
                  isActive={time === t}
                  onChange={onTimeChange}
                  meridiem
                />
              ))}
            </div>
          </motion.section>
        )}
      </article>
      {/* </AnimatePresence> */}
    </main>
  );
};
// const tool = new Date();
const vDates = [
  new Date(2024, 5, 30),
  new Date(2024, 6, 8),
  new Date(2024, 6, 5),
  // new Date(2024, 6, 26),
];
const MonthView = ({
  selectedDate,
  validDates = [...vDates.map((dat) => dat.toString())],
  defaultDate = new Date(),
  onDayPress,
}: // @TODO: limit prev month and next month (if dates not available?) min, max dates?
// currentDate = new Date(),
{
  selectedDate: Date | null;
  onDayPress?: (date: Date) => void;
  defaultDate?: Date;
}) => {
  const monthNames = [
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
  const [date, set] = useState(defaultDate);
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
  const monthName = monthNames[date.getMonth()];
  const nodes = getDaysInMonth(date).map((_date: Date) => {
    const isPartOfTheMonth = new Date(_date).getMonth() == date.getMonth();
    if (_date.getTime() === date.getTime()) {
      console.log("DATE: ", date);
    }

    const handleClick = (_d: Date) => {
      onDayPress?.(_d);
    };

    return (
      <button
        onClick={() => handleClick(_date)}
        disabled={!validDates.includes(_date.toString())}
        key={nanoid()}
        // date={_date} // extra data just in case. It can be data-date={_date}
        className={twMerge(
          "text-sm italic text-neutral-400 rounded-full md:px-2 py-1 m-1 transition-all flex justify-center items-center", // basic
          isPartOfTheMonth && "text-neutral-800", // styles when part of the current month
          validDates.includes(_date.toString())
            ? "bg-brand_blue/10 text-neutral-800"
            : "disabled:text-neutral-800/50 disabled:pointer-events-none", // styles when part of the list or DISABLED! <= @TODO: review again
          isToday(_date)
            ? "bg-brand_blue/60 text-white disabled:text-white"
            : "hover:bg-brand_blue hover:text-white", // styles when current selected date
          areSameDates(_date, selectedDate) && "bg-brand_blue text-white"
        )}
      >
        {_date.getDate()}
      </button>
    );
  });

  const handleNext = (offset: number = 1) => {
    const nextDate = new Date(
      date.getFullYear(),
      date.getMonth() + offset,
      date.getDate()
    );
    set(nextDate);
  };

  return (
    <div className="min-w-60">
      <nav className="flex justify-between items-center mb-6">
        <button onClick={() => handleNext(-1)} className="ml-auto">
          <IoChevronBackOutline />
        </button>
        <h3 className="capitalize text-xs font-medium mx-8">
          {monthName} {date.getFullYear()}
        </h3>
        <button className="mr-auto" onClick={() => handleNext(1)}>
          <IoChevronForward />
        </button>
      </nav>
      <div className="grid grid-cols-7 text-center font-thin italic text-xs">
        {dayNames.map((dayName) => (
          <span className="text-brand_blue/70" key={nanoid()}>
            {dayName}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">{nodes}</div>
    </div>
  );
};

const Success = ({ event }: { event: Event }) => {
  return (
    <div className="flex h-screen flex-col items-center text-brand_gray bg-[#f8f8f8] px-2">
      <img alt="illustration" src={"/images/illustrations/success_check.svg"} />
      <h1 className="text-xl font-bold mb-4 text-neutral-900 text-center">
        ¡{event.customer.displayName} tu cita ha sido agendada!
      </h1>
      <p className="mb-8 text-center">
        Enviamos la información de la cita a{" "}
        <strong className="font-bold">{event.customer.email}</strong>
      </p>
      <div className="w-70 rounded-xl mx-auto bg-white shadow p-6 ">
        <h2 className="font-bold text-neutral-900 mb-4">{event.title}</h2>
        <ServiceList
          service={{ ...fakeService }}
          date={new Date(event.start)}
        />
      </div>
      {/* @TODO: link to another schedule */}
      <PrimaryButton className="mt-12 py-4 w-full md:w-[200px] transition-all">
        Agendar otra cita
      </PrimaryButton>
      <p className="text-neutral-400 text-xs mt-24 max-w-[600px] mx-auto">
        Recuerda que tu compra es válida para el servicio y horario en el que
        reservaste. Para cambios o cancelación ponte en contacto con Estudio
        Milán. Deník solo actúa como intermediario en la gestión y procesamiento
        de reservas.
      </p>
      <EmojiConfetti />
    </div>
  );
};

const ClientForm = ({ eventId }: { eventId: string }) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      displayName: "",
      email: "",
      tel: "",
      comments: "",
    },
  });
  const fetcher = useFetcher();
  const onSubmit = (
    values: SubmitHandler<{
      displayName: string;
      email: string;
      tel: string;
      comments: string;
    }>
  ) => {
    fetcher.submit(
      { data: JSON.stringify({ ...values, eventId }), intent: "save_customer" },
      { method: "post" }
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <BasicInput
        name="displayName"
        label="Nombre"
        placeholder="Nombre completo"
        register={register}
        error={errors["displayName"]}
      />
      <div className="flex justify-between gap-4 flex-col md:flex-row">
        <BasicInput
          name="email"
          label="Email"
          type="email"
          placeholder="ejemplo@ejemplo.com"
          register={register}
        />
        <BasicInput
          label="Teléfono"
          name="tel"
          placeholder="555 555 55 66"
          register={register}
        />
      </div>
      <BasicInput
        register={register}
        name="comments"
        label="Notas o comentarios"
        as="textarea"
        placeholder="Cualquier cosa que ayude a prepararnos para nuestra cita"
        registerOptions={{ required: false }}
      />
      <PrimaryButton
        isDisabled={!isValid}
        type="submit"
        // isDisabled={!isValid}
        // onClick={onSubmit}
        className=" ml-auto mr-6 mb-6 mt-14 hover:shadow-md"
      >
        Continuar
      </PrimaryButton>
    </Form>
  );
};

const TimeButton = ({
  meridiem,
  className,
  defaultValue,
  isActive,
  onChange,
}: {
  onChange?: (arg0: string) => void;
  isActive?: boolean;
  defaultValue?: string;
  meridiem?: boolean;
  className?: string;
}) => {
  const formatTime = (time?: string) => {
    if (!time) return;
    if (meridiem) {
      const h = Number(time.split(":")[0]);
      const m = Number(time.split(":")[1]);
      const merid = h > 11 ? "pm" : "am";
      return `${h < 10 ? h : h > 12 ? h - 12 : h}:${
        m < 10 ? "0" + m : m
      } ${merid}`;
    }
    return time;
  };

  return (
    <label
      className={twMerge(
        "cursor-pointer transition-all",
        "flex justify-center",
        "text-xs text-brand_blue/90 py-1 px-4 text-nowrap rounded border border-brand_blue/30",
        isActive && "bg-brand_blue text-white border-transparent",
        !isActive && "hover:bg-brand_blue/10",
        className
      )}
    >
      {formatTime(defaultValue)}
      <input
        onChange={(e) => onChange?.(defaultValue || e.target.value)}
        defaultValue={defaultValue}
        className={twMerge(
          "hidden bg-transparent absolute"
          // "opacity-0"
        )}
        name="time"
        type="radio"
      />
    </label>
  );
};

const ServiceList = ({
  service,
  date,
}: {
  date?: Date;
  service: Partial<Service>;
}) => {
  return (
    <div className="text-xs text-brand_gray grid gap-3">
      {date && (
        <ServiceListItem
          key={"date"}
          text={date?.toLocaleString()}
          icon={<PiCalendarCheckBold />}
        />
      )}
      <ServiceListItem
        key={"duración"}
        text={`Sesión de ${service.duration} minutos`}
      />
      <ServiceListItem
        key={"amount"}
        icon={<FaMoneyBill />}
        text={`$${service.price} ${service.currency?.toLocaleLowerCase()}`}
      />
      <ServiceListItem
        key={"provider"}
        icon={<HiOutlineIdentification />}
        text={`Con ${service.employeeName} `}
      />
      <ServiceListItem
        icon={<FiMapPin />}
        text={service.address as string}
        key={"address"}
      />
    </div>
  );
};

const ServiceListItem = ({
  text,
  icon = <FaClock />,
}: {
  icon?: ReactNode;
  text?: string | number;
}) => {
  return (
    <motion.div
      key={text || nanoid()}
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: 10 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <span className="text-lg">{icon}</span>
      {text}
    </motion.div>
  );
};
