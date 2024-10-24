import { CardTriDi } from "~/components/animated/CardTriDi";

export default function Route() {
  return (
    <>
      <main className="bg-slate-100 grid place-content-center h-screen">
        <CardTriDi>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde
            ratione vero ea nemo nihil hic corrupti quaerat mollitia ex, iure
            ipsa commodi atque iusto deserunt neque nostrum tempora quae
            sapiente.
          </p>
          <div className="flex gap-4 items-center px-4">
            <img
              className="rounded-full w-20 h-20 object-cover border"
              src="https://i.imgur.com/qqTYVSy.png"
              alt="ovni"
            />
            <div>
              <p className="font-bold font-sans text-lg">Pedro Ortega</p>
              <p>Diseñador UX</p>
            </div>
          </div>
        </CardTriDi>
      </main>
    </>
  );
}
