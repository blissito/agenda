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
import DatePicker from "react-datepicker";
import { PiCalendarCheckBold } from "react-icons/pi";
import "react-datepicker/dist/react-datepicker.css";
import { SubmitHandler, useForm, UseFormHandleSubmit } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { getUserOrNull } from "~/db/userGetters";
import { BasicInput } from "~/components/forms/BasicInput";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";

// @TODO: validate date and time is in the future

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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  //@TODO: if user, use it to not ask user data
  const orgSlug = params.orgSlug;
  const org = await db.org.findUnique({ where: { slug: orgSlug } });
  if (!org) throw json(null, { status: 404 });
  const event = url.searchParams.has("eventId")
    ? await db.event.findUnique({
        where: { id: url.searchParams.get("eventId") || undefined },
      })
    : null;
  // @TODO: create Service model
  return {
    event,
    org,
    service: {
      duration: 45,
      price: 499,
      currency: "MXN",
      employeeName: "Brenda Ortega",
      address: "Av. Guerrero #224, col. centro, CDMX. México",
    },
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
    console.log("FETC: ", fetcher);
    if (fetcher.data?.screen === "form") {
      console.log("FETCHERDATA: ", fetcher.data);
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
      <main className="bg-white shadow md:mx-auto mx-2 max-w-3xl rounded-xl pb-1">
        <section
          className={twMerge(
            "",
            "flex flex-col md:flex-row gap-4 justify-center",
            "rounded-xl max-w-3xl md:mx-auto h-[40%] mx-2 p-5"
          )}
        >
          <div className="w-full max-w-[200px]">
            <span className="text-brand_gray text-xs font-thin">
              {org?.name}
            </span>
            <h2 className="text-lg font-medium mb-5">Clase de viola</h2>
            <ServiceList service={service} date={date || undefined} />
          </div>
          <div className="">
            <hr className="border-l mb-8 border-l-brand_gray/10 h-full mx-6" />
          </div>
          {currentScreen === "picker" && (
            <DateAndTimePicker
              onDateChange={handleDateChange}
              onTimeChange={handleTimeChange}
              time={time}
            />
          )}
          {currentScreen === "form" && <ClientForm eventId={eventId} />}
        </section>

        <p className="text-red-500 ml-auto text-xs pr-8 text-right h-1">
          {errors.time?.message}
          {errors.date?.message}
        </p>
        {currentScreen === "picker" && ( // @TODO move this into pciker form
          <PrimaryButton
            isDisabled={!isValid}
            onClick={onSubmit}
            className="ml-auto mr-6 mb-6 mt-14"
          >
            Continuar
          </PrimaryButton>
        )}
      </main>
    </article>
  );
}
//

const Success = ({ event }: { event?: Event }) => {
  return (
    <div>
      Success {event?.title}
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

// Calendar picker and time
const DateAndTimePicker = ({
  onDateChange,
  onTimeChange,
  time,
}: {
  time?: string;
  onTimeChange?: (arg0: string) => void;
  onDateChange: (arg0: Date) => void;
}) => {
  return (
    <article>
      <h3 className="text-sm font-bold mb-5">Selecciona una fecha y horario</h3>
      <section className="flex items-center gap-12">
        <Suspense
          fallback={<span className="text-xs font-thin">cargando...</span>}
        >
          <DatePicker
            name="date"
            minDate={new Date()}
            // swapRange
            // selected={startDate}
            // onChange={onChange}
            // startDate={startDate}
            // endDate={endDate}
            // excludeDates={[addDays(new Date(), 1), addDays(new Date(), 5)]}
            // selectsRange
            // selectsDisabledDaysInRange
            inline
            // selected={new Date()}
            onChange={onDateChange}
          />
        </Suspense>
        <div>
          <h4 className="text-xs font-medium mb-4">Selecciona una:</h4>
          <div className="grid grid-cols-2 gap-y-1 gap-x-2">
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
        </div>
      </section>
    </article>
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
      const merid = h > 12 ? "pm" : "am";
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
        isActive && "bg-brand_blue/50 text-white border-transparent",
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
      <AnimatePresence>
        {date && (
          <ServiceListItem
            text={date?.toLocaleString()}
            icon={<PiCalendarCheckBold />}
          />
        )}
        <ServiceListItem text={`Sesión de ${service.duration} minutos`} />
        <ServiceListItem
          icon={<FaMoneyBill />}
          text={`$${service.price} ${service.currency?.toLocaleLowerCase()}`}
        />
        <ServiceListItem
          icon={<HiOutlineIdentification />}
          text={`Con ${service.employeeName} `}
        />
        <ServiceListItem icon={<FiMapPin />} text={service.address as string} />
      </AnimatePresence>
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
