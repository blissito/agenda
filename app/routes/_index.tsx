import type { MetaFunction } from "@remix-run/node";
import { TopBar } from "~/components/common/topBar";
import { Banner } from "~/components/home/Banner";
import { Benefits } from "~/components/home/Benefits";
import { CompaniesScroll } from "~/components/home/CompaniesScroll";
import { BlogPreview } from "~/components/home/BlogPreview";
import { FinalCta } from "~/components/home/FinalCta";
import { Footer } from "~/components/common/Footer";
import { ParallaxHero } from "~/components/home/ParallaxHero";
import { Features, Hero, ScrollReviews } from "~/components/home/home";
import { People } from "~/components/icons/people";
import { Suspense } from "react";
import getBasicMetaTags from "~/utils/getBasicMetaTags";

export const meta: MetaFunction = () =>
  getBasicMetaTags({
    title: "Deník | Tu agenda en un solo lugar",
    description: "description",
  });

export default function Index() {
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px]">
        <TopBar />
        <ParallaxHero>
          <Hero />
          <ScrollReviews />
        </ParallaxHero>
        {/* @TODO: 👷🏼‍♂️ We need to fix thist Meteor error in the console
        This is because Math.random values does not match between server and client. */}
        <Suspense fallback="Cargando...">
          <Banner />
        </Suspense>
        <Features />
        <Benefits />
        <CompaniesScroll />
        <BlogPreview />
        <FinalCta>
          <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">Tu agenda. </span>
            <People className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> Tus clientes.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-bold  text-brand_dark mb-16 leading-normal ">
            Tu negocio.
          </h2>
        </FinalCta>
      </div>
      <Footer />
    </main>
  );
}
