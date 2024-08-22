import type { MetaFunction } from "@remix-run/node";
import { TopBar } from "~/components/common/topBar";
import { FinalCta } from "~/components/home/FinalCta";
import { Footer } from "~/components/common/Footer";
import { Rocket } from "~/components/icons/rocket";
import { HandShake } from "~/components/icons/handshake";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { ArrowRight } from "~/components/icons/arrowRight";
import { Check } from "~/components/icons/check";
import { Lamp } from "~/components/icons/lamp";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import { Bubble } from "~/components/icons/Bubble";
import { ArrowCollapse } from "~/components/icons/arrowCollapse";
import { HoverEffect } from "~/components/common/CardHoverEffect";
import { Denik } from "~/components/icons/denik";
import { Banner } from "~/components/home/Banner";

export const meta: MetaFunction = () => {
  return [
    { title: "Planes" },
    { name: "description", content: "Escoge tu plan" },
  ];
};

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
      <div className="bg-white rounded-b-[40px] overflow-hidden">
        <TopBar />
        <Pricing />
        <Suspense fallback="Cargando...">
          <Banner />
        </Suspense>
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
        question="¿Qué es una agenda en línea o sitio web de citas en línea?"
        answer="Una agenda en línea o sitio web de citas en Deník es una herramienta virtual diseñada para facilitar la organización y gestión de citas. Permitendo a los usuarios programar, editar y dar seguimiento a sus citas 100% en línea, además de cobrar sus servicios y enviar recordatorios a través de una plataforma accesible desde cualquier dispositivo con conexión a internet. "
      />
      <Question
        question="¿Cómo puedo registrarme y empezar a usar Deník?"
        answer="Puedes registrarte fácilmente creando una cuenta desde el sitio web y comenzar con una prueba gratuita de 30 días para explorar todas las funciones disponibles. "
      />
      <Question
        question="¿Cuáles son los planes y precios?"
        answer={
          <p>
            Deník ofrece dos planes:{" "}
            <strong className="font-satoMiddle">
              {" "}
              Profesional y Enterprisse
            </strong>
            . Te recomendamos el Plan Profesional si eres un emprendedor
            independiente que no requiere manejar sucursales o staff, y el Plan
            Enterprisse si tu negocio cuenta con sucursales o staff con un
            calendario independiente cada uno. En cuánto al precio, el Plan
            Profesional tiene un costo de{" "}
            <strong className="font-satoMiddle"> $199 mxn o $12 USD</strong>, y
            el Plan Enterprisse de{" "}
            <strong className="font-satoMiddle">$499 mxn o $30 USD</strong> . Al
            contratar el Plan anual recibirás 20% de descuento.
          </p>
        }
      />
      <Question
        question="¿Cómo se realiza el pago de la suscripción?"
        answer="Después de suscribirte y elegir una forma de pago ( tarjeta de débito o crédito), los siguientes cargos se realizará de forma anual o mensual en función del plan seleccionado.  "
      />

      <Question
        question="¿Cómo me ayuda una agenda en línea para clientes?"
        answer="Una agenda en línea permiten simplificar el proceso de agendamiento para tus clientes, te permite gestionar tus citas, ingresos y servicios desde un solo lugar, mientas les permite a tus clientes agendar, consultar y editar sus citas de forma 100% digital. Con un agenda en línea tu negocio recibe más citas y aumentar tus ingresos. "
      />
      <Question
        question="¿Puedo personalizar mi página de citas?"
        answer="Sí, Deník permite personalizar tu sitio web de citas para que se ajuste a la imagen de tu negocio y facilite el agendamiento de citas por parte de tus clientes. "
      />
      <Question
        question="¿Qué tipo de negocios pueden usar Deník?"
        answer="Deník es ideal para diversos negocios como consultorios médicos, centros educativos, clases independientes, gimnasios, clínicas, salones de belleza, estudios de yoga, centros deportivos y muchos más. "
      />
      <Question
        question="¿Qué beneficios ofrecen los recordatorios automáticos?"
        answer="Sabemos que la inasistencia es una problemática recurrente, por lo que los recordatorios automáticos por correo y WhatsApp ayudan a que tus clientes no olviden sus citas, reduciendo cancelaciones y mejorando la eficiencia. "
      />
      <Question
        question="¿Es seguro usar Deník para recibir pagos?"
        answer="Sí, Deník utiliza medidas de seguridad avanzadas para garantizar que todas las transacciones sean seguras. Tanto tus datos como los de tus clientes, están protegidos."
      />
      <Question
        question="¿Qué hago si tengo problemas con mi cuenta?"
        answer={
          <p>
            "Si tienes algún problema, puedes contactar al soporte de Deník a
            través del correo{" "}
            <strong className="text-brand_blue underline">
              hola@denik.me{" "}
            </strong>{" "}
            y nuestro equipo te ayudará."
          </p>
        }
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
        <p className="w-[90%] font-satoMiddle">{question}</p>
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
