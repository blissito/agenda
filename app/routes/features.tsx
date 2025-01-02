import React, { useEffect } from "react";
import { TopBar } from "~/components/common/topBar";
import { FinalCta } from "~/components/home/FinalCta";
import { Footer } from "~/components/common/Footer";
import { Rocket } from "~/components/icons/rocket";
import { Calendar } from "~/components/icons/calendar";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { ArrowRight } from "~/components/icons/arrowRight";
import { HandShake } from "~/components/icons/handshake";
import { Card, Carousel } from "~/components/ui/cards-carrusel";
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

export default function Index() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] overflow-hidden ">
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
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));
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
        <Carousel items={cards} />
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className=" flex flex-col  justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto pt-[200px] lg:pt-[24%] xl:pt-[16%] ">
      <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4"> Funcionalidades </span>
        <UserFeatures className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] md:w-16 md:h-16 mr-3" />
      </h2>
      <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[90%]">
        Prueba todo lo que Deník tiene para ti y tu negocio
      </p>
      <div className="mt-20 flex flex-col gap-8">
        <div className="grid grid-cols-8 h-[480px] gap-8 ">
          <div className="col-span-5 h-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF] relative group transition-all cursor-pointer hover:-translate-x-1 hover:-translate-y-1 ">
            <ExpressionOne className="opacity-0 absolute w-20 rotate-[270deg] -left-12 -top-12 group-hover:opacity-100 transition-all " />
            <h3 className="text-2xl font-jakarta text-brand_dark">
              Agenda en línea
            </h3>
            <p className="mt-3 text-brand_gray">
              Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
              fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
              sagittis penatibus. Felis diam nisl in viverra.
            </p>
          </div>
          <div className="col-span-3 h-full  rounded-2xl border-[1px]  p-8 text-left border-[#EFEFEF] relative group transition-all cursor-pointer hover:translate-x-1 hover:-translate-y-1 ">
            <ExpressionTwo className="opacity-0 absolute w-20 -right-14 -top-16 group-hover:opacity-100 transition-all " />
            <h3 className="text-2xl font-jakarta  text-brand_dark">
              Recibe pagos en línea
            </h3>
            <p className="mt-3 text-brand_gray">
              Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
              fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
              sagittis penatibus. Felis diam nisl in viverra.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-8 h-[360px] gap-8 group transition-all cursor-pointer hover:-translate-y-1  ">
          <ExpressionFour className="opacity-0 absolute w-20 -right-14 bottom-16 group-hover:opacity-100 transition-all " />
          <div className="col-span-8 h-full  p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF]">
            <h3 className="text-2xl font-jakarta text-brand_dark">
              Obtén tu propio sitio web de reservas y personalizalo
            </h3>
            <p className="mt-3 text-brand_gray">
              Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
              fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
              sagittis penatibus. Felis diam nisl in viverra.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-8 h-[480px] gap-8 ">
          <div className="col-span-3 h-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
            <ExpressionFive className="opacity-0 absolute w-20 -left-14 rotate-[180deg]  -bottom-14 group-hover:opacity-100 transition-all " />
            <h3 className="text-2xl font-jakarta text-brand_dark">
              Envía recordatorios automatizados
            </h3>
            <p className="mt-3 text-brand_gray">
              Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
              fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
              sagittis penatibus. Felis diam nisl in viverra.
            </p>
          </div>
          <div className="col-span-5 h-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF]  group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1">
            <ExpressionThree className="opacity-0 absolute w-20 -right-14   top-28 group-hover:opacity-100 transition-all " />
            <h3 className="text-2xl font-jakarta text-brand_dark">
              Ofrece descuentos o tarjetas de regalos a tus clientes
            </h3>
            <p className="mt-3 text-brand_gray">
              Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
              fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
              sagittis penatibus. Felis diam nisl in viverra.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-8 h-[840px] gap-8 ">
          <div className="col-span-2 h-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
            <ExpressionSix className="opacity-0 absolute w-20 -left-16 rotate-[-120deg] top-36 group-hover:opacity-100 transition-all " />

            <h3 className="text-2xl font-jakarta text-brand_dark">
              Dashboard de administración
            </h3>
            <p className="mt-3 text-brand_gray">
              Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
              fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
              sagittis penatibus. Felis diam nisl in viverra.
            </p>
          </div>
          <div className="col-span-4 grid grid-cols-4 gap-8">
            <div className="col-span-4   p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
              <ExpressionEight className="opacity-0 absolute w-20 -right-10 bottom-1 group-hover:opacity-100 transition-all " />

              <h3 className="text-2xl font-jakarta text-brand_dark">
                Integra tu agenda con tu fanpage en redes sociales
              </h3>
              <p className="mt-3 text-brand_gray">
                Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
                fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
                sagittis penatibus. Felis diam nisl in viverra.
              </p>
            </div>
            <div className="col-span-4   p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF]">
              <h3 className="text-2xl font-jakarta text-brand_dark">
                Crea expedientes para tus clientes
              </h3>
              <p className="mt-3 text-brand_gray">
                Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
                fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
                sagittis penatibus. Felis diam nisl in viverra.
              </p>
            </div>
          </div>
          <div className="col-span-2 h-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF]  group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1">
            <ExpressionSeven className="opacity-0 rotate-90 absolute w-20 -right-16 -bottom-16 group-hover:opacity-100 transition-all " />

            <h3 className="text-2xl font-jakarta text-brand_dark">
              Recibe soporte prioritario
            </h3>
            <p className="mt-3 text-brand_gray">
              Lorem ipsum dolor sit amet consectetur. Suspendisse mauris ac
              fermentum rhoncus. Fusce eros vulputate faucibus massa egestas
              sagittis penatibus. Felis diam nisl in viverra.
            </p>
          </div>
        </div>
      </div>
    </section>
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
