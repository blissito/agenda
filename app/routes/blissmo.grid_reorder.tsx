import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { GridReorder } from "~/components/animated/GridReorder";

export const loader = () => ({
  examples: ["Hola", "Blissmo", "🤓"],
});

export default function Route() {
  const { examples } = useLoaderData<typeof loader>();

  //yutu
  const [demo, setDemo] = useState("");

  const handleUpdate = (list: string[]) => {
    setDemo(JSON.stringify(list));
    console.log("Ahora puedo hacer DB sync 🤓 con este orden:", list);
  };

  return (
    <article className="h-screen bg-indigo-300 grid place-content-center">
      <h1 className="text-4xl font-bold font-sans text-center mb-8">
        Reordena los cubos 🧊
      </h1>
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
      <p className="py-8 text-center text-lg font-mono">
        <span className="text-gray-600">Estado devuelto:</span>
        {demo}
      </p>
    </article>
  );
}
