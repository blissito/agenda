import { Children, type MouseEvent, type ReactNode, useState } from "react";
import { LayoutGroup, motion, useDragControls } from "motion/react";
import { cn } from "~/utils/cn";
import { nanoid } from "nanoid";
import { useHoverIndex } from "~/components/hooks/useHoverIndex";

export type Cell = {
  layoutId: string;
  node: ReactNode;
};

export const GridReorder = ({
  rows = 2,
  columns = 2,
  children,
  onUpdate,
  iterables = [],
  className,
}: {
  className?: string;
  iterables?: string[];
  onUpdate?: (arg0: string[]) => void;
  children?: ReactNode;
  rows?: number;
  columns?: number;
}) => {
  const nodes = Children.toArray(children);
  const { getIndex } = useHoverIndex(); // 🪄✨
  const [grabbed, setGrabbed] = useState<Cell | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [cells, setCells] = useState<Cell[]>(
    Array.from({ length: rows * columns }).map((_, indx) => ({
      layoutId: iterables[indx] || nanoid(), // nice 🪄✨
      node: nodes[indx] || null,
    }))
  );

  // local utils (usa un estado local)
  const swapCells = ({
    grabbingIndex,
    hoverIndex,
  }: {
    hoverIndex: number;
    grabbingIndex: number;
  }) => {
    const _cells = [...cells];
    const moving = _cells.splice(grabbingIndex, 1)[0];
    _cells.splice(hoverIndex, 0, moving);
    // local updates
    setCells(_cells);
    setOverIndex(null);
    // update parent
    onUpdate?.(
      _cells.map((cell) => cell.layoutId).filter((id) => iterables.includes(id))
    );
  };

  const handleDrag = (
    event: MouseEvent<HTMLDivElement>,
    grabbingIndex: number
  ) => {
    const hoverIndex = getIndex(event, { grabbingIndex });
    if (hoverIndex === null || hoverIndex === undefined) return;
    // could be 0
    setOverIndex(hoverIndex);
    // experiment
    // if (grabbingIndex !== hoverIndex) {
    //   swapCells({ grabbingIndex, hoverIndex });
    // }
  };

  const handleDragEnd = (event: DragEvent, grabbingIndex: number) => {
    const hoverIndex = getIndex(event, { grabbingIndex });
    if (hoverIndex === null || hoverIndex === undefined) return;
    // reorder
    swapCells({ grabbingIndex, hoverIndex });
  };

  return (
    <section
      style={{
        display: "grid",
        // @todo improve with coordinates?
        gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
        gridTemplateRows: `repeat(${rows},minmax(0,1fr))`,
      }}
      className={className}
    >
      <LayoutGroup>
        {cells.map(({ layoutId, node }, index) => (
          <DropableCell
            isCurrentHover={overIndex === index}
            isLastGrabbed={grabbed?.layoutId === layoutId}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            onDragStart={() => setGrabbed({ layoutId, node })}
            index={index}
            key={index}
            layoutId={layoutId}
          >
            {node}
          </DropableCell>
        ))}
      </LayoutGroup>
    </section>
  );
};

const DropableCell = ({
  layoutId,
  onDragEnd,
  isCurrentHover,
  onDragStart,
  index,
  children,
  onDrag,
  isLastGrabbed,
}: {
  isLastGrabbed?: boolean;
  layoutId: string; // needed to animate
  onDragEnd?: (arg0: DragEvent, arg1: number) => void;
  onDragStart?: (arg0: DragEvent) => void;
  isCurrentHover?: boolean;
  index?: number;
  children?: ReactNode;
  onDrag?: (arg0: MouseEvent<unknown>, arg1: number) => void;
}) => {
  // experiment for real time reordering
  const controls = useDragControls();
  return (
    <motion.div
      dragListener={false}
      dragControls={controls}
      onPointerDown={(event) => controls.start(event, { snapToCursor: false })}
      //
      onDragStart={onDragStart}
      layout
      layoutId={layoutId}
      key={layoutId}
      onDragEnd={(e) => onDragEnd?.(e, index)}
      onDrag={(e) => onDrag?.(e, index)}
      whileTap={{ cursor: "grabbing" }}
      whileDrag={{ zIndex: 50 }}
      drag
      dragSnapToOrigin
      data-index={index}
      className={cn(
        "w-full h-full bg-green-300 border hover:bg-green-400 cursor-grab grid place-content-center", // centering
        {
          "bg-red-400": isCurrentHover,
          "z-10": isLastGrabbed, // 🪄✨🎩🐰
        }
      )}
    >
      {children}
    </motion.div>
  );
};
