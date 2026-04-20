import type { ReactNode } from "react"
import { Parallax } from "react-scroll-parallax"
import { twMerge } from "tailwind-merge"
import { WobbleCard } from "../animated/WoobleCard"
import { PrimaryButton } from "../common/primaryButton"
import { SecondaryButton } from "../common/secondaryButton"
import { Arrow } from "../icons/arrow"
import { ArrowRight } from "../icons/arrowRight"
import { Calendar } from "../icons/calendar"
import { Comment } from "../icons/comment"
import { Expression } from "../icons/expression"
import { LineSteak } from "../icons/lineSteak"
import { Rocket } from "../icons/rocket"
import { Search } from "../icons/search"
import { Thunder } from "../icons/thunder"
import { Waves } from "../icons/waves"

function Sparkles() {
  return (
    <span className="relative inline-block w-0">
      <svg
        className="absolute -top-2 md:-top-4 lg:-top-8 -left-4 md:-left-5 lg:-left-6 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 animate-[sparkle_2s_ease-in-out_infinite]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
      >
        <path
          fill="#ffdc6e"
          d="M45.98,1.61l1.76,5.71c1.46,4.72,5.15,8.41,9.87,9.87l5.71,1.76c.91.28.91,1.57,0,1.86l-5.71,1.76c-4.72,1.46-8.41,5.15-9.87,9.87l-1.76,5.71c-.28.91-1.57.91-1.86,0l-1.76-5.71c-1.46-4.72-5.15-8.41-9.87-9.87l-5.71-1.76c-.91-.28-.91-1.57,0-1.86l5.71-1.76c4.72-1.46,8.41-5.15,9.87-9.87l1.76-5.71c.28-.91,1.57-.91,1.86,0z"
        />
      </svg>
      <svg
        className="absolute top-2 left-2 md:top-4 md:left-3 lg:-top-4 lg:left-4 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 animate-[sparkle_2s_ease-in-out_0.7s_infinite]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
      >
        <path
          fill="#ffdc6e"
          d="M14.44,36.04l1.28,4.15c1.06,3.43,3.74,6.11,7.17,7.17l4.15,1.28c.66.2.66,1.14,0,1.35l-4.15,1.28c-3.43,1.06-6.11,3.74-7.17,7.17l-1.28,4.15c-.2.66-1.14.66-1.35,0l-1.28-4.15c-1.06-3.43-3.74-6.11-7.17-7.17l-4.15-1.28c-.66-.2-.66-1.14,0-1.35l4.15-1.28c3.43-1.06,6.11-3.74,7.17-7.17l1.28-4.15c.2-.66,1.14-.66,1.35,0z"
        />
      </svg>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
      `}</style>
    </span>
  )
}

export const Hero = () => (
  <section className="min-h-[74vh] flex flex-col pt-40 justify-center text-center  ">
    <div className="w-full h-full px-[5%] xl:px-[18%]">
      <h1 className="hidden md:flex group text-4xl md:text-6xl lg:text-[68px]	font-satoBold text-brand_dark  flex-wrap items-center text-center justify-center ">
        <span>Administra la</span>
        <Calendar className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] mx-4  md:w-14 md:h-14 lg:w-16 lg:h-16" />{" "}
        <span>agenda </span>
        <span>
          de tu negocio en un solo lugar con IA
          <Sparkles />
        </span>
      </h1>
      <h1 className=" flex md:hidden group text-4xl md:text-6xl lg:text-7xl	font-satoBold text-brand_dark flex-wrap items-center text-center justify-center ">
        <span>Administra la</span>
      </h1>
      <h1 className="flex md:hidden group text-4xl md:text-6xl lg:text-7xl	font-satoBold text-brand_dark flex-wrap items-center text-center justify-center ">
        <Calendar className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] mx-4" />{" "}
        <span>agenda </span>
        <span>
          de tu negocio en un solo lugar con IA
          <Sparkles />
        </span>
      </h1>
      <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6">
        Agenda de manera sencilla con ayuda de tu agente IA, realiza cobros,
        manda recordatorios a tus clientes y envía encuestas de satisfacción
      </p>
      <div className="flex gap-8 mt-12 justify-center ">
        <PrimaryButton as="Link" to="/signin">
          Probar gratis por 30 días <ArrowRight />
        </PrimaryButton>
        <a
          href="https://wa.me/525539111285?text=¡Hola!%20Quiero%20agendar%20un%20demo."
          target="_blank"
          rel="noreferrer"
        >
          <SecondaryButton>Agendar demo </SecondaryButton>
        </a>
      </div>
    </div>
  </section>
)

export const ScrollReviews = ({ ...props }: { props?: unknown }) => (
  <section className="flex flex-col gap-6 md:gap-10 lg:gap-40 z-60 overflow-x-clip overflow-y-visible pb-12 w-full items-start md:items-center mt-10 md:mt-0 ">
    <div className="flex justify-center xl:justify-between pr-0  gap-6 lg:gap-20 ">
      <div className="w-[120px] lg:w-[320px] md:flex justify-center hidden">
        <LineSteak />
      </div>

      <Parallax
        speed={-2}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardSmall
          className="rotate-[4deg] -left-4 md:left-0 "
          name="Paola Alvarado"
          rol="Nutrióloga"
          comment="Desde que uso Deník, administrar mis citas es más fácil. Mis clientes agendan directamente en cualquier momento. "
          img="https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=800"
        />
      </Parallax>

      <Parallax
        speed={-3}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardImage className="-rotate-[4deg] top-16 md:top-16" />
      </Parallax>

      <Parallax
        speed={-10}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardLarge
          className="rotate-[4deg] "
          name="Luis Escobedo"
          rol="Entrenador"
          comment="Descubrí Deník hace poco, y es la agenda en línea más completa que he utilizado. "
          icon={<Search />}
          img="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800"
        />
      </Parallax>
    </div>

    <div className="flex justify-between gap-10 md:gap-20">
      <Parallax
        speed={-12}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardSmall
          className="rotate-[4deg] mt-10 md:-mt-20  "
          name="Catalina López"
          rol="Maestra de inglés"
          comment="Deník es un sistema completo de administración que me ha permitido organizar mis citas de forma digital."
          icon={<Thunder />}
          img="https://images.pexels.com/photos/3856027/pexels-photo-3856027.jpeg?auto=compress&cs=tinysrgb&w=800"
        />
      </Parallax>

      <Parallax
        speed={-8}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardImage
          className="-rotate-[4deg] top-20 md:top-0 "
          img="/images/img1.jpg"
        />
      </Parallax>

      <Parallax
        speed={-16}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardLarge
          className="rotate-[4deg] "
          name="Georgina Hernández"
          rol="Estilista"
          comment="Deník me permite tener mis citas, clientes y ventas en solo lugar."
          img="https://images.pexels.com/photos/3268732/pexels-photo-3268732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          icon={<Comment />}
        />
      </Parallax>

      <Parallax
        speed={-4}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardImage className="-rotate-[4deg] " img="/images/img4.jpg" />
      </Parallax>
    </div>

    <div className="flex justify-between  items-center  gap-10 md:gap-20 relative -mt-6 md:-mt-20">
      <span className="absolute left-20  bottom-0">
        <Arrow />
      </span>
      <span className="absolute right-28 -top-28">
        <Waves />
      </span>

      <Parallax
        speed={-12}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardImage
          className="rotate-[4deg] mt-0 md:-mt-28 -left-16 md:left-0"
          img="/images/img3.jpg"
        />
      </Parallax>

      <Parallax
        speed={-20}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardLarge
          className="-rotate-[4deg] mt-32 md:-mt-10 -left-16 md:left-0"
          name="Jose Luis González"
          rol="Médico general"
          comment="Los recordatorios de Deník son la parte favorita de mis clientes, ahora ni ellos ni yo olvidamos las citas."
          icon={<Search />}
          img="https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800"
        />
      </Parallax>

      <Parallax
        speed={-8}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardImage className="rotate-[4deg] " img="/images/img2.jpg" />
      </Parallax>

      <Parallax
        speed={-16}
        className="static inline-block max-w-full"
        style={{ willChange: "transform" }}
      >
        <CardSmall
          className="-rotate-[4deg] "
          name="Paola Alvarado"
          rol="Couch"
          img="https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=800"
          comment="Desde que empecé a utilizar Deník he recibido más clientes, ya que para ellos es más fácil agendar y pagar citas en línea."
        />
      </Parallax>
    </div>
  </section>
)

export const CardSmall = ({
  className,
  img,
  name,
  rol,
  comment,
  icon,
}: {
  img?: string
  name: string
  rol: string
  comment: string
  className?: string
  icon?: ReactNode
}) => (
  <section
    className={twMerge(
      " hover:scale-95 transition-all cursor-pointer shadow-[0px_12px_32px_0px_#00000014] w-[240px] lg:w-[340px] h-[260px] lg:h-[400px] rounded-lg	p-6 relative flex flex-col justify-between",
      className,
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
        <p className="text-xs lg:text-sm text-brand_gray font-satoshi">{rol}</p>
      </div>
    </article>
    <p className="text-base lg:text-2xl font-satoMedium text-brand_dark ">
      {comment}
    </p>
    <span className=" absolute right-6 -bottom-8 ">
      {icon ? icon : <Rocket />}
    </span>
  </section>
)
export const CardLarge = ({
  className,
  img,
  name,
  rol,
  comment,
  icon,
}: {
  className: string
  img?: string
  name: string
  rol: string
  comment: string
  icon?: ReactNode
}) => (
  <section
    className={twMerge(
      " hover:scale-95 transition-all cursor-pointer shadow-[0px_12px_32px_0px_#00000014] w-[220px] lg:w-[280px] h-[300px] md:h-[380px] rounded-lg	p-6 relative flex flex-col justify-between",
      className,
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
    <p className="text-base lg:text-2xl font-satoMedium text-brand_dark ">
      {comment}
    </p>
    <span className=" absolute right-6 -bottom-8 ">
      {icon ? icon : <Rocket />}
    </span>
  </section>
)

export const CardImage = ({
  className,
  img,
}: {
  className?: string
  img?: string
}) => (
  <section
    className={twMerge(
      " hover:scale-95 transition-all cursor-pointer w-[210px] h-[280px] lg:w-[420px] rounded-lg	p-6 xl:h-[280px]  relative",
      className,
    )}
  >
    <span className=" absolute -left-2 -top-2 ">
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
)

export const Features = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto pt-[0px] lg:pt-[80px]">
    <h2 className="group text-4xl lg:text-6xl	font-satoBold text-brand_dark flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4"> Impulsa</span>
      <Rocket className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10 lg:w-16 lg:h-16" />{" "}
      <span className="ml-4 mr-4"> tu </span> negocio con Deník
    </h2>
    <div className="flex justify-between items-center mt-[80px] lg:mt-[120px] flex-wrap-reverse lg:flex-nowrap gap-10 lg:gap-0">
      <div className="pr-0 lg:pr-12">
        <h2 className="font-satoBold text-2xl lg:text-4xl text-brand_dark !leading-tight">
          No más citas olvidadas: Controla y automatiza tu agenda{" "}
        </h2>
        <p className="text-brand_gray text-xl lg:text-2xl font-satoshi mt-3 lg:mt-6 mb-6 md:mb-16 ">
          Agenda sesiones con tus clientes, agrega notas y envía recordatorios.
          ¡Ahora tienes el control!
        </p>
        <PrimaryButton as="Link" to="/signin" className="w-fit">
          Crear cuenta <ArrowRight />
        </PrimaryButton>
      </div>
      <WobbleCard className="w-full md:w-[80%] mx-auto lg:w-[90%]">
        <img
          alt="vista de agenda"
          className="w-full md:hidden block "
          src="/images/agenda.png"
        />
        <img
          alt="vista de agenda"
          className="w-full hidden md:block "
          src="/images/agenda.svg"
        />
      </WobbleCard>
    </div>
    <div className="flex justify-between items-center mt-[120px] lg:mt-[160px] flex-wrap lg:flex-nowrap gap-10 lg:gap-0">
      <WobbleCard className="w-full  lg:w-[100%] min-h-auto lg:min-h-[520px] flex justify-center items-center">
        <img
          alt="notificación"
          className="w-full md:hidden block "
          src="/images/notification.png"
        />
        <img
          alt="notificación"
          className="w-full hidden md:block "
          src="/images/notification.svg"
        />
      </WobbleCard>
      <div className="pl-0 lg:pl-12">
        <h2 className="font-satoBold text-2xl lg:text-4xl text-brand_dark !leading-tight">
          ¡Que no te dejen plantad@! Envía recordatorios por email y whats app
        </h2>
        <p className="text-brand_gray text-xl lg:text-2xl font-satoshi mt-6 mb-0 md:mb-16">
          Evita pérdidas de tiempo y dinero: confirmamos tus citas y enviamos
          recordatorios a tus clientes para que no las olviden.
        </p>
      </div>
    </div>
    <div className="flex justify-between items-center mt-[120px] lg:mt-[160px]  flex-wrap-reverse lg:flex-nowrap gap-10 lg:gap-0">
      <div className="pr-0 lg:pr-12">
        <h2 className="font-satoBold text-2xl lg:text-4xl text-brand_dark !leading-tight">
          No pierdas más clientes, recibe pagos en línea
        </h2>
        <p className="text-brand_gray text-xl lg:text-2xl font-satoshi mt-6 mb-6 md:mb-16">
          Ofrece más alternativas de pago a tus clientes o pacientes con pagos
          desde tu sitio web.
        </p>
      </div>

      <WobbleCard className="w-full  lg:w-[90%] mx-auto min-h-auto lg:min-h-[520px] flex justify-center items-center">
        <img
          alt=" payment card"
          className="w-full md:hidden block "
          src="/images/payment.png"
        />
        <img
          alt=" payment card"
          className="w-full hidden md:block "
          src="/images/payment.svg"
        />
      </WobbleCard>
    </div>
    <div className="flex justify-between items-center mt-[120px] lg:mt-[160px] flex-wrap lg:flex-nowrap gap-10 lg:gap-0 ">
      <WobbleCard className="w-full  lg:w-[100%] min-h-auto lg:min-h-[520px] flex justify-center items-center">
        <img
          alt="notificación"
          className="w-full md:hidden block "
          src="/images/notification.png"
        />
        <img
          alt="notificación"
          className="w-full hidden md:block "
          src="/images/notification.svg"
        />
      </WobbleCard>
      <div className="pl-0 lg:pl-12 w-[100%] ">
        <h2 className="font-satoBold text-2xl lg:text-4xl text-brand_dark !leading-tight">
          Tu negocio funcionando, incluso cuando no estás
        </h2>
        <p className="text-brand_gray text-xl lg:text-2xl font-satoshi mt-6 mb-0 md:mb-16">
          Tu agente IA responde y agenda a tus clientes, y te ayuda a actualizar
          tu sitio web de reservas.
        </p>
        <PrimaryButton as="Link" to="/signin" className="w-fit">
          Crear cuenta <ArrowRight />
        </PrimaryButton>
      </div>
    </div>
  </section>
)
