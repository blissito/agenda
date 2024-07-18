import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  CellData,
  Draggable,
  Grid,
  testItems,
} from "~/components/dash/agenda/draggableGrid";

export default function Page() {
  const [items, set] = useState<CellData[]>(testItems);
  // custom drop mutation for this example
  const handleDrop = ({
    originIndex,
    dropIndex,
  }: {
    originIndex: number;
    dropIndex: number | undefined;
  }) => {
    const itemLocalIndex = items.findIndex((it) => it.index === originIndex); // ?? improve?
    const item = items[itemLocalIndex];
    item.index = dropIndex ?? originIndex;
    const mapped = items.map((it, i) => (i === itemLocalIndex ? item : it));
    set(mapped);
  };

  const drawExample = (data: Partial<CellData>) => {
    // draw your defined items
    const findItem = (searchIndex: number) => {
      return items.find((it) => it.index === searchIndex);
    };

    const item = findItem(data.index);

    if (item) {
      return (
        <Draggable
          key={item.id}
          id={item.id}
          index={Number(data.index)}
          onDrop={handleDrop}
          onDrag={data.updateOverIndex}
          whileDrag={{
            // backgroundColor: "rgb(99 102 241 / var(--tw-bg-opacity))",
            opacity: 0.9,
            scale: 0.9,
          }}
        >
          {item.id}
        </Draggable>
      );
    }

    // Draw based on coords
    const findItemByCoords = (x: number, y: number) => {
      return items.find((it) => it.x === x && it.y === y);
    };

    const itemByCoords = findItemByCoords(data.x, data.y);

    if (itemByCoords) {
      return (
        <div
          data-index={data.index}
          style={{
            boxSizing: "border-box",
          }}
          className={twMerge(
            "bg-orange-500 text-xs rounded-2xl",
            data.overIndex === data.index && "bg-pink-500"
          )}
        >
          <p
            className={twMerge("flex justify-center items-center h-full px-4")}
          >
            X: {data.x}, Y: {data.y}, Index: {data.index}, overIndex:
            {data.overIndex}
          </p>
        </div>
      );
    }
    // if function doesn't return i'll render coord if showCoords true
  };

  return (
    <>
      <section className="mx-auto bg-slate-100 h-screen overflow-hidden">
        <h1 className="px-3 m-2">Blissmo draggable and interactive grid</h1>
        <Grid cols={3} numberOfItems={18} className="py-20 px-4" showCoords>
          {drawExample}
        </Grid>
      </section>
    </>
  );
}
