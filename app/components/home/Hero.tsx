import { PrimaryButton } from "../common/primaryButton";
import { SecondaryButton } from "../common/secondaryButton";
import { ArrowRight } from "../icons/arrowRight";

export const Hero = ({ ...props }: { props?: unknown }) => (
  <section className="min-h-[70vh] flex pt-[220px] justify-center text-center">
    <div className="w-full h-full px-[18%]">
      <h1 className="text-7xl	font-bold text-brand_dark leading-tight	">
        Administra la agenda de tu negocio en un solo lugar
      </h1>
      <p className="text-2xl text-brand_gray font-body mt-6">
        Agenda de manera sencilla, realiza cobros, manda recordatorios a tus
        clientes y envía encuestas de satisfacción
      </p>
      <div className="flex gap-8 mt-12 justify-center ">
        <PrimaryButton>
          Probar gratis <ArrowRight />{" "}
        </PrimaryButton>
        <SecondaryButton>Agendar demo </SecondaryButton>
      </div>
    </div>
  </section>
);
