import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  CellData,
  CellDrawer,
  Draggable,
  testItems,
} from "~/components/dash/agenda/draggableGrid";

export default function Page() {
  const [items, set] = useState<CellData[]>(testItems);
  // const [draggingOverIndex, setDOI] = useState<number | null>(null);

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

  const drawExample = (data: CellData) => {
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
            backgroundColor: "#222",
            opacity: 1,
            scale: 0.8,
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
          className={twMerge("bg-orange-500 text-xs")}
          children={JSON.stringify(data)}
        />
      );
    }
    // if function doesn't return i'll render coord if showCoords true
  };

  return (
    <>
      <section className="mx-auto bg-slate-100 h-screen overflow-hidden">
        <h1 className="px-3 m-2">Blissmo draggable and interactive grid</h1>
        <CellDrawer cols={5} numberOfItems={15} className="py-20" showCoords>
          {drawExample}
        </CellDrawer>
      </section>
    </>
  );
}
