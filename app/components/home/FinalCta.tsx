import { LineSteak } from "../icons/lineSteak";
import { ArrowRight } from "../icons/arrowRight";
import { People } from "../icons/people";
import { PrimaryButton } from "../common/primaryButton";
import { CardLarge, CardSmall } from "./home";

export const FinalCta = ({ ...props }: { props?: unknown }) => (
  <section className="max-w-7xl w-full mx-auto  text-center h-[800px] overflow-hidden relative">
    <div className="flex flex-col justify-center h-full items-center -mt-16 leading-normal ">
      <h2 className="group text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4">Tu agenda. </span>
        <People className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
        <span className="ml-4"> Tus clientes.</span>
      </h2>
      <h2 className="text-6xl font-bold  text-brand_dark mb-16 leading-normal ">
        Tu negocio.
      </h2>
      <PrimaryButton>
        Probar gratis <ArrowRight />{" "}
      </PrimaryButton>
    </div>
    <div className="flex justify-between  absolute -bottom-40 ">
      <LineSteak />
      <CardSmall />
      <CardLarge />
      <CardLarge />
      <CardSmall />
    </div>
  </section>
);
