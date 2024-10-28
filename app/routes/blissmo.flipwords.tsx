import { FlipWords } from "~/components/animated/FlipWords";

export default function Route() {
  return (
    <article className="h-screen bg-indigo-300 flex flex-col items-center justify-center">
      <p className="text-3xl px-12 text-center font-bold font-sans whitespace-nowrap">
        Administra la agenda de tu{" "}
        <span className="text-red-500 font-extrabold text-5xl">
          <FlipWords
            words={["negocio", "proyecto", "empresa", "changarro", "iglesia"]}
          />
        </span>{" "}
        <br /> en un solo lugar
      </p>
    </article>
  );
}
