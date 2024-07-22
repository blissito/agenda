import { twMerge } from "tailwind-merge";
import {
  createContext,
  MouseEvent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BasicBoxType, Day, generateWeekGrid } from "./agendaUtils";
import { HourOrDay, useCoordinates } from "~/components/hooks/useCoordinates";
// animation stuff
import { motion, useDragControls, useMotionValue } from "framer-motion";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Cell = {
  index: number;
  dateNumber: number;
  startDate: Date;
  endDate: Date;
  day: string;
  hour: number;
  mins: number;
  month: number;
  x: number;
  y: number;
  year: number;
  rect: Rect;
};

export const GridContext = createContext<{
  hours: HourOrDay[];
  days: HourOrDay[];
  week: Day[];
}>({
  week: [],
  hours: [],
  days: [],
});

const getElementByCoords = ({
  list,
  x,
  y,
}: {
  x: number;
  y: number;
  list: Cell[];
}) => {
  return list.find((el) => el.x === x && el.y === y);
};

export const CalendarGrid = ({
  events = [],
  week = [],
  days = [],
  hours = [],
  grid,
}: {
  grid?: "half" | "quarter";
  events: BasicBoxType[];
  hours: string[];
  week: Day[];
  days: string[];
}) => {
  const factor = grid === "quarter" ? 4 : grid === "half" ? 2 : 1;
  // =====
  const [list, setList] = useState(
    generateWeekGrid({ daysLength: days.length, days, factor, hours, week })
  );
  const [rects, setRects] = useState<Rect[]>(
    [...Array(list.length).keys()].fill({})
  );
  const [extra, setExtra] = useState<BasicBoxType[]>([]);
  const [blocks, setBlocks] = useState<BasicBoxType[]>([]);

  useEffect(() => {
    setList(
      generateWeekGrid({ daysLength: days.length, days, factor, hours, week })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);
  // =====
  // const virtualMatrixRef = createRef();
  const checkIfIsToday = (date: Date) =>
    date.getDate() === new Date().getDate() &&
    date.getMonth() === new Date().getMonth();

  const handleClick = (index: number) => {
    // fixind date
    const selected = list[index];
    const startDate = new Date(
      selected.year,
      selected.month,
      selected.dateNumber,
      selected.hour,
      Number(selected.mins)
    );
    const endDate = new Date(
      selected.year,
      selected.month,
      selected.dateNumber,
      selected.hour + 1,
      Number(selected.mins)
    );
    selected.startDate = startDate;
    selected.endDate = endDate;

    setExtra((ex) => [
      ...ex,
      {
        ...selected,
        x: selected.x + 1, //offset
        y: selected.y + 1, //offset
      },
    ]);
  };

  const updateListElement = (index: number, rect: Rect) => {
    rects[index] = rect;
    setRects(rects);
  };

  const handleBlock = (cube: Cell) => {
    setBlocks((blocks) => {
      return [...blocks, { ...cube, x: cube.x - 1, y: cube.y - 1 }]; // offset improve @todo
    });
    setExtra([]);
  };

  return (
    <>
      <GridContext.Provider
        value={{
          week,
          hours: hours.map((h) => ({
            number: Number(h.replace(":00", "")),
            string: h,
          })),
          days,
          events,
          rects,
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
            {/* <ColumnsContainer
              grid={grid}
              rowNumber={hours.length}
              columnNumber={days.length}
            >
              {events.map((event) => (
                <Event key={event.id} event={event} />
              ))}
            </ColumnsContainer> */}

            <div
              className="grid w-full border-r border-b border-dotted relative"
              style={{
                gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${hours.length * 4}, minmax(0, 1fr))`,
              }}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${
                    hours.length * 4
                  }, minmax(0, 1fr))`,
                }}
              >
                {extra.map((cube, i) => (
                  <SelectionCube
                    onBlock={() => handleBlock(cube)}
                    cube={cube}
                    key={i}
                    onCancel={() => setExtra([])}
                  />
                ))}
                {blocks.map((cell, i) => (
                  <Blocked list={list} factor={factor} key={i} cell={cell} />
                ))}
                {/* {extra.map((event) => (
                  <Event
                    transition={{ type: "linear" }}
                    event={event}
                    onDragEnd={(_, { point }) => onDragEnd(point)}
                    layout
                    drag
                    // dragSnapToOrigin
                    key={event.title}
                    style={{
                      gridColumnStart: event.x,
                      gridRowStart: event.y,
                      gridRowEnd: event.y + factor,
                      // gridRowEnd: event.y,
                      resize: "vertical",
                    }}
                  />
                ))} */}
              </div>

              {/* Hovered grid  */}
              {list.map((it, i) => (
                <Cell
                  index={i}
                  key={i}
                  onClick={() => handleClick(i)}
                  updateRect={(rect) => updateListElement(i, rect)}
                ></Cell>
              ))}
            </div>
          </article>
        </div>
      </GridContext.Provider>
    </>
  );
};

// @TODO: rezise observer api
export const Blocked = ({
  cell,
  list,
  factor = 1,
}: {
  list: Cell[];
  factor: number;
  cell: Cell;
}) => {
  const { rects, days } = useContext(GridContext);
  const [updated, setUpdated] = useState(cell);

  function getIndexByEndDate(endDate: Date) {
    const endHours = new Date(endDate).getHours();
    const endMinutes = new Date(endDate).getMinutes();
    const elem = list.find(
      (el) => el.hour === endHours && Number(el.mins) === endMinutes
    );
    return elem?.y;
  }

  const handleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const height = useMotionValue(rects[0].height * factor);
  // const bg = useMotionValue("rgba(256,256,256)");

  let nodes = [];
  const backToNormal = (node) => {
    nodes.map((n) => {
      n.style.background = "inherit";
    });
    nodes = [];
  };

  console.log("UPDATED:", updated);
  return (
    <motion.div
      layout
      transition={{ type: "spring", bounce: 0 }}
      drag
      // draggable
      onDrag={async (e) => {
        if (e.target.dataset.index) {
          e.target.style.backgroundColor = "#F5F5F5";
          nodes.push(e.target);
          await new Promise((r) => setTimeout(r, 300));
          backToNormal(e.target);
          // experiemnt
          const index = e.target.dataset.index;

          // setUpdated({
          //   ...list[index],
          //   startDate: new Date( // @todo save endDate correctly
          //     list[index].year,
          //     list[index].month,
          //     list[index].dateNumber,
          //     list[index].hour,
          //     list[index].mins
          //   ),
          // });
        }
      }}
      // whileDrag={{ scale: 0.7 }}
      // whileTap={{ scale: 0.7 }}
      onDragStart={(e) => {
        setIsDragging(true);
      }}
      onDragEnd={(e) => {
        // @TODO endDate must be generateds
        const index = e.target.dataset.index;
        setIsDragging(false);
        if (!index) return;

        setUpdated({
          ...list[index],
          startDate: new Date( // @todo save endDate correctly
            list[index].year,
            list[index].month,
            list[index].dateNumber,
            list[index].hour,
            list[index].mins
          ),
          // endDate: new Date( // @todo save endDate correctly
          //   list[index].year,
          //   list[index].month,
          //   list[index].dateNumber,
          //   list[index].hour
          // ),
        });
      }}
      // onDrag={(e) => {
      //   e.target.style.border = "2px solid yellow";
      // }}
      // dragConstraints={{ top: -5, bottom: 5, left: -5, right: 5 }}
      dragSnapToOrigin
      dragMomentum={false}
      ref={handleRef}
      style={{
        originY: 0,
        height,
        gridColumnStart: updated.x + 1,
        gridRowStart: updated.y + 1,
        // gridRowEnd: cell.y + factor, // @TODO: respect
      }}
      className={twMerge(
        "bg-gray-400 w-full h-full rounded-lg relative z-20 cursor-grab active:cursor-grabbing active:z-50 overflow-hidden",
        isDragging && "pointer-events-none", // trick to catch overHoverElement
        "min-h-7"
      )}
    >
      <span className="text-xs text-gray-500 px-2">Blockeado</span>
      <motion.div
        drag="y"
        dragSnapToOrigin
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0}
        onDragStart={(e) => {
          setIsDragging(true);
        }}
        onDrag={(obj: MouseEvent, { delta }) => {
          const h = height.get() + delta.y;
          height.set(h < rects[0].height ? rects[0].height : h);
        }}
        onDragEnd={(e) => {
          const index = Number(e.target.dataset.index);
          setIsDragging(false);
          const cell = list[index];
          if (!cell) return;
          const endDate = new Date(
            cell.year,
            cell.month,
            cell.dateNumber,
            cell.hour,
            cell.mins
          );
          const portion = Math.floor(height.get() / rects[0].height);
          height.set(portion < 1 ? rects[0].height : portion * rects[0].height);
          setUpdated((up) => ({ ...up, endDate })); // update enddate
        }}
        className={twMerge(
          "h-2 bg-indigo-500 absolute left-0 right-0 bottom-0 z-30 cursor-row-resize",
          isDragging && "pointer-events-none"
        )}
      />
    </motion.div>
  );
};

export const SelectionCube = ({
  cube,
  onCancel,
  onBlock,
}: {
  onBlock?: () => void;
  onCancel?: () => void;
  cube: Cell;
}) => {
  useEffect(() => {
    const handleKeyDown = ({ key }) => {
      if (key === "Escape") {
        onCancel?.();
      }
    };
    addEventListener("keydown", handleKeyDown);
    return () => removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="bg-indigo-100/80 relative z-50"
      style={{ gridColumnStart: cube.x, gridRowStart: cube.y }}
    >
      <div className="absolute bottom-[-300%] rounded-2xl shadow-xl flex flex-col items-center w-full bg-white z-10 border">
        <button
          onClick={onBlock}
          className="active:bg-indigo-100/50  hover:bg-indigo-100/30 w-full rounded-lg p-2"
        >
          Bloquear
        </button>
        <button className="active:bg-indigo-100/50  hover:bg-indigo-100/30 w-full p-2">
          Reservar
        </button>
      </div>
    </div>
  );
};

export const Event = ({
  event,
  type = "Event",
  ...props
}: {
  type?: string;
  event: BasicBoxType;
  props?: unknown;
}) => {
  const { days, hours } = useContext(GridContext);
  const columnIndex =
    days.findIndex((day) => new Date(event.date).getDate() === day.number) + 1; // from date.getDate() + 1
  const rowIndex =
    hours.findIndex((hour) => new Date(event.date).getHours() === hour.number) +
    1; // from date.getHours()
  return (
    <motion.button
      drag
      dragSnapToOrigin
      className="bg-brand_yellow w-full h-full rounded-lg relative z-20 overflow-hidden cursor-grab active:cursor-grabbing active:z-50"
      style={{ gridColumnStart: columnIndex, gridRowStart: rowIndex }}
      {...props}
    >
      <div className="absolute left-0 top-0 w-[5px] bg-yellow-500 h-full" />
      {/* Evento {date.toLocaleDateString()} */}
    </motion.button>
  );
};

export const ColumnsContainer = ({
  rowNumber = 4,
  columnNumber = 7,
  children,
  grid,
}: {
  grid?: "quarter" | "half";
  rowNumber?: number;
  columnNumber?: number;
  children: ReactNode;
}) => {
  const [created, setCreated] = useState<ReactNode[]>([]);
  const { days, hours } = useContext(GridContext);
  // here, we need to know the column based in day of week or date?
  const getColumnFromDate = (date: Date): number | undefined => {
    const theDate = new Date(date);
    const dateNumber = theDate.getDate();
    return days.findIndex((day) => day.number === dateNumber);
  };
  const factor = grid === "quarter" ? 4 : grid === "half" ? 2 : 1;
  // const eventNodes = Children.toArray(children).filter(
  //   (child) => child.props.type === "Event"
  // );

  const getMinsByFactor = () =>
    grid === "quarter" ? 45 : grid === "half" ? 30 : 0;

  const handleClick = (x: number, y: number) => {
    // console.log({ x, y });
    const hourIndex = Math.ceil(y / factor) - 1;
    const residuo = y / factor + 1;
    let mins = (residuo % Math.floor(residuo)) * 60 - 15;
    mins = mins < 0 ? getMinsByFactor() : mins;
    const hour = hours[hourIndex];
    // console.log("Time:", `${hour.number}:${mins}`);

    const event: BasicBoxType = {
      // date: new Date(2024, 6, date, hours, mins),
      title: "Nuevo",
      id: Date.now(),
    };
    setCreated((elements) => [
      ...elements,
      <Event key={event.id} event={event} />,
    ]);
  };

  return (
    <section
      className="grid w-full rounded-lg relative border-b border-dotted border-r"
      style={{
        gridTemplateColumns: `repeat(${columnNumber}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rowNumber * factor}, minmax(0, 1fr))`,
      }}
    >
      <VirtualGrid
        onClick={handleClick}
        columnNumber={columnNumber}
        rowNumber={rowNumber}
        factor={factor}
      />
      {/* Events */}
      {children}
      {created}
    </section>
  );
};

export const VirtualGrid = ({
  rowNumber = 4,
  columnNumber = 7,
  onClick,
  factor = 1,
}: {
  factor?: number;
  rowNumber?: number;
  columnNumber?: number;
  onClick?: (x: number, y: number) => void;
}) => {
  const map = useRef([]);

  const setCurrentCell = (index: number) => {
    map.current.unshift(index);
    map.current = [...new Set(map.current)];
    // console.log("current: ", index, map);
  };

  return (
    <div
      className="absolute inset-0 bg-white grid rounded-lg z-0"
      style={{
        gridTemplateColumns: `repeat(${columnNumber}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rowNumber * factor}, minmax(0, 1fr))`,
      }}
    >
      {[...Array(columnNumber * rowNumber * factor).keys()].map((i) => {
        const x = i % columnNumber;
        const y = Math.ceil(i / columnNumber);
        return (
          <Cell
            style={{
              gridColumnStart: x,
              gridRowStart: y,
            }}
            key={i}
            onClick={() => onClick?.(x, y, i)}
            // time={`${}`}
          />
        );
      })}
    </div>
  );
};

// function isColliding(source, sample, threshold = 0.5) {
//   return (
//     source.x < sample.x + sample.width - threshold * sample.width &&
//     source.x + source.width > sample.x + threshold * sample.width &&
//     source.y < sample.y + sample.height - threshold * sample.height &&
//     source.y + source.height > sample.y + threshold * sample.height
//   );
// }

export const Cell = ({
  index,
  updateRect,
  onClick,
  ...props
}: {
  updateRect?: (arg0: Rect) => void;
  index?: number;
  onClick?: () => void;
  props?: any;
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let rect: Rect | DOMRect | undefined = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rect = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    } as Rect;
    updateRect?.(rect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.button
      data-index={index}
      onDrop={() => console.log("drop")}
      onDragEnter={(e) => {
        e.preventDefault();
        console.log("enter?");
        setIsOver(true);
      }}
      onDragOver={(e) => {
        console.log("over?");
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={(e) => {
        console.log("leave?");
        e.preventDefault();
        setIsOver(false);
      }}
      ref={ref}
      initial={{ opacity: 1 }}
      onClick={onClick}
      whileHover={{ backgroundColor: "#ddd", opacity: 0.2 }}
      className={twMerge(
        "border-l-[.5px] border-t-[.5px] border-dotted cursor-crosshair z-10"
        // "hover:bg-blue-500"
      )}
      {...props}
    />
  );
};

export const Column = ({
  rowStart = 1,
  rowNumber,
  index,
}: {
  index: number;
  rowStart?: number;
  rowNumber?: number;
}) => {
  // here, we need to know row based in time and mins
  return (
    <section
      className="bg-indigo-500 grid"
      style={{ gridRow: `${rowStart} / span ${rowNumber}` }}
    >
      {[...Array(rowNumber).keys()].map((i: number) => (
        <motion.div
          drag
          dragConstraints={{ top: -100, bottom: 100, left: -100, right: 100 }}
          className="bg-yellow-400 border-orange-500 border flex items-center justify-center"
          key={i}
        >
          X: {index}, Y: {i}
        </motion.div>
      ))}
    </section>
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
  grid,
  ...props
}: {
  length?: number;
  isFirst?: boolean;
  props?: any;
  grid?: "half" | "quarter";
}) => (
  <article>
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

    <div {...props} className=""></div>
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

  // console.log("CONTROLS: ", dragControls);

  if (!isVisible) return null;
  return (
    <motion.div
      drag
      // dragConstraints={{ top: 200 }}
      whileTap={{ boxShadow: "0px 0px 15px rgba(0,0,0,0.2)" }}
      dragControls={dragControls}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      dragSnapToOrigin
      // whileDrag={{ scale: 1.1 }}
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
