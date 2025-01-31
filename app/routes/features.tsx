import React, { useEffect } from "react";
import { TopBar } from "~/components/common/topBar";
import { FinalCta } from "~/components/home/FinalCta";
import { Footer } from "~/components/common/Footer";
import { Rocket } from "~/components/icons/rocket";
import { HandShake } from "~/components/icons/handshake";
import { Carousel } from "~/components/ui/cards-carrusel";
import {
  ExpressionEight,
  ExpressionFive,
  ExpressionFour,
  ExpressionOne,
  ExpressionSeven,
  ExpressionSix,
  ExpressionThree,
  ExpressionTwo,
} from "~/components/icons/expresion";
import { UserFeatures } from "~/components/icons/userFeatures";
import { twMerge } from "tailwind-merge";

export default function Index() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);
  return (
    <main className="bg-brand_dark w-full overflow-hidden">
      <div className="bg-white w-full overflow-hidden rounded-b-[40px]  ">
        <TopBar />
        <Features />
        <Business />
        <FinalCta>
          <h2 className="group text-4xl xl:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">No lo pienses </span>
            <Rocket className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> más.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-bold  text-brand_dark mb-16 mt-4 leading-normal ">
            ¡Empieza ahora!
          </h2>
        </FinalCta>
      </div>
      <Footer />
    </main>
  );
}

