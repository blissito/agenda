import { twMerge } from "tailwind-merge";
import {
  createContext,
  createRef,
  ReactNode,
  Ref,
  useContext,
  useState,
} from "react";
import { BasicBoxType, Day } from "./agendaUtils";
import { HourOrDay, useCoordinates } from "~/components/hooks/useCoordinates";
// animation stuff
import { motion, useDragControls } from "framer-motion";

export const GridContext = createContext<{
  hours: HourOrDay[];
  days: HourOrDay[];
  week: Day[];
}>({
  week: [],
  hours: [],
  days: [],
});

export const CalendarGrid = ({
  boxes = [],
  week = [],
  days = [],
  hours = [],
}: {
  boxes: BasicBoxType[];
  hours: string[];
  week: Day[];
  days: string[];
}) => {
  const virtualMatrixRef = createRef();
  const checkIfIsToday = (date: Date) =>
    date.getDate() === new Date().getDate() &&
    date.getMonth() === new Date().getMonth();

  return (
    <>
      <GridContext.Provider
        value={{
          week,
          hours: hours.map((h) => ({
            number: Number(h.replace(":00", "")),
            string: h,
          })),
          days: week
            .map((w) =>
              days.includes(w.day) // filtering not required days
                ? {
                    number: new Date(w.date).getDate(),
                    string: w.day,
                  }
                : null
            )
            .filter(Boolean),
        }}
      >
        <div className="bg-white rounded-2xl mt-6 mr-10 pr-6 pb-6 shadow-md ">
          {/* days and date */}
          <div className="flex pl-20">
            {week
              .filter((d) => days.includes(d.day))
              .map(({ day, date }, index) => {
                const isToday = checkIfIsToday(date);
                return (
                  <h6
                    key={index}
                    className={twMerge(
                      "w-full text-center grid gap-2 mt-5 mb-3 text-gray-500 "
                    )}
                  >
                    <span className={twMerge(isToday && "text-brand_blue")}>
                      {day}
                    </span>
                    <span
                      className={twMerge(
                        isToday && "bg-brand_blue rounded-full text-white"
                      )}
                    >
                      {new Date(date).getDate()}
                    </span>
                  </h6>
                );
              })}
          </div>

          <article className="flex">
            {/* Times */}
            <section>
              {hours.map((hour, index) => (
                <p key={index} className="h-24 pl-6 pr-3 py-2 text-gray-700">
                  <span>{hour}</span>
                </p>
              ))}
            </section>
            {/* Grid container */}
            <section className="flex-1 relative">
              {/* Events */}
              <VirtualMatrix>
                {/* {boxes.map((box, i) => (
                  <BasicBox box={box} key={i} />
                ))} */}
                <BasicBox
                  constrains={virtualMatrixRef}
                  key="perro"
                  box={{
                    date: new Date("2024-07-10T01:00:00.000+06:00"),
                    title: "BLISSMO",
                  }}
                />
              </VirtualMatrix>
              {/* Actual grid */}
              {hours.map((_, index) => (
                <Row length={days.length} key={index} isFirst={index === 0} />
              ))}
              {/* <Indicator week={week} hours={hours} length={days.length} /> */}
            </section>
          </article>
        </div>
      </GridContext.Provider>
    </>
  );
};

