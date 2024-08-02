import type { MetaFunction } from "@remix-run/node";
import { TopBar } from "~/components/common/topBar";
import { FinalCta } from "~/components/home/FinalCta";
import { Footer } from "~/components/common/Footer";
import { Rocket } from "~/components/icons/rocket";
import { HandShake } from "~/components/icons/handshake";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ReactNode, useState } from "react";
import { ArrowRight } from "~/components/icons/arrowRight";
import { Check } from "~/components/icons/check";
import { Lamp } from "~/components/icons/lamp";
import { Banner } from "~/components/home/Banner.client";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import { Bubble } from "~/components/icons/Bubble";
import { ArrowCollapse } from "~/components/icons/arrowCollapse";
import { HoverEffect } from "~/components/common/CardHoverEffect";
import { Denik } from "~/components/icons/denik";

export const meta: MetaFunction = () => {
  return [
    { title: "Planes" },
    { name: "description", content: "Escoge tu plan" },
  ];
};

export default function Index() {
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] overflow-hidden">
        <TopBar />
        <Pricing />
        <Banner />
        <Faq />
        <FinalCta>
          <h2 className="group text-4xl xl:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">No lo pienses </span>
            <Lamp className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
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

export const Faq = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto pt-[0px] lg:pt-[80px]">
    <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4">Preguntas </span>
      <Bubble className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
      <span className="ml-4"> frecuentes</span>
    </h2>
    <div className="mt-20">
      <Question
        question="¿Cómo funciona la suscripción?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Puedo cambiar mi plan en cualquier momento?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Qué formas de pago aceptan?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Cuál es la comisión de los pagos en línea?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Puedo cancelar mi plan cuando yo quiera?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Qué hago si ya no tengo acceso al correo con el que creé mi cuenta?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
    </div>
  </section>
);

export const Question = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b-brand_pale border-b-[1px]">
      <button
        className="w-full px-6 py-8 text-xl md:text-2xl font-medium text-left flex justify-between"
        onClick={() => {
          setOpen((o) => !o);
        }}
      >
        <p className="w-[90%]">{question}</p>
        {open ? (
          <ArrowCollapse className="rotate-180 transition-all" />
        ) : (
          <ArrowCollapse className="transition-all" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          >
            <p className="text-lg text-brand_gray font-satoshi px-6 pb-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Pricing = () => (
  <section className=" flex flex-col  justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto pt-[200px] lg:pt-[24%] xl:pt-[16%] ">
    <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4"> Digitaliza </span>
      <HandShake className="group-hover:animate-vibration-effect cursor-pointer w-16 h-16 md:w-20 md:h-20 mr-3" />{" "}
      tu negocio
    </h2>
    <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[90%]">
      Olvídate de los problemas administrativos. Únete a cientos de negocios que
      usan Deník. ¿Listo para empezar hoy mismo?
    </p>
    <div>
      <div className="flex gap-12 justify-center mt-16 flex-wrap ">
        <HoverEffect items={items} />
      </div>
    </div>
  </section>
);

export const ListStar = () => {
  return <img className="w-6 h-6" src="/images/star.svg" />;
};

export const items = [
  {
    plan: "Profesional",
    price: "$199 mxn",
    children: (
      <div className="h-full flex flex-col">
        <ul className="text-left flex gap-4 flex-col text-lg text-brand_gray font-satoshi ">
          <li className="flex gap-3">
            {" "}
            <ListStar /> Agenda en línea
          </li>
          <li className="flex gap-3">
            {" "}
            <ListStar /> Recordatorios automáticos
          </li>
          <li className="flex gap-3">
            {" "}
            <ListStar /> Sitio web para citas
          </li>
          <li className="flex gap-3">
            {" "}
            <ListStar /> Pagos en línea
          </li>
          <li className="flex gap-3">
            <ListStar /> Programa de lealtad, descuentos y tarjetas de regalo
          </li>
          <li className="flex gap-3">
            {" "}
            <ListStar /> Encuesta de satisfacción
          </li>
          <li className="flex gap-3">
            {" "}
            <ListStar /> Expediente de clientes
          </li>
        </ul>
        <PrimaryButton className="mt-auto">
          Probar gratis <ArrowRight />{" "}
        </PrimaryButton>
      </div>
    ),
    link: "https://stripe.com",
  },
  {
    plan: "Empresarial",
    price: "$499 mxn",
    children: (
      <div className="h-full flex flex-col">
        <ul className="text-left flex gap-4 flex-col text-lg text-brand_gray font-satoshi  ">
          <li className="flex gap-3">
            <ListStar /> Agenda en línea
          </li>
          <li className="flex gap-3">
            <ListStar /> Recordatorios automáticos
          </li>
          <li className="flex gap-3">
            <ListStar /> Sitio web para citas
          </li>
          <li className="flex gap-3">
            <ListStar /> Pagos en línea
          </li>
          <li className="flex gap-3">
            <ListStar /> Programa de lealtad, descuentos y tarjetas de regalo
          </li>
          <li className="flex gap-3">
            <ListStar /> Encuesta de satisfacción
          </li>
          <li className="flex gap-3">
            <ListStar /> Expediente de clientes
          </li>
          <li className="flex gap-3">
            <ListStar /> Administración de sucursales
          </li>
          <li className="flex gap-3">
            <ListStar /> Administración de usuarios
          </li>
        </ul>{" "}
        <PrimaryButton className=" mt-10 ">
          Contactar a ventas <ArrowRight />{" "}
        </PrimaryButton>
      </div>
    ),
    link: "https://stripe.com",
  },
];
