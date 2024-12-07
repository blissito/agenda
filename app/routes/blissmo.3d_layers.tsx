import { TridiLayers } from "~/components/animated/TridiLayers";

export default function Route() {
  return (
    <article className="bg-slate-200 text-gray-800">
      <section className="h-[50vh] bg-indigo-800" />
      <TridiLayers
        title={
          <h2 className="font-bold text-3xl font-sans text-center mb-6">
            Tarjetas 3D dinámicas 🪄✨🤩
          </h2>
        }
        images={[
          "https://i.imgur.com/oxKgjIb.png",
          "https://i.imgur.com/nvs8UBe.png",
          "https://i.imgur.com/ArpsLvc.png",
        ]}
      />

      <section className="h-[50vh] bg-orange-800" />
    </article>
  );
}
