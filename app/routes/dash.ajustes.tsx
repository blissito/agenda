import { useLoaderData } from "@remix-run/react";
import React, { ReactNode } from "react";
import { FaCheck } from "react-icons/fa6";
import { PrimaryButton } from "~/components/common/primaryButton";
import { Switch } from "~/components/common/Switch";
import { BasicInput } from "~/components/forms/BasicInput";
import { InputFile } from "~/components/forms/InputFile";
import { Option, SelectInput } from "~/components/forms/SelectInput";
import { Check } from "~/components/icons/check";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import SelectStylized, { Choice } from "~/components/ui/select";

const CHOICES: Choice[] = [
  { id: 1, name: "🇲🇽 México" },
  { id: 2, name: "🇺🇸 Estados Unidos" },
  { id: 3, name: "🇦🇷 Argentina" },
  { id: 4, name: "🇨🇴 Colombia" },
  { id: 5, name: "🇨🇱 Chile" },
];

const TIMEZONES: Choice[] = [
  { id: 1, name: "America/Mexico_City" },
  { id: 2, name: "America/Indiana/Indianapolis" },
  { id: 3, name: "America/Indiana/Vincennes" },
];
const PERIOD: Choice[] = [
  { id: 1, name: "3 meses" },
  { id: 2, name: "6 meses" },
  { id: 3, name: "1 años" },
];

const RANGES: Choice[] = [
  { id: 1, name: "15 minutos" },
  { id: 2, name: "30 minutos" },
  { id: 3, name: "1 hora" },
  { id: 4, name: "24 horas" },
];

const TIMES: Choice[] = [
  { id: 1, name: "1 vez" },
  { id: 2, name: "2 veces" },
  { id: 3, name: "3 veces" },
  { id: 4, name: "Ilimitadas" },
];

export const loader = async () => {
  return {
    countries: CHOICES,
    timeZones: TIMEZONES,
    period: PERIOD,
    ranges: RANGES,
    times: TIMES,
  };
};

export default function Clients() {
  const { countries, timeZones } = useLoaderData<typeof loader>();
  return (
    <main className=" pb-10">
      <RouteTitle>Ajustes</RouteTitle>
      <section className=" bg-white rounded-2xl max-w-4xl pb-10 overflow-hidden">
        <div className="p-6 ">
          <h3 className="text-lg font-bold">General</h3>
          <OptionBox
            title="Ubicación de tu negocio"
            description="Selecciona el país en donde se encuentra tu negocio"
          >
            <SelectStylized
              choices={countries}
              placeholder="Selecciona un país"
            />
          </OptionBox>
          <OptionBox
            title="Zona horaria de tu calendario"
            description="Selecciona la zona horaria que quieres utilizar"
          >
            <SelectStylized
              choices={timeZones}
              placeholder="Elige una zona horaria"
            />
          </OptionBox>
          <OptionBox
            title="Disponibilidad de calendario"
            description="Cuánto tiempo está disponible tu calendario"
          >
            <SelectStylized
              choices={PERIOD}
              placeholder="Selecciona una opción"
            />
          </OptionBox>
          <OptionBox
            title="Disponibilidad de servicios"
            description="¿Tus servicios pueden agendarse al mismo tiempo? Recomendado si eres un centro deportivo que tiene los espacios disponibles de forma simultánea."
          >
            <Switch className="h-10" />
          </OptionBox>
          <hr className="bg-brand_stroke my-6" />

          <h3 className="text-lg font-bold">
            Política de agendamiento y cancelación
          </h3>
          <OptionBox
            title="Ventana de agendamiento"
            description="¿Con cuánto tiempo de anticipación mínimo pueden agendar una cita los clientes?"
          >
            <SelectStylized
              choices={RANGES}
              placeholder="Selecciona una opción"
            />
          </OptionBox>
          <OptionBox
            title="Política de reagendamiento"
            description="¿Con cuánto tiempo de anticipación tus clientes pueden reagendar?"
          >
            <SelectStylized
              choices={RANGES}
              placeholder="Selecciona una opción"
            />
          </OptionBox>
          <OptionBox
            title="Política de reagendamiento"
            description="¿Cuántas veces pueden reagendar una cita?"
          >
            <SelectStylized
              choices={TIMES}
              placeholder="Selecciona una opción"
            />
          </OptionBox>
          <OptionBox
            title="Política de cancelación"
            description="¿Con cuánto tiempo de anticipación tus clientes pueden cancelar una cita?"
          >
            <SelectStylized
              choices={RANGES}
              placeholder="Selecciona una opción"
            />
          </OptionBox>
          <hr className="bg-brand_stroke my-6" />
          <h3 className="text-lg font-bold">Términos y condiciones</h3>
          <div className="mt-6">
            <p className=" text-brand_dark font-satoshi">
              {" "}
              <strong>Política de cancelación</strong>
            </p>
            <p className=" text-brand_gray font-satoshi text-sm">
              ¿Tiene condiciones que deben ser aceptadas antes de reservar?
              Añádelos a continuación.
            </p>
            <BasicInput
              as="textarea"
              className="mt-4"
              placeholder="Pega aquí los términos y condiciones de tus servicios"
            />
          </div>
          <hr className="bg-brand_stroke my-6" />
          <h3 className="text-lg font-bold">Integraciones</h3>
          <p className=" text-brand_dark font-satoshi mt-4 mb-4">
            {" "}
            <strong className="font-satoMiddle">Videollamadas</strong>
          </p>
          <div className="grid  grid-cols-1 md:grid-cols-5 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <IntegrationCard
              icon="/images/face.svg"
              tool="Facebook"
              description="Permite que tus clientes agenden citas desde tu fan page."
            />
            <IntegrationCard
              icon="/images/insta.svg"
              tool="Instagram"
              description="Acepta citas en cualquier momento desde tu cuenta de instragram."
            />
          </div>
        </div>
        <div className="items-center max-w-4xl w-full rounded-b-2xl  backdrop-blur bottom-0 py-6 bg-white/50 z-10 fixed flex justify-end pr-6">
          <PrimaryButton type="submit">Guardar</PrimaryButton>
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
    <section className="col-span-1 md:col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4 relative cursor-pointer group">
      <img className="w-6 h-6" src={icon} alt="social media" />
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-brand_dark">{tool}</h3>
          <div className=" bg-[#F1FCF7] h-4  rounded-full px-1 flex gap-1 justify-start items-center ">
            <FaCheck className="text-[10px]" fill="#3D7E5A" />{" "}
            <span className="text-[10px] items-center gap-1 text-[#3D7E5A] group-hover:block transition-all hidden">
              Conectado
            </span>
          </div>
        </div>
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
    <section className="grid grid-cols-8 gap-6 my-6 ">
      <div className="col-span-5">
        <p className="col-span-3 text-brand_dark font-satoshi">
          {" "}
          <strong>{title}</strong>
        </p>
        <p className="col-span-5 md:col-span-3 text-brand_gray font-satoshi text-sm">
          {description}
        </p>
      </div>
      <div className="col-span-3 flex items-center justify-end">{children}</div>
    </section>
  );
};
