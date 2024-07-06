import { Plan } from "../icons/plan";

export const BlogPreview = ({ ...props }: { props?: unknown }) => (
  <section className="max-w-7xl w-full mx-auto my-[160px]   text-center">
    <h2 className="group text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
      <span className="mr-4"> Nuestro</span>
      <Plan className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
      <span className="ml-4">blog </span>
    </h2>
    <article className="flex mt-20 gap-6">
      <div className="w-[50%] bg-brand_dark h-[620px] rounded-2xl"></div>
      <div className="w-[25%] flex flex-col gap-6">
        <div className="bg-brand_blue rounded-2xl h-[320px]"></div>
        <div className="bg-brand_blue rounded-2xl h-full"></div>
      </div>
      <div className="w-[25%] flex flex-col gap-6">
        <div className="bg-brand_blue rounded-2xl h-full"></div>
        <div className="bg-brand_blue rounded-2xl h-[280px]"></div>
      </div>
    </article>
  </section>
);
