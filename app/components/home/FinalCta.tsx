import { LineSteak } from "../icons/lineSteak";
import { ArrowRight } from "../icons/arrowRight";
import { People } from "../icons/people";
import { PrimaryButton } from "../common/primaryButton";
import { CardLarge, CardSmall } from "./home";

export const FinalCta = ({ ...props }: { props?: unknown }) => (
  <section className="w-full h-[640px] md:h-[800px] overflow-hidden">
    <section className="max-w-7xl w-full mx-auto h-[640px] md:h-[800px]  text-center  relative ">
      <div className="flex flex-col justify-center h-full items-center -mt-20 md:-mt-16 leading-normal ">
        <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
          <span className="mr-4">Tu agenda. </span>
          <People className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
          <span className="ml-4"> Tus clientes.</span>
        </h2>
        <h2 className="text-4xl lg:text-6xl font-bold  text-brand_dark mb-16 leading-normal ">
          Tu negocio.
        </h2>
        <PrimaryButton>
          Probar gratis <ArrowRight />{" "}
        </PrimaryButton>
      </div>
      <div className="w-full flex justify-between text-left  absolute -bottom-60 gap-4 ">
        <LineSteak />
        <CardSmall
          className="rotate-[4deg] justify-start gap-10 w-[360px]"
          name="Georgina Hernández"
          rol="Estilista"
          comment="Desde que empecé a utilizar Deník he recibido más clientes, ya que para ellos es más fácil agendar y pagar citas en línea."
        />
        <CardLarge
          className="-rotate-[4deg] justify-start gap-10 w-[320px]"
          name="Georgina Hernández"
          rol="Estilista"
          comment="Deník me permite tener mis citas, clientes y ventas en solo lugar."
        />
        <CardLarge
          className="rotate-[4deg] justify-start gap-10 hidden md:flex"
          name="Georgina Hernández"
          rol="Estilista"
          comment="Deník me permite tener mis citas, clientes y ventas en solo lugar."
        />
        <CardSmall
          className="-rotate-[4deg] justify-start gap-10 hidden md:flex"
          name="Georgina Hernández"
          rol="Estilista"
          comment="Desde que empecé a utilizar Deník he recibido más clientes, ya que para ellos es más fácil agendar y pagar citas en línea."
        />
      </div>
    </section>
  </section>
);
