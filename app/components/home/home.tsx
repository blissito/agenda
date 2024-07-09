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
    <div className="w-full h-full px-[5%] xl:px-[18%]">
      <h1 className="group text-4xl md:text-6xl lg:text-7xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span>Administra la</span>
        <Calendar className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] mx-4" />{" "}
        <span>agenda</span> de tu negocio en un solo lugar
      </h1>
      <p className="text-xl lg:text-2xl text-brand_gray font-body mt-6">
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
  <section className="flex flex-col gap-28 z-60 overflow-hidden pb-12 w-full items-center ">
    <div className="flex justify-center xl:justify-between pr-0   gap-10 lg:gap-20 ">
      <div className="w-[120px] lg:w-[320px] flex justify-center">
        <LineSteak />
      </div>
      <CardSmall
        className="rotate-[4deg] "
        name="Paola Alvarado"
        rol="Nutrióloga"
        comment="Desde que uso Deník, administrar mis citas es más fácil. Mis clientes agendan directamente en cualquier momento. "
      />
      <CardImage className="-rotate-[4deg]" />
      <CardLarge
        className="rotate-[4deg] "
        name="Luis Escobedo"
        rol="Entrenador"
        comment="Descubrí Deník hace poco, y es la agenda en línea más completa que he utilizado. "
      />
    </div>
    <div className="flex justify-between  pr-0  xl:pr-20 gap-10">
      <CardSmall
        className="rotate-[4deg] "
        name="Catalina López"
        rol="Maestra de inglés"
        comment="Deník es un sistema completo de administración que me ha permitido organizar mis citas de forma digital."
      />
      <CardImage className="-rotate-[4deg] " img="/images/img1.jpg" />
      <CardLarge
        className="rotate-[4deg] "
        name="Georgina Hernández"
        rol="Estilista"
        comment="Deník me permite tener mis citas, clientes y ventas en solo lugar."
      />
      <CardImage className="-rotate-[4deg] " img="/images/img4.jpg" />
    </div>
    <div className="flex justify-between  items-center  pr-0  xl:pr-20 gap-10">
      <CardImage className="rotate-[4deg] " img="/images/img3.jpg" />
      <CardLarge
        className="-rotate-[4deg] "
        name="Jose Luis González"
        rol="Médico general"
        comment="Los recordatorios de Deník son la parte favorita de mis clientes, ahora ni ellos ni yo olvidamos las citas."
      />
      <CardImage className="rotate-[4deg] " img="/images/img2.jpg" />
      <CardSmall
        className="-rotate-[4deg] "
        name="Paola Alvarado"
        rol="Couch"
        comment="Desde que empecé a utilizar Deník he recibido más clientes, ya que para ellos es más fácil agendar y pagar citas en línea."
      />
    </div>
  </section>
);

