import { icons, muchos, pocos } from "./utils";
import { StarLights } from "../icons/starLights";

export const CompaniesScroll = ({ ...props }: { props?: unknown }) => (
  <section className=" relative ">
    <h2 className="group overlay text-4xl lg:text-6xl font-bold leading-normal sticky top-[32%] w-full md:w-[70%] mx-auto flex flex-wrap items-center text-center justify-center ">
      La solución perfecta para
      <span className="flex flex-wrap items-center text-center justify-center">
        {" "}
        <StarLights className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10 lg:w-16 lg:h-16" />{" "}
        <span className="ml-4">tu negocio </span>
      </span>
    </h2>{" "}
    <div className="hidden md:grid max-w-7xl overflow-hidden grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-16 gap-x-10 mx-auto my-0 text-center mt-20 pl-6 lg:pl-20 ">
      {muchos.map((icon, index) => (
        <span key={index}>{icon}</span>
      ))}
    </div>
    <div className="md:hidden max-w-[90%] overflow-hidden box-border xl:max-w-7xl grid grid-cols-2  gap-y-16 gap-x-10 mx-auto my-0 text-center mt-20   ">
      {pocos.map((icon, index) => (
        <span key={index}>{icon}</span>
      ))}
    </div>
  </section>
);
