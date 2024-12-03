import { FlipWordsThree } from "~/components/animated/FlipWordsThree";
import { FlipWordsTwo } from "~/components/animated/FlipWordsTwo";

export default function Route() {
  return (
    <>
      <article className="h-[50vh] bg-gray-200 grid place-content-center">
        <FlipWordsTwo>
          <h1 className="text-5xl font-bold tracking-tight">
            Hola Blissmo! :D
          </h1>
        </FlipWordsTwo>
        <p className="font-thin tracking-tighter text-2xl">Pucha el título</p>
      </article>
      <article className="h-[50vh] bg-gray-200 grid place-content-center">
        <FlipWordsThree>
          <h1 className="text-5xl font-bold tracking-tight">
            Hola Blissmo! :D
          </h1>
        </FlipWordsThree>
        <p className="font-thin tracking-tighter text-2xl">Pucha el título</p>
      </article>
    </>
  );
}
