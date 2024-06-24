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
      <h1 className="text-6xl">Bienvenid@ a Denik Agenda</h1>
      <p>Tu agenda, tus clientes, tu negocio.</p>
    </article>
  );
}
