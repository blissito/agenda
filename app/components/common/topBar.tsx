import { type ReactNode } from "react";
import { Denik } from "../icons/denik";

import { ArrowRight } from "../icons/arrowRight";
import { PrimaryButton } from "./primaryButton";
import { Link } from "@remix-run/react";

export const TopBar = ({ ...props }: { props?: unknown }) => (
  <section className=" fixed flex justify-center w-full z-50">
    <article className="border bg-white/50 backdrop-blur border-brand_pale flex items-center h-20  max-w-7xl w-full rounded-full mx-auto mt-8 pl-4 md:pl-8 pr-4 justify-between">
      <Link to="/">
        <Denik className="w-[96px]" />
      </Link>
      <div className="flex items-center gap-8  text-brand_dark">
        <Link to="/planes">
          <p className="font-satoshi font-medium">Planes</p>
        </Link>
        <PrimaryButton>
          Probar gratis <ArrowRight />{" "}
        </PrimaryButton>
      </div>
    </article>
  </section>
);
