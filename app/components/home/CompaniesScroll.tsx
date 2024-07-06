import { ReactNode } from "react";
import { Barbershop } from "../icons/business/barbershop";
import { icons, muchos } from "./utils";

console.log("Muchos", muchos);

export const CompaniesScroll = ({ ...props }: { props?: unknown }) => (
  <section className=" relative ">
    <h2 className="overlay text-6xl font-bold leading-normal sticky top-[32%] w-[70%] mx-auto text-center">
      La solución perfecta para <br /> tu negocio
    </h2>

    <div className="max-w-7xl grid grid-cols-4 gap-y-16  gap-x-10 mx-auto my-0 text-center mt-20  ">
      {muchos.map((icon) => icon)}
    </div>
  </section>
);
