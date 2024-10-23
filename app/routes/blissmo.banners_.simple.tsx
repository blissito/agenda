import { Marquee } from "~/components/animated/Marquee";

export default function Route() {
  return (
    <>
      <div className="h-[60vh] bg-indigo-950" />
      <Marquee>
        🪄 Lorem ipsum blissmo <span>🤓</span> perro mijo otro <span>🏴</span>{" "}
        text un poco <span>🤩</span>
      </Marquee>
      <Marquee reversed className="bg-indigo-950">
        🪄 Lorem ipsum blissmo <span>🤓</span> perro mijo otro <span>🏴</span>{" "}
        text un poco <span>🤩</span>
      </Marquee>
      <div className="h-[60vh] bg-gray-800" />
    </>
  );
}
