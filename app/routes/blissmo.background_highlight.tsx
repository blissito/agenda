import { BackgroundHighlight } from "~/components/animated/BackgroundHighlight";

export default function Route() {
  return (
    <main className="bg-gray-950 h-screen flex items-center justify-center text-3xl px-12 text-center">
      <div className="font-sans font-bold text-white">
        Emplea componentes animados en tu sitio web <br />
        que le cambien la personalidad. <br />
        <BackgroundHighlight className="from-yellow-500 to-orange-500">
          Haz que destaque de entre la multitud.
        </BackgroundHighlight>
      </div>
    </main>
  );
}
