import { type ReactNode, useState } from "react";
import { FaClock } from "react-icons/fa";
import { type Org, type Service } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import {
  from12To24,
  fromMinsToLocaleTimeString,
  generateSecuense,
} from "~/components/dash/agenda/agendaUtils";
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
