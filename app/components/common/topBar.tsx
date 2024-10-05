import { Denik } from "../icons/denik";
import { ArrowRight } from "../icons/arrowRight";
import { PrimaryButton } from "./primaryButton";
import { Link } from "@remix-run/react";

export const TopBar = () => (
  <section className=" fixed flex justify-center w-full z-50">
    <article className="border bg-white/50 backdrop-blur border-brand_pale flex items-center h-20  max-w-7xl w-full rounded-full mx-auto mt-4 md:mt-8 pl-4 md:pl-8 pr-4 justify-between">
      <Link to="/">
        <Denik className="w-[96px]" />
      </Link>
      <div className="flex items-center gap-4 md:gap-8  text-brand_dark">
        <Link to="/features">
          <p className="font-satoshi font-medium">Features</p>
        </Link>
        <Link to="/planes">
          <p className="font-satoshi font-medium">Planes</p>
        </Link>
        <PrimaryButton as="Link" to={"/dash"} prefetch="render">
          Probar gratis <ArrowRight className="hidden md:block" />{" "}
        </PrimaryButton>
      </div>
    </article>
  </section>
);