const Business = () => {
  // const cards = data.map((card, index) => (
  //   <Card key={card.src} card={card} index={index} />
  // ));
  return (
    <section className="my-[160px] relative ">
      <div className="py-[120px] bg-[#F3F6FA] h-[1200px]  mx-auto rounded-[40px] max-w-7xl">
        <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
          <span className="mr-4"> Para todos los negocios </span>
          <HandShake className="group-hover:animate-vibration-effect cursor-pointer w-16 h-16 md:w-20 md:h-20 mr-3" />
        </h2>
        <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full text-center mx-auto md:w-[90%]">
          Toma el control de la agenda de tu negocio, prueba Deník y Prueba la
          mejor agenda en línea y toma el control de la agenda de t
        </p>
      </div>{" "}
      <div className="-mt-[900px]">
        <Carousel slides={data} />
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className=" flex flex-col   justify-center text-center max-w-[90%] xl:max-w-7xl box mx-auto pt-[200px] lg:pt-[24%] xl:pt-[16%] ">
      <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4"> Funcionalidades </span>
        <UserFeatures className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] md:w-16 md:h-16 mr-3" />
      </h2>
      <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[90%]">
        Prueba todo lo que Deník tiene para ti y tu negocio
      </p>
      <div className="mt-20 flex flex-col gap-8">
        <div className="grid grid-cols-8 h-[480px] gap-8 ">
          <div className="relative col-span-5 h-[480px] group">
            <ExpressionOne className="opacity-0 absolute w-20 rotate-[270deg] -left-12 -top-12 group-hover:opacity-100 transition-all " />
            <div className=" overflow-hidden h-full w-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF] relative  transition-all cursor-pointer group-hover:-translate-x-1 group-hover:-translate-y-1 ">
              <h3 className="text-2xl font-jakarta text-brand_dark">
                Agenda en línea 🗓️
              </h3>
              <p className="mt-3 text-brand_gray">
                ¡Administrar tu agenda nunca fue tan fácil! Permite a tus
                clientes agendar una cita cuando quieran desde donde quieran
                100% en línea. Con Deník llevar el control de tu agenda es muy
                fácil, configura tus horarios de atención, servicios, precios y
                descuentos y empieza a recibir a tus clientes.
              </p>
              <img
                className="left-72 top-40 absolute"
                alt="website"
                src="/features/feature1-2.svg"
              />
              <img
                className="absolute top-56 group-hover:translate-x-16 transition-all"
                alt="cita confirmada"
                src="/features/feature1-1.svg"
              />{" "}
            </div>
          </div>
          <div className="col-span-3 h-[480px] relative group">
            <ExpressionTwo className="opacity-0 absolute w-20 -right-14 -top-16 group-hover:opacity-100 transition-all " />
            <div className="w-full h-full overflow-hidden rounded-2xl border-[1px]   text-left border-[#EFEFEF]   transition-all cursor-pointer hover:translate-x-1 hover:-translate-y-1 ">
              <div className="px-8 pt-8">
                <h3 className="text-2xl font-jakarta  text-brand_dark">
                  Recibe pagos en línea 💳
                </h3>
                <p className="mt-3 text-brand_gray">
                  Consiente a tus clientes ofreciendoles más formas de pago, con
                  Deník tus clientes pueden pagar con tarjeta de debito y
                  crédito, por transferencia bancaria y OXXO, e incluso pueden
                  pagar a meses sin intereses.
                </p>
              </div>
              <div className="flex gap-5  flex-wrap mt-12 w-[110%] -ml-4 ">
                <Cube className="bg-brand_pale/50" />
                <Cube image="/features/mastercard.svg" />
                <Cube image="/features/visa.svg" />
                <Cube image="/features/mastercard.svg" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube image="/features/mastercard.svg" />
                <Cube image="/features/mastercard.svg" />
                <Cube image="/features/mastercard.svg" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-[360px] w-full group transition-all cursor-pointer hover:-translate-y-1 relative  ">
          <ExpressionFour className="opacity-0 absolute w-20 -right-14 bottom-16 group-hover:opacity-100 transition-all " />
          <div className="w-full h-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF] ">
            <h3 className="text-2xl font-jakarta text-brand_dark">
              Obtén tu propio sitio web de reservas y personalízalo 🎨
            </h3>
            <p className="mt-3 text-brand_gray">
              Ya no necesitas conocimientos en programación o invertir miles de
              pesos para tener tu sitio web de agendamiento en línea. Con Deník
              tienes un sitio web personalizado para tu negocio, con tu logo, tu
              información de contacto y hasta tus redes sociales para que tus
              clientes puedes empezar a seguirte.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-8 h-[480px] gap-8 box-border  ">
          <div className="col-span-3 h-[480px] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
            <ExpressionFive className="opacity-0 absolute w-20 -left-14 rotate-[180deg]  -bottom-14 group-hover:opacity-100 transition-all " />
            <div className="text-left h-full rounded-2xl p-8 border-[1px] border-[#EFEFEF] overflow-hidden">
              <h3 className="text-2xl font-jakarta text-brand_dark">
                Envía recordatorios automatizados 📣
              </h3>
              <p className="mt-3 text-brand_gray">
                Ya no tienes que invertir tiempo en enviar SMS a tus clientes
                para recordarles sus citas, ¡Nosotros lo hacemos por ti!
                Enviamos confirmaciones por email y whats app para que tus
                clientes no vuelvan a olvidar una cita contigo.
              </p>
              <div className="flex items-start justify-center gap-8">
                <img
                  className="w-40 h-auto mt-20   group-hover:mt-6 transition-all"
                  src="/features/feature4-2.png"
                />
                <img
                  className="w-40 h-auto mt-6 group-hover:mt-20 transition-all"
                  src="/features/feature4-1.png"
                />
              </div>
            </div>
          </div>
          <div className="col-span-5 relative h-[480px] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
            <ExpressionThree className="opacity-0 absolute w-20 -right-10 rotate-90  top-28 group-hover:opacity-100 transition-all " />
            <div className="text-left h-full rounded-2xl p-8 border-[1px] border-[#EFEFEF] overflow-hidden">
              <h3 className="text-2xl font-jakarta text-brand_dark">
                Ofrece descuentos a tus clientes 🎟️
              </h3>
              <p className="mt-3 text-brand_gray">
                Premia a tus clientes ofreciendoles descuentos y programas de
                lealtad en donde acumulen puntos cada que acuden a una cita para
                después canjearlos por descuentos mayores o servicios gratis.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 h-[840px] gap-8 ">
          <div className="col-span-2 h-full  text-left relative rounded-2xl border-[1px] border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
            <ExpressionSix className="opacity-0 absolute w-20 -left-16 rotate-[-120deg] top-36 group-hover:opacity-100 transition-all " />
            <div className=" h-full overflow-hidden relative">
              <div className="p-8">
                <h3 className="text-2xl font-jakarta text-brand_dark">
                  Dashboard de administración 📈
                </h3>
                <p className="mt-3 text-brand_gray">
                  Gestiona la agenda de tu negocio desde nuestro dashboard,
                  consulta tus ingresos, tu lista de clientes, registra tus
                  servicios y envía promociones. ¡Todo en un solo lugar!
                </p>{" "}
              </div>
              <img
                className="ml-40  transition-all group-hover:ml-20"
                src="/features/feature6-1.svg"
              />
              <img
                className="-ml-20 group-hover:-ml-8 transition-all  "
                src="/features/feature6-2.svg"
              />
            </div>
          </div>
          <div className="col-span-4 grid grid-cols-4 gap-8">
            <div className="col-span-4 p-8 text-left relative rounded-2xl border-[1px] border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
              <ExpressionEight className="opacity-0 absolute w-20 -right-10 bottom-1 group-hover:opacity-100 transition-all " />

              <h3 className="text-2xl font-jakarta text-brand_dark">
                Integra tu agenda con tu fanpage en redes sociales 🚀
              </h3>
              <p className="mt-3 text-brand_gray">
                Conecta tus redes sociales a Deník, para que con un clic tus
                clientes puedan agendar en línea desde Facebook o Instagram.
              </p>
            </div>
            <div className="col-span-4   p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF]">
              <h3 className="text-2xl font-jakarta text-brand_dark">
                Crea expedientes para tus clientes 📁
              </h3>
              <p className="mt-3 text-brand_gray">
                ¿Necesitas agregar documentos o guardar información extra? Ten
                acceso a la información que necesitas en cualquier momento
                creando expedientes para tus clientes.
              </p>
            </div>
          </div>
          <div className="col-span-2 h-full p-8 text-left relative rounded-2xl border-[1px] border-[#EFEFEF]  group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1">
            <ExpressionSeven className="opacity-0 rotate-90 absolute w-20 -right-16 -bottom-16 group-hover:opacity-100 transition-all " />
            <h3 className="text-2xl font-jakarta text-brand_dark">
              Recibe soporte prioritario 🎧
            </h3>
            <p className="mt-3 text-brand_gray">
              Nuestro objetivo es que tengas la mejor experiencia de
              agendamiento en Deník.me, así que siempre podrás contactarnos
              directamente para consultar dudas o resolver problemas, y ¿por qué
              no? Tus ideas para mejorar Deník. Tiempo de respuesta: Máx 24hrs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
const Cube = ({ image, className }: { image?: string; className?: string }) => {
  return (
    <div
      className={twMerge(
        "border-[1px] border-brand_stroke w-20 h-20 rounded-2xl flex items-center justify-center",
        className
      )}
    >
      <img className="w-16 " src={image} />
    </div>
  );
};

const data = [
  {
    category: "Clases de idiomas",
    title: "Clases de idiomas",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Estudio de belleza",
    title: "Estudio de belleza",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Gimnasios",
    title: "Gimnasios",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },

  {
    category: "Centros deportivos",
    title: "Centros deportivos",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Spas",
    title: "Spas",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Experiencias turísticas",
    title: "Experiencias turísticas",
    src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
];
