import { PhoneHero } from "~/components/animated/PhoneHero";

export default function Route() {
  return (
    <article>
      <PhoneHero
        title={
          <h1 className="font-grotesk">Aprende a animar tus components</h1>
        }
      />
      <section className="h-[600vh] bg-black relative z-10">
        <h1 className="py-20 px-auto text-center font-bold font-sans text-6xl text-white">
          Título de otra sección
        </h1>
      </section>
    </article>
  );
}
