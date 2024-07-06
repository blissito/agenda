import { PrimaryButton } from "../common/primaryButton";
import { SecondaryButton } from "../common/secondaryButton";
import { ArrowRight } from "../icons/arrowRight";
import { Meteors } from "./Meteors";

export const Banner = ({ ...props }: { props?: unknown }) => (
  <section className="max-w-7xl w-full mx-auto rounded-[40px] bg-brand_dark my-[160px] py-16 px-[10%] relative overflow-hidden text-center">
    <h2 className="text-4xl text-white">¡Prueba Deník y crece tu negocio!</h2>
    <p className="text-2xl text-brand_ash/80 mt-6 font-body">
      Si tienes alguna duda, agenda un demo en línea para que nuestro equipo te
      muestres todo lo que puedes hacer con Denik. ¡Escríbenos!
    </p>
    <div className="flex gap-8 mt-12 justify-center ">
      <PrimaryButton>
        Probar gratis <ArrowRight />{" "}
      </PrimaryButton>
      <SecondaryButton>Agendar demo </SecondaryButton>
    </div>
    <Meteors number={40} />
  </section>
);
