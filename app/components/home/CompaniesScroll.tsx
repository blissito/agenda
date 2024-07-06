import { icons, muchos } from "./utils";
import { StarLights } from "../icons/starLights";

console.log("Muchos", muchos);

export const CompaniesScroll = ({ ...props }: { props?: unknown }) => (
  <section className=" relative ">
    <h2 className="group overlay text-6xl font-bold leading-normal sticky top-[32%] w-[70%] mx-auto flex flex-wrap items-center text-center justify-center ">
      La solución perfecta para
      <span className="flex flex-wrap items-center text-center justify-center">
        {" "}
        <StarLights className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
        <span className="ml-4">tu negocio </span>
      </span>
    </h2>{" "}
    <div className="max-w-7xl grid grid-cols-4 gap-y-16  gap-x-10 mx-auto my-0 text-center mt-20 pl-20 ">
      {muchos.map((icon) => icon)}
    </div>
  </section>
);
