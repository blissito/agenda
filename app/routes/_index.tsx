import type { MetaFunction } from "@remix-run/node";
import { ArrowRight } from "~/components/icons/arrowRight";
import { TopBar } from "~/components/common/topBar";
import { Rocket } from "~/components/icons/rocket";
import { Hero, ScrollReviews } from "~/components/home/Hero";
import { Banner } from "~/components/home/Banner";
import { Benefits } from "~/components/home/Benefits";
import { CompaniesScroll } from "~/components/home/CompaniesScroll";
import { BlogPreview } from "~/components/home/BlogPreview";
import { FinalCta } from "~/components/home/FinalCta";
import { Footer } from "~/components/common/Footer";
import { PrimaryButton } from "~/components/common/primaryButton";
import { Suspense } from "react";
import { ParallaxHero } from "~/components/home/ParallaxHero";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px]">
        <TopBar />
        <ParallaxHero>
          <Hero />
          <ScrollReviews />
        </ParallaxHero>
        <Banner />
        <Features />
        <Benefits />
        <CompaniesScroll />
        <BlogPreview />
        <FinalCta />
      </div>
      <Footer />
    </main>
  );
}

export const Features = ({ ...props }: { props?: unknown }) => (
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
      <img className="w-[50%]" src="/images/agenda.png" />
    </div>
    <div className="flex justify-between items-center mt-[160px]">
      <img className="w-[50%]" src="/images/notification.png" />
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
      <img className="w-[50%]" src="/images/payment.png" />
    </div>
  </section>
);
