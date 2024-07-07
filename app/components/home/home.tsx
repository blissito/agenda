import { PrimaryButton } from "../common/primaryButton";
import { SecondaryButton } from "../common/secondaryButton";
import { ArrowRight } from "../icons/arrowRight";
import { Calendar } from "../icons/calendar";
import { LineSteak } from "../icons/lineSteak";
import { twMerge } from "tailwind-merge";
import { Rocket } from "../icons/rocket";
import { Expression } from "../icons/expression";

export const Hero = () => (
  <section className="min-h-[74vh] flex flex-col pt-40 justify-center text-center ">
    <div className="w-full h-full px-[18%]">
      <h1 className="group text-7xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4">Administra la</span>
        <Calendar className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
        <span className="ml-4">agenda</span> de tu negocio en un solo lugar
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

export const ScrollReviews = ({ ...props }: { props?: unknown }) => (
  <section className="flex flex-col gap-28 z-20 bg-white">
    <div className="flex justify-between  pr-20 ">
      <div className="w-[320px] flex justify-center">
        <LineSteak />
      </div>
      <CardSmall className="" />
      <CardImage />
      <CardLarge />
    </div>
    <div className="flex justify-between  pr-20">
      <CardSmall />
      <CardImage />
      <CardLarge />
      <CardImage />
    </div>
    <div className="flex justify-between  pr-20">
      <CardImage />
      <CardLarge />
      <CardImage />
      <CardSmall />
    </div>
  </section>
);

export const CardSmall = ({
  className,
  ...props
}: {
  props?: unknown;
  className?: string;
}) => (
  <section
    {...props}
    className={twMerge(
      "shadow-[0px_12px_32px_0px_#00000014] w-[340px] rounded-lg	p-6 relative",
      className
    )}
  >
    <article className="flex gap-3">
      <img
        alt=""
        className="w-10 h-10 rounded-full object-cover"
        src="https://images.pexels.com/photos/925786/pexels-photo-925786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />
      <div>
        <h3 className="text-brand_dark font-bold">Nombre</h3>
        <p className="text-sm text-brand_gray">Profesión</p>
      </div>
    </article>
    <p className="mt-16 text-2xl font-bold text-brand_dark">
      Users find it hard to navigate from the home page to relevant playlists
      the app.
    </p>
    <span className=" absolute right-6 -bottom-8">
      <Rocket />
    </span>
  </section>
);
export const CardLarge = () => (
  <section className="shadow-[0px_12px_32px_0px_#00000014] w-[240px] h-[380px] rounded-lg	p-6 relative ">
    <article className="flex gap-3">
      <img
        alt=""
        className="w-10 h-10 rounded-full object-cover"
        src="https://images.pexels.com/photos/925786/pexels-photo-925786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />
      <div>
        <h3 className="text-brand_dark font-bold">Nombre</h3>
        <p className="text-sm text-brand_gray">Profesión</p>
      </div>
    </article>
    <p className="mt-20 text-2xl font-bold text-brand_dark">
      Users find it hard to navigate from the home page to relevant playlists
      the app.
    </p>
    <span className=" absolute right-6 -bottom-8">
      <Rocket />
    </span>
  </section>
);

export const CardImage = () => (
  <section className=" w-[420px] rounded-lg	p-6 h-[280px]  relative">
    <span className=" absolute -left-2 -top-2">
      <Expression />
    </span>
    <img
      alt=""
      className="w-full h-full object-cover"
      src="https://images.pexels.com/photos/3993472/pexels-photo-3993472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    />
  </section>
);

export const Features = () => (
  <section className="max-w-7xl mx-auto pt-[240px]">
    <h2 className="group text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4"> Impulsa</span>
      <Rocket className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
      <span className="ml-4"> tu </span> negocio con Deník
    </h2>
    <div className="flex justify-between items-center mt-[120px]">
      <div className="pr-12">
        <h2 className="font-bold text-4xl text-brand_dark">
          No más citas olvidadas: Controla y automatiza tu agenda{" "}
        </h2>
        <p className="text-brand_gray text-2xl font-body mt-6 mb-16">
          Agenda sesiones con tus clientes, agrega notas y envía recordatorios.
          ¡Ahora tienes el control!
        </p>
        <PrimaryButton>
          Crear agenda <ArrowRight />
        </PrimaryButton>
      </div>
      <img alt="" className="w-[50%]" src="/images/agenda.png" />
    </div>
    <div className="flex justify-between items-center mt-[160px]">
      <img alt="" className="w-[50%]" src="/images/notification.png" />
      <div className="pl-12">
        <h2 className="font-bold text-4xl text-brand_dark">
          ¡Que no te dejen plantado! Envía recordatorios por email y whats app
        </h2>
        <p className="text-brand_gray text-2xl font-body mt-6 mb-16">
          Evita pérdidas de tiempo y dinero: confirmamos tus citas y enviamos
          recordatorios a tus clientes para que no las olviden.
        </p>
      </div>
    </div>
    <div className="flex justify-between items-center mt-[160px]">
      <div className="pr-12">
        <h2 className="font-bold text-4xl text-brand_dark">
          No pierdas más clientes, recibe pagos en línea
        </h2>
        <p className="text-brand_gray text-2xl font-body mt-6 mb-16">
          Ofrece más alternativas de pago a tus clientes o pacientes con pagos
          desde tu sitio web.
        </p>
        <PrimaryButton>
          Probar gratis <ArrowRight />
        </PrimaryButton>
      </div>
      <img alt="" className="w-[50%]" src="/images/payment.png" />
    </div>
  </section>
);
