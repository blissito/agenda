import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <article className="h-[100vh] grid place-items-center">
      <h1 className="text-6xl">Bienvenido a Denik Agenda</h1>
    </article>
  );
}
