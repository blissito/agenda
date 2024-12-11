import { Children, ReactNode, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "~/utils/cn";
import { nanoid } from "nanoid";
import { useHoverIndex } from "~/components/hooks/useHoverIndex";
import { useLoaderData } from "@remix-run/react";

type Cell = {
  layoutId: string;
  node: ReactNode;
};

export const loader = () => ({
  examples: ["Hola", "Blissmo", "🤓"],
});

export default function Route() {
  const { examples } = useLoaderData<typeof loader>();

  const handleUpdate = (list: string[]) => {
    console.log("Now I can sync my DB 🤓 with new order:", list);
  };

  return (
    <article className="h-screen bg-indigo-300 grid place-content-center">
      <GridReorder
        iterables={examples}
        onUpdate={handleUpdate}
        columns={3}
        rows={3}
      >
        {examples.map((example, i) => (
          <div
            key={i}
            className="bg-blue-500 w-40 h-40 flex justify-center items-center rounded-3xl m-2 text-3xl"
          >
            {example}
          </div>
        ))}
      </GridReorder>
    </article>
  );
}

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
  const [grabbed, setGrabbed] = useState<Cell | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const nodes = Children.toArray(children);
  const [cells, setCells] = useState<Cell[]>(
    Array.from({ length: rows * columns }).map((_, indx) => ({
      layoutId: iterables[indx] || nanoid(), // nice 🪄✨
      node: nodes[indx] || null,
    }))
  );

  //   console.log("CELLS::", cells);

  const { getIndex } = useHoverIndex();

  const handleDrag = (event: DragEvent, grabbingIndex: number) => {
    const hoverIndex = getIndex(event, { grabbingIndex });
    if (hoverIndex === null || hoverIndex === undefined) return;
    // could be 0
    setOverIndex(hoverIndex);
  };

  const handleDragEnd = (event: DragEvent, grabbingIndex: number) => {
    const hoverIndex = getIndex(event, { grabbingIndex });
    if (hoverIndex === null || hoverIndex === undefined) return;
    // reorder
    const _cells = [...cells];
    const moving = _cells.splice(grabbingIndex, 1)[0];
    _cells.splice(hoverIndex, 0, moving);
    // updates
    setCells(_cells);
    setOverIndex(null);
    // update parent
    onUpdate?.(
      _cells.map((cell) => cell.layoutId).filter((id) => iterables.includes(id))
    );
  };

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
        gridTemplateRows: `repeat(${rows},minmax(0,1fr))`,
      }}
      className={className}
    >
      <LayoutGroup>
        {cells.map(({ layoutId, node }, index) => (
          <DropableCell
            currentHoverIndex={overIndex}
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
  currentHoverIndex,
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
  currentHoverIndex?: number | null;
  index?: number;
  children?: ReactNode;
  onDrag?: (arg0: DragEvent, arg1: number) => void;
}) => {
  return (
    <motion.div
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
        "w-full h-full bg-green-300 border hover:bg-green-400 cursor-grab",
        {
          "bg-red-400": currentHoverIndex === index,
          "z-10": isLastGrabbed,
        }
      )}
    >
      {children}
    </motion.div>
  );
};
