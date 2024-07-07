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
