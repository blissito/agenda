import { LineSteak } from "../icons/lineSteak";
import { ArrowRight } from "../icons/arrowRight";
import { People } from "../icons/people";
import { PrimaryButton } from "../common/primaryButton";
import { CardLarge, CardSmall } from "./home";
import { ReactNode } from "react";

export const FinalCta = ({ children }: { children?: ReactNode }) => (
  <section className="w-full h-[640px] md:h-[800px] overflow-hidden">
    <section className="max-w-7xl w-full mx-auto h-[640px] md:h-[800px]  text-center  relative ">
      <div className="flex flex-col justify-center h-full items-center -mt-20 md:-mt-16 leading-normal ">
        {children}
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
