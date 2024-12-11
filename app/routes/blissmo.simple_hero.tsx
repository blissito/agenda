import { SimpleHero } from "~/components/animated/SimpleHero";

export default function Route() {
  return (
    <article className="text-white">
      <SimpleHero />
      <div className="h-[100vh] bg-indigo-300" />
    </article>
  );
}
