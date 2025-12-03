import { BackgroundHighlight } from "~/components/animated/BackgroundHighlight";

export default function Route() {
  return (
    <main className="bg-gray-950 h-screen flex items-center justify-center text-3xl px-12 text-center">
      <div className="font-sans font-bold text-white">
        Emplea componentes interactivos en tu sitio web. <br />
        <BackgroundHighlight className="from-yellow-500 to-orange-500">
          Haz que destaque.
        </BackgroundHighlight>
      </div>
    </main>
  );
}
