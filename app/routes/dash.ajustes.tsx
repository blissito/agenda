import React, { ReactNode } from "react";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Clients() {
  return (
    <main className=" ">
      <RouteTitle>Ajustes</RouteTitle>
      <section className=" bg-white p-6 rounded-2xl max-w-4xl">
        <h3 className="text-lg font-bold">General</h3>
        <OptionBox
          title="Ubicación de tu negocio"
          description="¿Con cuánto tiempo de anticipación pueden agendar una cita los clientes?"
        ></OptionBox>
        <OptionBox
          title="Zona horaria de tu calendario"
          description="¿Con cuánto tiempo de anticipación pueden agendar una cita los clientes?"
        ></OptionBox>
        <OptionBox
          title="Disponibilidad de calendario"
          description="¿Con cuánto tiempo de anticipación pueden agendar una cita los clientes?"
        ></OptionBox>
        <OptionBox
          title="Disponibilidad de servicios"
          description="¿Tus servicios pueden agendarse al mismo tiempo? Recomendado si eres un centro deportivo que tiene los espacios disponibles de forma simultáneo."
        ></OptionBox>
        <hr className="bg-brand_stroke my-6" />

        <h3 className="text-lg font-bold">
          Política de agendamiento y cancelación
        </h3>
        <OptionBox
          title="Ventana de agendamiento"
          description="¿Con cuánto tiempo de anticipación pueden agendar una cita los clientes?"
        ></OptionBox>
        <OptionBox
          title="Política de reagendamiento"
          description="¿Con cuánto tiempo de anticipación tus clientes pueden reagendar?"
        ></OptionBox>
        <OptionBox
          title="Política de reagendamiento"
          description="¿Cuántas veces pueden reagendar una cita?"
        ></OptionBox>
        <OptionBox
          title="Política de cancelación"
          description="¿Con cuánto tiempo de anticipación tus clientes pueden cancelar una cita?"
        ></OptionBox>
        <hr className="bg-brand_stroke my-6" />
        <h3 className="text-lg font-bold">Términos y condiciones</h3>
        <OptionBox
          title="Política de cancelación"
          description="¿Tiene condiciones que deben ser aceptadas antes de reservar? Añádelos a continuación."
        ></OptionBox>
        <hr className="bg-brand_stroke my-6" />
        <h3 className="text-lg font-bold">Integraciones</h3>
        <p className=" text-brand_dark font-satoshi mt-4 mb-4">
          {" "}
          <strong className="font-satoMiddle">Videollamadas</strong>
        </p>
        <div className="grid grid-cols-5 gap-6">
          <IntegrationCard
            icon="/images/zoom.svg"
            tool="Zoom"
            description="Añade enlaces de zoom para tus servicios en línea."
          />
          <IntegrationCard
            icon="/images/google-meet.svg"
            tool="Google Meet"
            description="Usa Google Meet para generar citas en línea."
          />
        </div>
        <p className="col-span-3 text-brand_dark font-satoshi mt-6 mb-4">
          {" "}
          <strong className="font-satoMiddle">Redes sociales</strong>
        </p>
        <div className="grid grid-cols-5 gap-6">
          <IntegrationCard
            icon="/images/zoom.svg"
            tool="Facebook"
            description="Permite que tus clientes agenden citas desde tu fan page."
          />
          <IntegrationCard
            icon="/images/google-meet.svg"
            tool="Instagram"
            description="Acepta citas en cualquier momento desde tu cuenta de instragram."
          />
        </div>
      </section>
    </main>
  );
}

export const IntegrationCard = ({
  icon,
  tool,
  description,
}: {
  icon: string;
  tool: string;
  description: string;
}) => {
  return (
    <section className="col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4">
      <img className="w-6 h-6" src={icon} />
      <div>
        <h3 className="text-brand_dark">{tool}</h3>
        <p className="text-brand_gray text-sm mt-1">{description}</p>
      </div>
    </section>
  );
};

export const OptionBox = ({
  title,
  description,
  children,
}: {
  title: string;
  children?: ReactNode;
  description?: string;
}) => {
  return (
    <section className="grid grid-cols-8 gap-6 my-4 ">
      <div className="col-span-5">
        <p className="col-span-3 text-brand_dark font-satoshi">
          {" "}
          <strong className="font-satoMiddle">{title}</strong>
        </p>
        <p className="col-span-5 md:col-span-3 text-brand_gray font-satoshi text-sm">
          {description}
        </p>
      </div>
      <div className="col-span-3">{children}</div>
    </section>
  );
};
