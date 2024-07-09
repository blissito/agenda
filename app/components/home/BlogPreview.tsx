import { Plan } from "../icons/plan";

export const BlogPreview = ({ ...props }: { props?: unknown }) => (
  <section className="max-w-[90%] lg:max-w-7xl w-full mx-auto my-[160px]   text-center">
    <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4"> Nuestro</span>
      <Plan className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
      <span className="ml-4">blog </span>
    </h2>
    <article className="flex mt-20 gap-6 flex-wrap lg:flex-nowrap">
      <div className="w-full md:w-[50%] bg-brand_dark h-[310px] md:h-[620px] rounded-2xl"></div>
      <div className="w-full md:w-[25%] flex flex-row lg:flex-col gap-6">
        <div className="bg-brand_blue rounded-2xl w-[50%] md:w-auto h-[320px]"></div>
        <div className="bg-brand_blue rounded-2xl  w-[50%] md:w-auto h-full"></div>
      </div>
      <div className="w-full md:w-[25%] flex flex-row lg:flex-col gap-6">
        <div className="bg-brand_blue rounded-2xl  w-[50%] md:w-auto h-full"></div>
        <div className="bg-brand_blue rounded-2xl  w-[50%] md:w-auto h-[280px]"></div>
      </div>
    </article>
  </section>
);
