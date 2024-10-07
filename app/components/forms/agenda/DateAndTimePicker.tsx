import {
  ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Form, useFetcher } from "@remix-run/react";
import { FaClock, FaMoneyBill } from "react-icons/fa";
import { Event, Org, Service } from "@prisma/client";
import { FiMapPin } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { HiOutlineIdentification } from "react-icons/hi2";
import { PrimaryButton } from "~/components/common/primaryButton";
import { PiCalendarCheckBold } from "react-icons/pi";
import { SubmitHandler, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { BasicInput } from "~/components/forms/BasicInput";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import {
  areSameDates,
  from12To24,
  fromMinsToLocaleTimeString,
  generateSecuense,
  getDaysInMonth,
  isToday,
} from "~/components/dash/agenda/agendaUtils";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";
import { cn } from "~/utils/cd";
import { WeekDaysType } from "../form_handlers/aboutYourCompanyHandler";
import { Schedule } from "~/components/icons/appointment/schedule";
import { Clook } from "~/components/icons/appointment/clook";
import { Money } from "~/components/icons/appointment/money";
import { Id } from "~/components/icons/appointment/id";
import { Location } from "~/components/icons/appointment/location";
import { weekDictionary } from "~/routes/agenda.$orgSlug.$serviceSlug/utils";

// @TODO: Improve with date and time in route to generate specific links

// Calendar picker and time
export const DateAndTimePicker = ({
  onDateChange,
  scheduledDates = [],
  weekDays,
  duration = 60,
  selectedDate,
  onTimeChange,
  time,
  availableDays,
}: {
  scheduledDates?: { [x: string]: { [y: string]: string[] } }[];
  weekDays: WeekDaysType;
  duration?: number;
  availableDays?: Date[];
  selectedDate: Date | null;
  time?: string;
  onTimeChange?: (arg0: string) => void;
  onDateChange: (arg0: Date) => void;
}) => {
  // console.log("?????", scheduledDates, scheduledDates["8"]["28"]);
  const [times, setTimes] = useState([]);
  const handleDayPress = (date: Date) => {
    onDateChange?.(date);
    updateTimes(date);
  };

  // const times = ["08:00", "09:15", "10:00", "12:30", "13:00", "15:45", "16:00"];
  // @TODO: when no times to show disable the day 😒 server side?
  // This is good stuff: 🔥🤓
  const updateTimes = (date: Date) => {
    // 0.- get the
    // console.log("Dict: ", weekDictionary[new Date(date).getDay()]);
    // console.log("Weekdays: ", weekDays);
    // already sheduled

    const today = new Date();
    const isToday =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).getTime() ===
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const range = weekDays[weekDictionary[new Date(date).getDay()]]; // improve
    // console.log("Range: ", range);
    const minutes = range.map((tuple: string[]) =>
      tuple.map((string) => Number(string.split(":")[0]) * 60)
    );

    let slots: string[] = [];
    minutes.forEach((tuple: number[]) => {
      const secuence = generateSecuense(
        tuple[0],
        tuple[1],
        duration,
        isToday ? today.getHours() * 60 + today.getMinutes() : undefined // minimum minutes (filter v1)
      ).map(fromMinsToLocaleTimeString); // 17:00:00, 9:00:00
      slots = slots.concat(secuence);
    });
    // here we have the general all.
    const month = String(new Date(date).getMonth()); // @TODO: maybe from dateString to match perfectly?
    const day = String(new Date(date).getDate());

    // this is because server sent iso dates and we need locales
    const localeStrings = !scheduledDates[month]
      ? []
      : !scheduledDates[month][day]
      ? []
      : scheduledDates[month][day];
    const notAvailableStrings = localeStrings;

    slots = slots.filter((slot) => !notAvailableStrings?.includes(slot));
    setTimes(slots);
    // @TODO: Filter already reserved !!
    // 2.- get the reserved
    // 3.- filter
    // 4.- update times
  };

  // console.log("Valid dates?", availableDays, weekDays); //??

  return (
    <main className="min-w-fit ">
      <h3 className="text-base font-bold mb-8">
        Selecciona una fecha y horario
      </h3>
      <article className={twMerge("flex-1", "md:flex md:w-fit gap-6")}>
        <section className="w-full">
          <MonthView
            // selectedDate={selectedDate}
            onDayPress={handleDayPress}
            validDates={availableDays}
          />
        </section>
        {selectedDate && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            // className="w-full"
            className={twMerge(" px-6")}
          >
            <h4 className="text-base font-medium mb-4 ">
              Selecciona un horario:
            </h4>
            <div className="grid md:w-44 grid-cols-3 md:grid-cols-2 gap-x-3 gap-y-2 place-content-center">
              <AnimatePresence>
                {times.map((t, i) => (
                  <TimeButton
                    key={i}
                    defaultValue={t}
                    isActive={time === from12To24(t)}
                    onChange={onTimeChange}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </article>
      {/* </AnimatePresence> */}
    </main>
  );
};

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
// const tool = new Date();
const vDates = [
  new Date(2024, 5, 30),
  new Date(2024, 6, 8),
  new Date(2024, 6, 5),
  // new Date(2024, 6, 26),
];
export const MonthView = ({
  selectedDate,
  validDates = [...vDates.map((dat) => dat.toString())],
  defaultDate = new Date(),
  onDayPress,
  maxDate,
}: // @TODO: limit prev month and next month (if dates not available?) min, max dates?
// currentDate = new Date(),
{
  selectedDate?: Date | null;
  onDayPress?: (date: Date) => void;
  defaultDate?: Date;
  validDates?: (Date | string)[];
  maxDate?: Date;
}) => {
  const [currentMonth, setCurrentMonth] = useState(defaultDate.getMonth());
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

  const getIsDisabled = (_date: Date) => {
    if (!_date) return;
    if (!maxDate) return;
    const maxMonth = maxDate.getMonth();
    return _date.getMonth() > maxMonth;
  };

  const handleClick = () => {
    onDayPress?.(_date);
  };

  const getNodes = (monthDate: Date) =>
    getDaysInMonth(monthDate).map((_date: Date) => {
      const isPartOfTheMonth =
        new Date(_date).getMonth() == monthDate.getMonth();

      const isDisabled = getIsDisabled(_date);
      // const isSelected = areSameDates(_date, selectedDate);
      return (
        <button
          // onClick={handleClick}
          // disabled={isDisabled}
          key={nanoid()}
          className={cn(
            "text-base italic text-neutral-400 rounded-full md:px-2 py-1 m-1 h-9 transition-all flex justify-center items-center", // basic
            isPartOfTheMonth && "text-brand_dark", // styles when part of the current month
            isToday(_date)
              ? "bg-[#E7EFFD] text-brand_blue disabled:text-white"
              : "hover:bg-brand_blue hover:text-white", // styles when current selected date
            {
              // " text-brand_gray bg-[#D2E2FF]": !isDisabled, // @todo is available
              // "bg-brand_blue text-white": isSelected,
              "disabled:text-brand_iron/30 disabled:line-through disabled:pointer-events-none":
                isDisabled,
            }
          )}
        >
          {_date.getDate()}
        </button>
      );
    });

  const [nodes, setNodes] = useState(getNodes(new Date()));

  const updateNodes = (_date: Date) => {
    console.log("Date?? ", _date);
    // console.log(getDaysInMonth(_date));
    setNodes(getNodes(_date));
  };

  const monthNavigate = (direction = 1) => {
    const d = new Date(new Date().getFullYear(), currentMonth, 1);
    d.setMonth(currentMonth);
    if (direction > 0) {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentMonth(d.getMonth());
    updateNodes(d);
  };

  const isCurrentMonth = () => currentMonth === new Date().getMonth();

  return (
    <div className="min-w-60">
      <nav className="flex justify-between items-center mb-6">
        <button
          disabled={isCurrentMonth()}
          onClick={() => monthNavigate(-1)}
          className="ml-auto disabled:text-gray-500"
        >
          <IoChevronBackOutline />
        </button>
        <h3 className="capitalize text-base text-brand_dark font-satoMiddle mx-8">
          {monthNames[currentMonth]} {new Date().getFullYear()}
        </h3>
        <button className="mr-auto" onClick={() => monthNavigate(1)}>
          <IoChevronForward />
        </button>
      </nav>
      <div className="grid grid-cols-7 text-center font-thin italic text-sm">
        {dayNames.map((dayName) => (
          <span className="text-gray-600 text-base " key={nanoid()}>
            {dayName}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-sm font-satoshi mt-2">{nodes}</div>
    </div>
  );
};

export const Success = ({
  event,
  service,
  onFinish,
  org,
}: {
  onFinish: () => void;
  org: Org;
  service: Service;
  event: Event;
}) => {
  const [on, set] = useState(true);
  useEffect(() => {
    setTimeout(() => set(false), 4000);
  }, []);
  const getCTALink = () => {
    return `/agenda/${org.slug}/${service.slug}`;
  };
  return (
    <div className="flex h-screen flex-col items-center text-brand_gray bg-[#f8f8f8] px-2 md:py-20">
      <img
        alt="denik markwater"
        className="absolute right-0 bottom-0 z-0 w-[45%] lg:w-auto"
        src="/images/denik-markwater.png"
      />
      <div className="relative">
        <img
          className="w-[240px] h-[240px]"
          alt="illustration"
          src="/images/confetti.gif"
        />
        {/* {on && (
          <img
            className="absolute inset-0 animate-ping"
            alt="illustration"
            src={"/images/illustrations/success_check.svg"}
          />
        )} */}
      </div>
      <h1 className="text-2xl font-bold mb-4 text-brand_dark text-center">
        ¡{event.customer?.displayName} tu cita ha sido agendada!
      </h1>
      <p className="mb-8 text-center text-lg">
        Enviamos la información de la cita a{" "}
        <strong className="font-bold font-satoMiddle">
          {event.customer?.email}
        </strong>
      </p>
      <div className="w-96 rounded-xl mx-auto bg-white shadow p-6 ">
        <h2 className="font-satoMedium font-bold text-xl md:text-2xl text-brand_dark mb-4">
          {event.title}
        </h2>
        <ServiceList
          org={org}
          service={{ ...service }}
          date={event.formatedDate}
        />
      </div>
      {/* @TODO: link to another schedule */}
      <PrimaryButton
        onClick={() => onFinish()}
        as="Link"
        to={getCTALink()}
        className="mt-12 py-4 w-[90%] mx-auto md:w-[160px] transition-all"
      >
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

export const ClientForm = ({
  eventId,
}: {
  onFinish: () => void;
  eventId: string;
}) => {
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
    <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col grow">
      <h3 className="text-base font-bold mb-8">Completa tu información</h3>
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
        isLoading={fetcher.state !== "idle"}
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
  className,
  defaultValue,
  isActive,
  onChange,
}: {
  onChange?: (arg0: string) => void;
  isActive?: boolean;
  defaultValue?: string;
  className?: string;
}) => {
  const formatTime = (time?: string) => {
    if (!time) return null;
    return time.replace(":00", "");
    // if (meridiem) {
    //   const h = Number(time.split(":")[0]);
    //   const m = Number(time.split(":")[1]);
    //   const merid = h > 11 ? "pm" : "am";
    //   return `${h < 10 ? h : h > 12 ? h - 12 : h}:${
    //     m < 10 ? "0" + m : m
    //   } ${merid}`;
    // }
    // return time;
  };

  return (
    <motion.label
      initial={{ opacity: 0, y: -10 }}
      exit={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        "cursor-pointer",
        "flex justify-center",
        "text-sm text-brand_blue/90 py-1 px-6 text-nowrap h-9 flex items-center justify-center rounded border border-brand_blue/30",
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
    </motion.label>
  );
};

export const ServiceList = ({
  service,
  date,
  org,
}: {
  service: Partial<Service>;
  org: Org;
  date?: Date;
}) => {
  return (
    <div className="text-xs text-brand_gray grid gap-3">
      {date && (
        <ServiceListItem
          key={"date"}
          text={date.toLocaleString("es-MX", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
          icon={<Schedule />}
        />
      )}
      <ServiceListItem
        key={"duración"}
        icon={<Clook />}
        text={`Sesión de ${service.duration} minutos`}
      />
      <ServiceListItem
        key={"amount"}
        icon={<Money />}
        text={`$${service.price} ${service.currency?.toLocaleLowerCase()}`}
      />
      <ServiceListItem
        key={"provider"}
        icon={<Id />}
        text={`Con ${org?.shopKeeper || service.employeeName} `}
      />
      <ServiceListItem
        icon={<Location />}
        text={
          (service.place === "ONLINE"
            ? "Online"
            : service.place === "ATHOME"
            ? "A domicilio"
            : service.address || org.address) as string
        }
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
      className="flex items-center gap-4 text-base font-satoshi"
      initial={{ opacity: 0, x: 10 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <span className="text-lg">{icon}</span>
      {text}
    </motion.div>
  );
};
