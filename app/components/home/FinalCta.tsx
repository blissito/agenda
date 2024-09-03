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
      <div className="w-full flex justify-between text-left  absolute -bottom-40 md:-bottom-60 gap-4 ">
        <LineSteak />
        <CardSmall
          className="rotate-[4deg] justify-start gap-10 w-[360px]"
          name="Mariana Palmar"
          rol="Agente turístico"
          comment="Con la agenda he podido organizar los tours de mi agencia de forma ordenada."
          img="https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        />
        <CardLarge
          className="-rotate-[4deg] justify-start gap-10 w-[320px]"
          name="Rossalba Ahumada"
          rol="Galerista"
          comment="Poder cobrar en línea al reservar citas ha aumentado la ocupación de mi agenda."
          img="https://images.pexels.com/photos/20967/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        />
        <CardLarge
          className="rotate-[4deg] justify-start gap-10 hidden md:flex"
          name="Mauricio Baños"
          rol="Veterinario"
          comment="Desde que uso Deník y administro las notificaciones de citas, ha disminuido la inasistencia y cancelación de citas."
          img="https://images.pexels.com/photos/6235116/pexels-photo-6235116.jpeg?auto=compress&cs=tinysrgb&w=800"
        />
        <CardSmall
          className="-rotate-[4deg] justify-start gap-10 hidden md:flex"
          name="Georgina Hernández"
          rol="Estilista"
          comment="Deník me permite tener mis citas, clientes y ventas en solo lugar."
          img="https://images.pexels.com/photos/3268732/pexels-photo-3268732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        />
      </div>
    </section>
  </section>
);
