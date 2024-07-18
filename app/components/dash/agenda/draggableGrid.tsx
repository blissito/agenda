import { DragEvent, ReactNode, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { getCoord } from "~/components/dash/agenda/agendaUtils";
import { motion, Point } from "framer-motion";

// @TODO Allow multiple in same cell
export type CellData = {
  overIndex?: number | null;
  updateOverIndex?: (index: number) => void;
  index?: number;
  id: string;
  x?: number;
  y?: number;
};

export const testItems: CellData[] = [
  {
    x: 1,
    y: 2,
    id: "coords",
  },
  {
    index: 5,
    id: "name",
  },
  {
    index: 8,
    id: "nombre",
  },
  {
    index: 0,
    id: "Unnamed",
  },
  //   {
  //     index: 17,
  //     id: "Uno nuevo",
  //   },
];

export const Draggable = ({
  id = "",
  index,
  onDrop,
  children,
  className,
  onDrag,
  whileDrag = { opacity: 0.8 },
}: {
  whileDrag?: { opacity?: number; scale?: number; backgroundColor?: string };
  onDrag?: (index: number) => void;
  className?: string;
  children?: ReactNode;
  id?: string;
  index: number;
  onDrop: ({
    originIndex,
    dropIndex,
  }: {
    originIndex: number;
    dropIndex: number | undefined;
  }) => void;
  [x: string]: unknown;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const parent = useRef<HTMLDivElement | null>(null);
  const dragged = useRef<
    (Partial<EventTarget> & Partial<HTMLDivElement>) | null
  >(null);
  const drop = useRef<(Partial<EventTarget> & Partial<HTMLDivElement>) | null>(
    null
  );
  // const basicConstraint = 10;

  useEffect(() => {
    let p;
    p = ref.current?.parentNode?.parentNode; // Drawer > Cell > Draggable
    if (!p) {
      p = ref.current?.parentNode;
    }
    parent.current = p as HTMLDivElement;
  }, []);

  const resetPointerEventsAndSaveDrop = (target: EventTarget) => {
    dragged.current && dragged.current.style
      ? (dragged.current.style.pointerEvents = "inherit")
      : undefined;
    drop.current = target;

    onDrop?.({
      originIndex: index,
      dropIndex: isNaN(Number(drop.current?.dataset?.index))
        ? undefined
        : Number(drop.current?.dataset?.index),
    });
  };

  const handleStartDragging = (event: DragEvent<HTMLDivElement>) => {
    dragged.current = event.target;
    dragged.current && dragged.current.style
      ? (dragged.current.style.pointerEvents = "none")
      : undefined;
    setIsDragging(true);
  };

  const handleStopDragging = (
    event: DragEvent<HTMLDivElement>,
    { point }: { point: Point }
  ) => {
    setIsDragging(true);
    dragged.current && dragged.current.style
      ? (dragged.current.style.pointerEvents = "none")
      : undefined;
    const underlyingTarget = document.elementFromPoint(point.x, point.y);
    // console.log("Targ; ", underlyingTarget);
    if (!underlyingTarget) return;
    resetPointerEventsAndSaveDrop(underlyingTarget);
  };

  const handleDragging = (e: MouseEvent, { point }: { point: Point }) => {
    dragged.current && dragged.current.style
      ? (dragged.current.style.pointerEvents = "none")
      : undefined;
    const underlyingTarget = document.elementFromPoint(point.x, point.y);
    onDrag?.(underlyingTarget?.dataset.index);
  };

  return (
    <motion.div
      transition={{ type: "spring", bounce: 0.6, duration: 0.2 }}
      whileDrag={whileDrag}
      layoutId={id}
      dragElastic={0.2}
      ref={ref}
      drag
      dragSnapToOrigin
      onDragStart={handleStartDragging as any}
      onDragEnd={handleStopDragging as any}
      onDrag={handleDragging}
      dragConstraints={parent}
      className={twMerge(
        "bg-indigo-500 active:cursor-grabbing hover:cursor-grab rounded-xl"
      )}
    >
      <div
        className={twMerge(
          "flex justify-center items-center h-full pointer-events-none text-white bg-blend-exclusion",
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  );
};

export const Grid = ({
  numberOfItems,
  showCoords,
  cols = 2,
  rows = 1,
  className,
  children,
}: {
  children?: (arg0: Partial<CellData>) => ReactNode;
  className?: string;
  numberOfItems?: number;
  showCoords?: boolean;
  cols: number;
  rows?: number;
}) => {
  // @TODO: cell classname
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const updateOverIndex = (index: number) => {
    setOverIndex(Number(index));
    // console.log("DRAGING OVER: ", index);
  };
  return (
    <>
      <section
        className={twMerge("h-full grid-flow-col-dense", className)}
        style={{ display: "grid", boxSizing: "border-box" }}
      >
        {[
          ...Array(
            typeof numberOfItems === "number" ? numberOfItems : cols * rows
          ).keys(),
        ].map((index) => {
          const x = getCoord({ index, colsLength: cols });
          const y = getCoord({ index, colsLength: cols, coord: "y" });

          return (
            <Cell
              key={index}
              isTop={index < cols}
              x={x}
              y={y}
              data-index={index}
            >
              {(children &&
                typeof children === "function" &&
                children({
                  index,
                  x,
                  y,
                  overIndex,
                  updateOverIndex,
                })) ??
                (showCoords ? (
                  // {/* // It is really important to set the data-index prop, to make all the onOver stuff work */}
                  <p
                    className={twMerge(
                      "px-4 text-xs flex justify-center items-center",
                      overIndex === index && "bg-pink-500"
                    )}
                    data-index={index}
                  >
                    X: {x}, Y: {y}, Index: {index}, overIndex: {overIndex}
                  </p>
                ) : (
                  <p
                    data-index={index}
                    className={twMerge(overIndex === index && "bg-pink-500")}
                  >
                    X: {x}, Y: {y}, Index: {index}, overIndex: {overIndex}
                  </p>
                ))}
            </Cell>
          );
        })}
      </section>
    </>
  );
};

export const Cell = ({
  isTop,
  x,
  y,
  className,
  center,
  ...props
}: {
  center?: boolean;
  isTop?: boolean;
  x?: number;
  y?: number;
  className?: string;
  [x: string]: unknown;
}) => {
  const gridColumnStart = x ? x + 1 : undefined;
  const gridRowStart = y ? y + 1 : undefined;
  return (
    <motion.div
      whileHover={{ backgroundColor: "#cbd5e1" }}
      className={twMerge(
        center && "place-content-center",
        "grid",
        "border-gray-300 border-r border-b border-dashed",
        isTop && "border-t",
        className
      )}
      {...props}
      style={{ gridColumnStart, gridRowStart }}
    />
  );
};
