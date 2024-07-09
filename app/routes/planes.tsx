import type { MetaFunction } from "@remix-run/node";
import { TopBar } from "~/components/common/topBar";
import { FinalCta } from "~/components/home/FinalCta";
import { Footer } from "~/components/common/Footer";
import { Rocket } from "~/components/icons/rocket";
import { HandShake } from "~/components/icons/handshake";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ReactNode } from "react";
import { ArrowRight } from "~/components/icons/arrowRight";
import { Check } from "~/components/icons/check";
import { Lamp } from "~/components/icons/lamp";
import { Banner } from "~/components/home/Banner";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import { ArrowDown } from "~/components/icons/ArrowDown";
import { Bubble } from "~/components/icons/Bubble";

export const meta: MetaFunction = () => {
  return [
    { title: "Planes" },
    { name: "description", content: "Welcome to Remix!" },
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
          <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">No lo pienses </span>
            <Lamp className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> más.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-bold  text-brand_dark mb-16 leading-normal ">
            ¡Empieza ahora!
          </h2>
        </FinalCta>
      </div>
      <Footer />
    </main>
  );
}

export const Faq = () => (
  <section className="max-w-[90%] lg:max-w-7xl mx-auto pt-[0px] lg:pt-[80px]">
    <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4">Preguntas </span>
      <Bubble className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
      <span className="ml-4"> Frecuentes</span>
    </h2>
    <div className="mt-12 md:mt-20">
      <Question
        question="¿Cómo se realiza el cobro?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Cómo se realiza el cobro?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Cómo se realiza el cobro?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Cómo se realiza el cobro?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Cómo se realiza el cobro?"
        answer="Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum "
      />
      <Question
        question="¿Cómo se realiza el cobro?"
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
  answer: ReactNode;
}) => (
  <Disclosure as="div" className="w-full ">
    {({ open }) => (
      <div className=" ">
        <DisclosureButton className="w-full text-xl md:text-2xl  font-medium text-left border-b pb-2 flex justify-between px-6 py-8">
          <h3>{question}</h3>
          <ArrowDown />
        </DisclosureButton>
        <div className="overflow-hidden py-2 text-brand_gray text-lg px-6 font-body">
          <AnimatePresence>
            {open && (
              <DisclosurePanel
                static
                as={motion.div}
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.2, ease: easeOut }}
                className="origin-top"
              >
                {answer}
              </DisclosurePanel>
            )}
          </AnimatePresence>
        </div>
      </div>
    )}
  </Disclosure>
);

export const Pricing = () => (
  <section className=" flex flex-col  justify-center text-center max-w-[90%] lg:max-w-7xl mx-auto pt-[160px] lg:pt-[16%] ">
    <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4"> Digitaliza </span>
      <HandShake className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
      tu negocio
    </h2>
    <p className="text-xl lg:text-2xl text-brand_gray font-body mt-6 w-full mx-auto md:w-[90%]">
      Olvídate de los problemas administrativos. Únete a cientos de negocios que
      usan Deník. ¿Listo para empezar hoy mismo?
    </p>
    <div>
      <div className="flex gap-12 justify-center mt-16 flex-wrap">
        <PriceCard plan="Profesional" price="$199 mxn">
          <ul className="text-left flex gap-4 flex-col text-lg text-brand_gray font-body ">
            <li className="flex gap-3">📔 Agenda en línea</li>
            <li className="flex gap-3">📋 Recordatorios automáticos</li>
            <li className="flex gap-3">💻 Sitio web para citas</li>
            <li className="flex gap-3">💰 Pagos en línea</li>
            <li className="flex gap-3">
              🧧 Programa de lealtad, descuentos y tarjetas de regalo
            </li>
            <li className="flex gap-3">😊 Encuesta de satisfacción</li>
            <li className="flex gap-3">👧🏻Expediente de clientes</li>
          </ul>
          <PrimaryButton>
            Probar gratis <ArrowRight />{" "}
          </PrimaryButton>
        </PriceCard>
        <PriceCard plan="Enterprisse" price="$499 mxn">
          <ul className="text-left flex gap-4 flex-col text-lg text-brand_gray font-body  ">
            <li className="flex gap-3">
              <Check /> Agenda en línea
            </li>
            <li className="flex gap-3">
              <Check /> Recordatorios automáticos
            </li>
            <li className="flex gap-3">
              <Check /> Sitio web para citas
            </li>
            <li className="flex gap-3">
              <Check /> Pagos en línea
            </li>
            <li className="flex gap-3">
              <Check /> Programa de lealtad, descuentos y tarjetas de regalo
            </li>
            <li className="flex gap-3">
              <Check /> Encuesta de satisfacción
            </li>
            <li className="flex gap-3">
              <Check /> Expediente de clientes
            </li>
            <li className="flex gap-3">
              <Check /> Administración de sucursales
            </li>
            <li className="flex gap-3">
              <Check /> Administración de usuarios
            </li>
          </ul>
          <PrimaryButton>
            Contactar al equipo de ventas <ArrowRight />{" "}
          </PrimaryButton>
        </PriceCard>
      </div>
    </div>
  </section>
);

export const PriceCard = ({
  plan,
  price,
  children,
}: {
  plan?: string;
  price?: string;
  children?: ReactNode;
}) => (
  <section className="group cursor-pointer bg-white border-[1px] border-brand_ash rounded-2xl	max-w-[480px] h-[auto] px-8 py-10  text-left flex flex-col  relative  hover:-translate-y-2">
    <img
      className="absolute w-[200px] -right-16 -top-12 md:-right-20 md:-top-10 opacity-0 group-hover:opacity-100  transition-all"
      src="/images/Rocket.gif"
    />
    <span className="text-xl uppercase font-body_bold text-brand_blue ">
      {plan}
    </span>
    <p className="text-5xl md:text-6xl	font-body_bold font-bold mt-4">{price}</p>
    <div className="mt-8 h- w-full grow flex flex-col justify-between gap-12">
      {children}
    </div>
  </section>
);
