import { ReactNode, useEffect, useRef, useState } from "react";
import { Form, useFetcher } from "@remix-run/react";
import { FaClock, FaMoneyBill } from "react-icons/fa";
import { Event, Org, Service } from "@prisma/client";
import { FiMapPin } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { HiOutlineIdentification } from "react-icons/hi2";
import { PrimaryButton } from "~/components/common/primaryButton";
import { PiCalendarCheckBold } from "react-icons/pi";
import { SubmitHandler, useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { BasicInput } from "~/components/forms/BasicInput";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import {
  areSameDates,
  fromMinsToTimeString,
  generateSecuense,
  getDaysInMonth,
  isToday,
} from "~/components/dash/agenda/agendaUtils";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";
import { cn } from "~/utils/cd";
import { WeekDaysType } from "../form_handlers/aboutYourCompanyHandler";
import { weekDictionary } from "~/routes/agenda.$orgSlug.$serviceSlug";

// Calendar picker and time
export const DateAndTimePicker = ({
  onDateChange,
  weekDays,
  duration = 60,
  selectedDate,
  onTimeChange,
  time,
  availableDays,
}: {
  weekDays: WeekDaysType;
  duration?: number;
  availableDays?: Date[];
  selectedDate: Date | null;
  time?: string;
  onTimeChange?: (arg0: string) => void;
  onDateChange: (arg0: Date) => void;
}) => {
  const [times, setTimes] = useState(["08:00"]);
  const handleDayPress = (date: Date) => {
    onDateChange?.(date);
    updateTimes(date);
  };

  // const times = ["08:00", "09:15", "10:00", "12:30", "13:00", "15:45", "16:00"];
  // This is good stuff: 🔥🤓
  const updateTimes = (date: Date) => {
    // 0.- get the
    // console.log("Dict: ", weekDictionary[new Date(date).getDay()]);
    // console.log("Weekdays: ", weekDays);
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
      ).map(fromMinsToTimeString);
      slots = slots.concat(secuence);
    });
    // here we have the general all.

    setTimes(slots);
    // @TODO: Filter already reserved !!
    // 2.- get the reserved
    // 3.- filter
    // 4.- update times
  };

  // console.log("Valid dates?", availableDays, weekDays); //??

  return (
    <main className="min-w-fit">
      {/* <AnimatePresence> */}
      <h3 className="text-sm font-bold mb-5">Selecciona una fecha y horario</h3>
      <article className={twMerge("flex-1", "md:flex md:w-fit gap-6")}>
        <section className="w-full">
          <MonthView
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
            validDates={availableDays}
          />
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
              {times.map((t) => (
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
  validDates?: (Date | string)[];
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
  const hack = useRef(0);
  const [date, set] = useState(defaultDate);
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
  const monthName = monthNames[date.getMonth()];
  const nodes = getDaysInMonth(date).map((_date: Date) => {
    const isPartOfTheMonth = new Date(_date).getMonth() == date.getMonth();
    const handleClick = () => {
      onDayPress?.(_date);
    };
    const isAvailable = validDates
      .map((d) => new Date(d).toString())
      .includes(new Date(_date).toString());
    const isSelected = areSameDates(_date, selectedDate);
    return (
      <button
        onClick={handleClick}
        disabled={!isAvailable}
        key={nanoid()}
        // date={_date} // extra data just in case. It can be data-date={_date}
        className={cn(
          "text-sm italic text-neutral-400 rounded-full md:px-2 py-1 m-1 transition-all flex justify-center items-center", // basic
          isPartOfTheMonth && "text-neutral-800", // styles when part of the current month
          validDates.includes(_date.toString())
            ? "bg-brand_blue/10 text-neutral-800"
            : "disabled:text-neutral-800/50 disabled:pointer-events-none", // styles when part of the list or DISABLED! <= @TODO: review again
          isToday(_date)
            ? "bg-brand_blue/60 text-white disabled:text-white"
            : "hover:bg-brand_blue hover:text-white", // styles when current selected date
          {
            "bg-brand_blue/20": isAvailable,
            "bg-brand_blue text-white": isSelected,
          }
        )}
      >
        {_date.getDate()}
      </button>
    );
  });

  const monthNavigate = (offset: number = 1) => {
    // hack => improve
    if (offset > 0) {
      if (hack.current > 2) return;
      hack.current += 1;
    } else {
      hack.current -= 1;
    }
    const nextDate = new Date(
      date.getFullYear(),
      date.getMonth() + offset,
      date.getDate()
    );
    set(nextDate);
  };

  const isCurrentMonth = () => {
    const currentMonth = new Date().getMonth();
    const selectedMonth = new Date(date || new Date()).getMonth();
    return currentMonth === selectedMonth;
  };

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
        <h3 className="capitalize text-xs font-medium mx-8">
          {monthName} {date.getFullYear()}
        </h3>
        <button className="mr-auto" onClick={() => monthNavigate(1)}>
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
      <div className="relative">
        <img
          alt="illustration"
          src={"/images/illustrations/success_check.svg"}
        />
        {on && (
          <img
            className="absolute inset-0 animate-ping"
            alt="illustration"
            src={"/images/illustrations/success_check.svg"}
          />
        )}
      </div>
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
          org={org}
          service={{ ...service }}
          date={new Date(event.start)}
        />
      </div>
      {/* @TODO: link to another schedule */}
      <PrimaryButton
        onClick={() => onFinish()}
        as="Link"
        to={getCTALink()}
        className="mt-12 py-4 w-full md:w-[200px] transition-all"
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

export const ServiceList = ({
  service,
  date,
  org,
}: {
  org: Org;
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
        text={`Con ${org?.shopKeeper || service.employeeName} `}
      />
      <ServiceListItem
        icon={<FiMapPin />}
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
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: 10 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <span className="text-lg">{icon}</span>
      {text}
    </motion.div>
  );
};
