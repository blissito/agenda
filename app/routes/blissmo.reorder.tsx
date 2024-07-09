import { Reorder } from "framer-motion";
import { useState } from "react";

const listItems = [
  { name: "Julio Ribeyro 🚬", id: 1 },
  { name: "Mario Vargas 🎭", id: 2 },
  { name: "Julio Cortazar 👽", id: 3 },
  { name: "Clarice Lispector 🤯", id: 4 },
];

export default function Page() {
  const [items, setItems] = useState(listItems);

  return (
    <div className="w-[400px] mx-auto mt-44">
      <Reorder.Group axis="y" values={items} onReorder={setItems}>
        {items.map((item) => (
          <Reorder.Item
            // onDragStart={(e) => {
            //   e.target.style.zIndex = 10;
            // }}
            dragListener={true}
            value={item}
            id={item.name}
            className="relative select-none text-white text-2xl p-6 rounded-xl bg-indigo-500 m-3 "
            key={item.id}
            style={{ cursor: "grab" }}
          >
            {item.name}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
