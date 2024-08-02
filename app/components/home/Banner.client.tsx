import { PrimaryButton } from "../common/primaryButton";
import { SecondaryButton } from "../common/secondaryButton";
import { ArrowRight } from "../icons/arrowRight";
import { Meteors } from "./Meteors.client";
// @ Meteors require Banner to be wrapped in a Suspense!
export const Banner = () => (
  <section className="max-w-[90%] xl:max-w-7xl w-full mx-auto rounded-[40px] bg-brand_dark my-[120px] md:my-[160px] p-8 md:py-16 md:px-[10%] xl:px-[5%] relative overflow-hidden text-center">
    <h2 className="text-2xl lg:text-4xl text-white font-bold">
      ¡Prueba Deník y crece tu negocio!
    </h2>
    <p className="text-xl lg:text-2xl text-brand_ash/80 mt-6 font-satoshi">
      Si tienes alguna duda, agenda un demo en línea para que nuestro equipo te
      muestres todo lo que puedes hacer con Denik. ¡Escríbenos!
    </p>
    <div className="flex gap-6 md:gap-8 mt-12 justify-center ">
      <PrimaryButton className="w-[180px]">
        Probar gratis <ArrowRight />{" "}
      </PrimaryButton>
      <SecondaryButton className="w-[180px]">Agendar demo </SecondaryButton>
    </div>
    <Meteors number={40} />
  </section>
);
