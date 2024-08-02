import { Link } from "@remix-run/react";
import { ReactNode } from "react";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Facebook } from "~/components/icons/facebook";
import { Instagram } from "~/components/icons/insta";
import { Anchor } from "~/components/icons/link";
import { Linkedin } from "~/components/icons/linkedin";
import { Tiktok } from "~/components/icons/tiktok";
import { Twitter } from "~/components/icons/twitter";
import { Youtube } from "~/components/icons/youtube";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Website() {
  return (
    <main className=" ">
      <RouteTitle>Mi sitio web </RouteTitle>
      <section className=" grid grid-cols-4 gap-6">
        <CompanyInfo />
        <Template />
      </section>
    </main>
  );
}

export const Template = () => {
  return (
    <div className="col-span-4 lg:col-span-1">
      <div className="relative flex mb-8 ">
        <input
          className="w-full h-16 rounded-full pl-4 border-[1px] border-brand_stroke"
          placeholder="pollo"
        ></input>
        <SecondaryButton className="absolute right-2 top-2 bg-brand_dark text-white px-2 max-w-20">
          Copiar
        </SecondaryButton>
      </div>

      <img
        alt="template"
        className="w-full h-auto rounded-2xl shadow-sm"
        src="/images/templates/template1.png"
      />
      <Link to="/">
        <p className="text-brand_blue underline text-center mt-6">
          Cambiar plantilla
        </p>
      </Link>
    </div>
  );
};

export const CompanyInfo = () => {
  return (
    <div className="bg-white rounded-2xl p-8 col-span-4 lg:col-span-3">
      <div className=" relative mb-20">
        {" "}
        <img
          alt="service"
          className="w-full object-cover h-[160px] rounded-2xl "
          src="/images/serviceDefault.png"
        />
        <img
          alt="service"
          className="ml-6 -mt-16 border-[4px] border-white absolute rounded-full h-[120px] w-[120px] object-cover"
          src="/images/serviceDefault.png"
        />
      </div>
      <div className="px-6">
        <div className="flex justify-between items-center">
          {" "}
          <h2 className="text-2xl font-bold">Estudio Milan </h2>
          <SecondaryButton className="h-10"> Editar</SecondaryButton>
        </div>

        <InfoBox title="Encargad@" value="Brenda Ortega" />
        <InfoBox title="Teléfono" value="55 662 66 66" />
        <InfoBox
          title="Dirección"
          value="Av. Politécnico Nacional 114, col. centro, CDMX"
        />
        <InfoBox
          title="Descripción"
          value="Estudio Milan es una escuela de artes con más de 15 años de experiencia. Ofrecemos clases de música, canto, violín, etc. de martes a sábado."
        />
        <hr className="bg-brand_stroke my-6" />

        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Horario</h3>
          <SecondaryButton className="h-10"> Editar</SecondaryButton>
        </div>
        <InfoBox title="Lunes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Martes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Miércoles" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Jueves" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Viernes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Sábado" value="Cerrado" />
        <InfoBox title="Domingo" value="Cerrado" />
        <hr className="bg-brand_stroke my-6" />
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Servicios</h3>
          <SecondaryButton className="h-10"> Editar</SecondaryButton>
        </div>

        <div className="flex gap-x-6 flex-wrap pr-[10%]">
          <InfoService title="Clase de Piano" />
          <InfoService title="Clase de Piano" />
          <InfoService title="Clase de Piano" />
          <InfoService title="Clase de Piano" />
          <InfoService title="Clase de Piano" />
          <InfoService title="Clase de Piano" />
        </div>
        <hr className="bg-brand_stroke my-6" />
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Redes sociales</h3>
          <SecondaryButton className="h-10"> Editar</SecondaryButton>
        </div>

        <MediaBox
          icon={<Facebook />}
          link="https://dribbble.com/search/image-empty-state"
        />

        <MediaBox
          icon={<Instagram />}
          link="https://dribbble.com/search/image-empty-state"
        />
        <MediaBox
          icon={<Twitter />}
          link="https://dribbble.com/search/image-empty-state"
        />

        <MediaBox
          icon={<Tiktok />}
          link="https://dribbble.com/search/image-empty-state"
        />
        <MediaBox
          icon={<Youtube />}
          link="https://dribbble.com/search/image-empty-state"
        />
        <MediaBox
          icon={<Linkedin />}
          link="https://dribbble.com/search/image-empty-state"
        />

        <MediaBox
          icon={<Anchor />}
          link="https://dribbble.com/search/image-empty-state"
        />
      </div>
    </div>
  );
};

export const MediaBox = ({
  icon,
  link,
}: {
  link?: string;
  icon: ReactNode;
}) => {
  return (
    <section className="flex gap-6 my-4 items-center font-satoshi">
      <span>{icon}</span>
      <p className=" text-brand_gray">{link}</p>
    </section>
  );
};

export const InfoService = ({
  image,
  title,
}: {
  image?: string;
  title: string;
}) => {
  return (
    <section className="flex gap-4 my-4 items-center font-satoshi">
      <img
        alt="service"
        className="w-16 h-12 rounded object-cover"
        src={image ? image : "/images/serviceDefault.png"}
      />
      <p>{title}</p>
    </section>
  );
};

export const InfoBox = ({
  title,
  value,
}: {
  title: string;
  value?: string;
}) => {
  return (
    <section className="grid grid-cols-8 gap-6 my-4 ">
      <p className="col-span-3 text-brand_dark font-satoshi">{title}</p>
      <p className="col-span-3 text-brand_gray font-satoshi">{value}</p>
    </section>
  );
};