export const CardSmall = ({
  className,
  img,
  name,
  rol,
  comment,
}: {
  img?: string;
  name: string;
  rol: string;
  comment: string;
  className?: string;
}) => (
  <section
    className={twMerge(
      "group transition-all cursor-pointer shadow-[0px_12px_32px_0px_#00000014] w-[240px] lg:w-[340px] h-[300px] lg:h-[400px] rounded-lg	p-6 relative flex flex-col justify-between",
      className
    )}
  >
    <article className="flex gap-3">
      <img
        alt="user"
        className="w-10 h-10 rounded-full object-cover"
        src={
          img
            ? img
            : "https://images.pexels.com/photos/925786/pexels-photo-925786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        }
      />
      <div>
        <h3 className="text-brand_dark font-bold text-sm xl:text-base">
          {name}
        </h3>
        <p className="text-xs lg:text-sm text-brand_gray">{rol}</p>
      </div>
    </article>
    <p className="text-lg lg:text-2xl font-bold text-brand_dark">{comment}</p>
    <span className=" absolute right-6 -bottom-8 group-hover:scale-75">
      <Rocket />
    </span>
  </section>
);
export const CardLarge = ({
  className,
  img,
  name,
  rol,
  comment,
}: {
  className: string;
  img?: string;
  name: string;
  rol: string;
  comment: string;
}) => (
  <section
    className={twMerge(
      "group transition-all cursor-pointer shadow-[0px_12px_32px_0px_#00000014] w-[220px] lg:w-[280px] h-[380px] rounded-lg	p-6 relative flex flex-col justify-between",
      className
    )}
  >
    <article className="flex gap-3">
      <img
        alt="user"
        className="w-10 h-10 rounded-full object-cover "
        src={
          img
            ? img
            : "https://images.pexels.com/photos/925786/pexels-photo-925786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        }
      />
      <div>
        <h3 className="text-brand_dark font-bold text-sm xl:text-base">
          {name}
        </h3>
        <p className="text-xs lg:text-sm text-brand_gray">{rol}</p>
      </div>
    </article>
    <p className="text-lg lg:text-2xl font-bold text-brand_dark">{comment}</p>
    <span className=" absolute right-6 -bottom-8 group-hover:scale-75">
      <Rocket />
    </span>
  </section>
);

export const CardImage = ({
  className,
  img,
}: {
  className?: string;
  img?: string;
}) => (
  <section
    className={twMerge(
      "group transition-all cursor-pointer w-[210px] h-[280px] lg:w-[420px] rounded-lg	p-6 xl:h-[280px]  relative",
      className
    )}
  >
    <span className=" absolute -left-2 -top-2 group-hover:scale-125">
      <Expression />
    </span>
    <img
      alt="negocio"
      className="w-full h-full object-cover "
      src={
        img
          ? img
          : "https://images.pexels.com/photos/3993472/pexels-photo-3993472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      }
    />
  </section>
);

export const Features = () => (
  <section className="max-w-[90%] lg:max-w-7xl mx-auto pt-[0px] lg:pt-[80px]">
    <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4"> Impulsa</span>
      <Rocket className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
      <span className="ml-4"> tu </span> negocio con Deník
    </h2>
    <div className="flex justify-between items-center mt-[80px] lg:mt-[120px] flex-wrap-reverse lg:flex-nowrap">
      <div className="pr-12">
        <h2 className="font-bold text-2xl lg:text-4xl text-brand_dark">
          No más citas olvidadas: Controla y automatiza tu agenda{" "}
        </h2>
        <p className="text-brand_gray text-lg lg:text-2xl font-body mt-3 lg:mt-6 mb-16">
          Agenda sesiones con tus clientes, agrega notas y envía recordatorios.
          ¡Ahora tienes el control!
        </p>
        <PrimaryButton>
          Crear agenda <ArrowRight />
        </PrimaryButton>
      </div>
      <img
        alt="vista de agenda"
        className="w-full xl:w-[50%]"
        src="/images/agenda.png"
      />
    </div>
    <div className="flex justify-between items-center mt-[80px] lg:mt-[160px] flex-wrap lg:flex-nowrap">
      <img
        alt="notificación"
        className="w-full xl:w-[50%]"
        src="/images/notification.png"
      />
      <div className="pl-0 lg:pl-12">
        <h2 className="font-bold text-2xl lg:text-4xl text-brand_dark">
          ¡Que no te dejen plantado! Envía recordatorios por email y whats app
        </h2>
        <p className="text-brand_gray text-lg lg:text-2xl font-body mt-6 mb-16">
          Evita pérdidas de tiempo y dinero: confirmamos tus citas y enviamos
          recordatorios a tus clientes para que no las olviden.
        </p>
      </div>
    </div>
    <div className="flex justify-between items-center mt-[80px] lg:mt-[160px]  flex-wrap-reverse lg:flex-nowrap">
      <div className="pr-12">
        <h2 className="font-bold text-2xl lg:text-4xl text-brand_dark">
          No pierdas más clientes, recibe pagos en línea
        </h2>
        <p className="text-brand_gray text-lg lg:text-2xl font-body mt-6 mb-16">
          Ofrece más alternativas de pago a tus clientes o pacientes con pagos
          desde tu sitio web.
        </p>
        <PrimaryButton>
          Probar gratis <ArrowRight />
        </PrimaryButton>
      </div>
      <img
        alt=" payment card"
        className="w-full xl:w-[50%]"
        src="/images/payment.png"
      />
    </div>
  </section>
);
