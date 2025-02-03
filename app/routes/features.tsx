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
  ExpressionNine,
  ExpressionOne,
  ExpressionSeven,
  ExpressionSix,
  ExpressionThree,
  ExpressionTwo,
} from "~/components/icons/expresion";
import { UserFeatures } from "~/components/icons/userFeatures";
import { twMerge } from "tailwind-merge";
import { FaFacebookF } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { RiDiscountPercentLine, RiWhatsappFill } from "react-icons/ri";
import { CiDiscount1 } from "react-icons/ci";
import { Description } from "@headlessui/react";
import { Trophy } from "~/components/icons/trophy";

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
          <h2 className="group text-4xl xl:text-6xl	 text-brand_dark !leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">No lo pienses </span>
            <Rocket className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> más.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl   text-brand_dark mb-16 mt-2 md:mt-4 leading-normal ">
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
      <div className="py-[120px] bg-[#F3F6FA] h-[800px] md:h-[1200px]  mx-auto rounded-[40px] max-w-7xl">
        <h2 className="group text-4xl lg:text-6xl	 text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
          <span className="mr-0 md:mr-4"> Para todos los negocios </span>
          <Trophy className="group-hover:animate-vibration-effect cursor-pointer w-14 h-14 md:w-16 md:h-16 mr-0 md:mr-3" />
        </h2>
        <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full text-center mx-auto md:w-[90%]">
          Di adiós a las agendas físicas, define tus horarios y servicios en tan
          solo unos minutos mientras nosotros nos encargamos de administrar el
          día a día de tu agenda.
        </p>
      </div>{" "}
      <div className="-mt-[400px] md:-mt-[840px]">
        <Carousel slides={data} />
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className=" flex flex-col   justify-center text-center max-w-[90%] xl:max-w-7xl box mx-auto pt-[160px] lg:pt-[24%] xl:pt-[16%] ">
      <h2 className="group text-4xl lg:text-6xl	 text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4"> Transforma tu negocio </span>
        <UserFeatures className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] md:w-16 md:h-16 mr-3" />
      </h2>
      <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[90%]">
        Prueba todo lo que Deník tiene para optimizar tu tiempo e impulsar tu
        negocio
      </p>
      <div className="mt-12 lg:mt-20 flex flex-col gap-8">
        <div className="grid grid-cols-4 lg:grid-cols-8 h-auto lg:h-[480px] gap-8 ">
          <div className="relative col-span-4 lg:col-span-5 h-[480px] group">
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
          <div className="col-span-4 lg:col-span-3 h-[400px] lg:h-[480px] relative group">
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
                <Cube image="/features/oxxo-logo.svg" />
                <Cube className="bg-brand_pale/50 block md:hidden lg:block" />
                <Cube className="bg-brand_pale/50 block md:hidden lg:block" />
                <Cube image="/features/g-pay.svg" />
                <Cube image="/features/american.svg" />
                <Cube image="/features/apple-pay.svg" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50" />
                <Cube className="bg-brand_pale/50 block lg:hidden" />
                <Cube className="bg-brand_pale/50 block lg:hidden" />
                <Cube className="bg-brand_pale/50 block lg:hidden" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-[440px] md:h-[360px] w-full group transition-all cursor-pointer hover:-translate-y-1 relative  ">
          <ExpressionFour className="opacity-0 absolute w-20 -right-14 bottom-16 group-hover:opacity-100 transition-all " />
          <div className="group w-full h-full p-8 text-left rounded-2xl border-[1px] border-[#EFEFEF] overflow-hidden ">
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
            <div className="mt-10 relative left-0 md:left-6 lg:left-16 flex gap-10 md:gap-40">
              <img
                className="w-52 h-fit lg:w-96 border-[1px] border-brand_stroke rounded-2xl object-cover"
                alt="template"
                src="/features/feature3-1.svg"
              />
              <img
                className="absolute z-10 top-16 lg:top-28 left-40 lg:left-80 group-hover:translate-x-3 transition-all"
                alt="cursor"
                src="/features/feature3-2.svg"
              />
              <img
                className="absolute z-10 top-16 left-80 lg:left-[480px] group-hover:-translate-x-3 transition-all"
                alt="cursor"
                src="/features/feature3-4.svg"
              />
              <img
                className="w-52 h-fit lg:w-96 border-[1px] rounded-2xl border-brand_stroke object-cover  "
                alt="template"
                src="/features/feature3-3.svg"
              />
            </div>
          </div>
        </div>
        <div className="grid col-span-4 lg:grid-cols-8 h-fit lg:h-[480px] gap-8 box-border  ">
          <div className="col-span-4 lg:col-span-3 h-[480px] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
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
          <div className="col-span-4 lg:col-span-5 relative h-[480px] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
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
              <div className="mt-6 lg:mt-16 flex justify-center gap-8">
                <div className="h-fit z-10 flex rounded-full gap-1 p-3 bg-brand_dark mt-32 ml-0 lg:ml-20">
                  <div className="h-12 hover:scale-90 transition-all bg-white grid place-content-center text-2xl w-12 rounded-full border-[1px] border-brand_stroke">
                    🔥
                  </div>
                  <div className="h-12 hover:scale-90 transition-all bg-white grid place-content-center text-2xl w-12 rounded-full border-[1px] border-brand_stroke">
                    🚀
                  </div>
                  <div className="h-12 hover:scale-90 transition-all bg-white grid place-content-center text-2xl w-12 rounded-full border-[1px] border-brand_stroke">
                    🤩
                  </div>
                </div>
                <img
                  className="w-80 -ml-20"
                  alt="qr"
                  src="/features/feature5-1.png"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grig-cols-4 lg:grid-cols-8 h-fit lg:h-[840px] gap-8 ">
          <div className="col-span-4 h-[400px] lg:col-span-2 lg:h-full  text-left relative rounded-2xl border-[1px] border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
            <ExpressionSix className="opacity-0 absolute w-20 -left-16 rotate-[-120deg] top-36 group-hover:opacity-100 transition-all " />
            <div className=" h-full overflow-hidden relative ">
              <div className="px-8 pt-8">
                <h3 className="text-2xl font-jakarta text-brand_dark">
                  Usa el dashboard de administración 📈
                </h3>
                <p className="mt-3 text-brand_gray">
                  Gestiona la agenda de tu negocio desde nuestro dashboard,
                  consulta tus ingresos, tu lista de clientes, registra tus
                  servicios y envía promociones. ¡Todo en un solo lugar!
                </p>{" "}
              </div>
              <img
                className="ml-20 md:ml-96 lg:ml-40  transition-all lg:group-hover:ml-20 md:group-hover:ml-80"
                src="/features/feature6-1.svg"
              />
              <img
                className="md:-mt-40 lg:mt-0 mt-0 -ml-20 group-hover:-ml-8 transition-all  "
                src="/features/feature6-2.svg"
              />
              <img
                className="ml-48 w-36 group-hover:ml-32 transition-all  "
                src="/features/feature6-3.svg"
              />
            </div>
          </div>
          <div className="col-span-4 grid grid-cols-4 gap-8">
            <div className="col-span-4 p-8 text-left h-[428px] relative rounded-2xl border-[1px] border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1">
              <ExpressionEight className="opacity-0 absolute w-20 -right-10 bottom-1 group-hover:opacity-100 transition-all " />

              <h3 className="text-2xl font-jakarta text-brand_dark">
                Integra tu agenda con tu fanpage en redes sociales 🚀
              </h3>
              <p className="mt-3 text-brand_gray">
                Conecta tus redes sociales a Deník, para que con un clic tus
                clientes puedan agendar en línea desde Facebook o Instagram.
              </p>
              <div className="flex justify-center mt-20">
                <div className="border-[1px] hover:scale-90 transition-all -rotate-12 mt-4 flex items-center justify-center border-brand_stroke w-32 h-32 rounded-2xl bg-[#3E589A]">
                  <FaFacebookF className="text-[100px] text-white" />
                </div>
                <div className="border-[1px] hover:scale-90 transition-all z-10 flex items-center justify-center border-brand_stroke bg-cover w-32 h-32 rounded-2xl bg-instaback">
                  <AiFillInstagram className="text-[100px] text-white" />
                </div>
                <div className="border-[1px] hover:scale-90 transition-all rotate-12 mt-4 flex items-center justify-center border-brand_stroke w-32 h-32 rounded-2xl bg-[#6DD564]">
                  <RiWhatsappFill className="text-[100px] text-white" />
                </div>
              </div>
            </div>
            <div className="col-span-4 group h-[428px] p-8 text-left rounded-2xl border-[1px] border-brand_stroke hover:-translate-y-1 hover:-translate-x-1">
              <ExpressionNine className="opacity-0 rotate-180 absolute w-20 -left-16 -bottom-16 group-hover:opacity-100 transition-all " />

              <h3 className="text-2xl font-jakarta text-brand_dark">
                Crea expedientes para tus clientes 📁
              </h3>
              <p className="mt-3 text-brand_gray">
                ¿Necesitas agregar documentos o guardar información extra? Ten
                acceso a la información que necesitas en cualquier momento
                creando expedientes para tus clientes.
              </p>
              <div className="relative ">
                <img
                  className="absolute z-10 w-[72px] group-hover:w-24 group-hover:-translate-y-5 group-hover:-translate-x-5 transition-all"
                  alt="user"
                  src="/features/feature8-2.svg"
                />
                <img
                  className="mt-16"
                  src="/features/feature8-1.svg"
                  alt="features"
                />
              </div>
            </div>
          </div>
          <div className="group col-span-4 md:col-span-2 h-full p-8 text-left relative rounded-2xl border-[1px] border-[#EFEFEF]  group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1">
            <ExpressionSeven className="opacity-0 rotate-90 absolute w-20 -right-16 -bottom-16 group-hover:opacity-100 transition-all " />
            <h3 className="text-2xl font-jakarta text-brand_dark">
              Recibe soporte prioritario 🎧
            </h3>
            <p className="mt-3 text-brand_gray">
              Nuestro objetivo es que tengas la mejor experiencia de
              agendamiento en Deník.me, así que siempre podrás contactarnos
              directamente para consultar dudas o resolver problemas, y ¿por qué
              no? Tus ideas para mejorar Deník. Tiempo de respuesta: Máx 48hrs.
            </p>
            <div className="flex relative mt-16">
              <div className="bg-brand_pale group-hover:rotate-0 group-hover:translate-x-6 transition-all w-40 h-48 rounded-2xl absolute left-0 -rotate-6"></div>
              <div className="bg-brand_pale w-40 h-48 rounded-2xl absolute right-0 rotate-6 group-hover:rotate-0 group-hover:-translate-x-6 transition-all"></div>
              <img
                className="mx-auto z-10 shadow-xl rounded-2xl"
                alt="control desk"
                src="/features/feature9-1.svg"
              />
            </div>
            <button className="w-full h-12 rounded-full text-white bg-brand_blue mx-auto mt-12">
              Contactar
            </button>
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
    description:
      "Permite a actuales y nuevos estudiantes conocer tus clases y horarios, y agendar clases completamente en línea",
    src: "https://i.imgur.com/GOeor8Yl.jpg",
    content: "You can do more with AI.",
  },
  {
    category: "Estudio de belleza",
    title: "Estudio de belleza",
    description:
      "Olvídate de organizar tu día a tía de forma tradicional, nos encargamos de tu agenda y tú te encargas de lo más improtante: tus clientes.",
    src: "https://i.imgur.com/FTagU5xm.jpg",
    content: "You can do more with AI.",
  },
  {
    category: "Gimnasios",
    title: "Entrenador personal",
    description:
      "Deja de perder tiempo agendando citas a mano, ahora tus clientes pueden agendar y pagar con anticipación desde tu sitio web.",
    src: "https://i.imgur.com/nVjjfGTl.jpg",
    content: "You can do more with AI.",
  },

  {
    category: "Centros deportivos",
    title: "Centros deportivos",
    description:
      "Olvídate del trabajo administrativo, automatiza tu agenda con Deník, desde cobros hasta recordatorios para tus clientes.",
    src: "https://i.imgur.com/DLhUX62l.jpg",
    content: "You can do more with AI.",
  },
  {
    category: "Spas",
    title: "Spas",
    description:
      "Que no te dejen esperando, disminuye la inasistencia y las cancelaciones de último momento automatizando el proceso de agendamiento con Deník.",
    src: "https://i.imgur.com/tTvKLpGl.jpg",
    content: "You can do more with AI.",
  },
  {
    category: "Agencias turísticas",
    title: "Agencias turísticas",
    description:
      "Comparte tu sitio web de agendamiento y llega a más clientes, aumenta tus reservas y cobra directamente sin intermediarios. ",
    src: "https://i.imgur.com/gwpepotl.jpg",
    content: "You can do more with AI.",
  },
  {
    category: "Consultorios médicos",
    title: "Consultorios médicos",
    description:
      "Lleva tu consulta al siguiente nivel con nuestra plataforma de agendamiento en línea, permite a tus clientes conocer tus horarios disponibles y agendar de forma fácil.",
    src: "https://i.imgur.com/BOV30Mfl.jpg",
    content: "You can do more with AI.",
  },
  {
    category: "Clínica Veterinaria",
    title: "Clínica Veterinaria",
    description:
      "Administrar tu agenda ya no es un problema, agendamiento, cobros y recordatorios: déjanoslo a nosotros. Tú solo enfocate en esas mascotas que te necesitan. ",
    src: "https://i.imgur.com/BePLg7Cl.jpg",
    content: "You can do more with AI.",
  },
  {
    category: "Coaching y consultoría",
    title: "Coaching y consultoría",
    description:
      "No hagas esperar a tus clientes y evita los tiempo muertos entre citas, optimiza tu tiempo utilizando nuestra agenda en línea. ",
    src: "https://i.imgur.com/wNfoxUk.jpg",
    content: "You can do more with AI.",
  },
];