export const Indicator = ({
  week = [],
  length = 6,
  colIndex,
  hours,
}: {
  hours: string[];
  week?: Day[];
  colIndex?: number;
  rowIndex?: number;
  index?: number;
  length?: number;
}) => {
  const today = new Date(
    new Date().toLocaleString("en", { timeZone: "America/Mexico_City" })
  );

  // console.log("TODAY: ", today);

  const hour = today.getHours();
  const minutes = today.getMinutes();

  const getHourIndex = () =>
    hours
      .map((h) => Number(h.replace(":00", "")))
      .findIndex((el) => el == hour);

  const isTodayInWeek = week.some(
    (day) =>
      day.date.getDate() === today.getDate() &&
      day.date.getMonth() === today.getMonth()
  );
  const [dayIndex] = useState(colIndex || today.getDay() - 1);
  const rIndex = getHourIndex();

  return (
    <div
      className={twMerge(
        "absolute w-full top-0 left-0 rounded",
        !isTodayInWeek && "hidden"
      )}
    >
      <div
        style={{
          width: `${100 / length}%`,
          top: 96 * rIndex + minutes,
          left: (100 / length) * dayIndex + "%",
        }}
        className="bg-brand_blue h-[1px] relative"
      >
        <div className="h-2 w-2 rounded-full bg-brand_blue -top-1 left-[-1px] absolute" />
      </div>
    </div>
  );
};

export const Row = ({
  length = 7,
  isFirst,
  ...props
}: {
  length?: number;
  isFirst?: boolean;
  props?: any;
}) => (
  <article className="relative">
    {/* @TODO: move this to global CSS */}
    <style>
      {`
    .dashed-bottom-border{
      border-bottom: 1px dashed #e5e7eb;
    }
    .dashed-top-border{
      border-top: 1px dashed #e5e7eb;
    }
    `}
    </style>

    <div {...props} className="flex border-l bg-red-500 min-w-[100px]">
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className={twMerge(
            "dashed-bottom-border",
            "w-full h-24 bg-white border border-l-0 border-gray-200 border-t-0",
            isFirst && "border-t dashed-top-border"
          )}
        />
      ))}
    </div>
  </article>
);

const VirtualMatrix = ({ children }: { children: ReactNode }) => {
  const { hours, days } = useContext(GridContext);

  return (
    <div
      className={twMerge(
        "grid gap-[1px]",
        "z-10",
        "h-full absolute top-0 left-0 w-full"
      )}
      style={{
        gridTemplateColumns: `repeat(${days.length}, 1fr)`,
        gridTemplateRows: `repeat(${hours.length}, 1fr)`,
      }}
      id="virtual-row-blissmo"
    >
      {children}
    </div>
  );
};

// necesitamos transladar date => {day(date), time(hour)} =>x,y

const BasicBox = ({
  // constrains,
  box = { date: new Date() },
  ...props
}: {
  // constrains: Ref;
  props?: any;
  box: BasicBoxType;
}) => {
  const { x, y, isVisible } = useCoordinates({ date: box.date });

  const dragControls = useDragControls();

  function startDrag(event) {
    dragControls.start(event, { snapToCursor: true });
  }

  console.log("CONTROLS: ", dragControls);

  if (!isVisible) return null;
  return (
    <motion.div
      drag
      // dragConstraints={{ top: 200 }}
      whileTap={{ boxShadow: "0px 0px 15px rgba(0,0,0,0.2)" }}
      dragControls={dragControls}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      dragSnapToOrigin
      whileDrag={{ scale: 1.1 }}
      onDragStart={(e) => {
        e.target.classList.remove("cursor-grab");
        e.target.classList.add("bg-gray-200");
        e.target.classList.add("cursor-grabbing");
      }}
      onDragEnd={(e) => {
        e.target.classList.remove("bg-gray-200");
        e.target.classList.remove("cursor-grabbing");
        e.target.classList.add("cursor-grab");
        e.target.classList.add("bg-brand_yyellow");
      }}
      // dragConstraints={constrains}
      {...props}
      style={{
        gridColumnStart: x,
        gridRowStart: y,
      }}
      className={twMerge(
        "relative rounded-xl overflow-hidden bg-brand_yellow pb-4 px-3",
        // "w-full h-[90%]",
        "cursor-grab"
      )}
    >
      <h6 className="text-sm"> {box.title}</h6>
      <p className="text-gray-400 text-xs truncate">{box.text}</p>
      <div className="absolute left-0 top-0 w-[5px] bg-yellow-500 h-full" />
    </motion.div>
  );
};
