import { useLoaderData } from "@remix-run/react";
import React, { ReactNode } from "react";
import { PrimaryButton } from "~/components/common/primaryButton";
import { Switch } from "~/components/common/Switch";
import { BasicInput } from "~/components/forms/BasicInput";
import { InputFile } from "~/components/forms/InputFile";
import { Option, SelectInput } from "~/components/forms/SelectInput";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import SelectStylized, { Choice } from "~/components/ui/select";

const CHOICES: Choice[] = [
  { id: 1, name: "Tom Cook" },
  { id: 2, name: "Wade Cooper" },
  { id: 3, name: "Tanya Fox" },
  { id: 4, name: "Arlene Mccoy" },
  { id: 5, name: "Devon Webb" },
];

const TIMEZONES: string[] = [
  { id: 1, name: "America/Mexico_City" },
  { id: 2, name: "America/Indiana/Indianapolis" },
  { id: 3, name: "America/Indiana/Vincennes" },
];

export const loader = async () => {
  return {
    countries: CHOICES,
    timeZones: TIMEZONES,
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
            <SelectStylized choices={countries} placeholder="México" />
          </OptionBox>
          <OptionBox
            title="Zona horaria de tu calendario"
            description="Selecciona la zona horaria que quieres utilizar"
          >
            <SelectStylized choices={timeZones} />
          </OptionBox>
          <OptionBox
            title="Disponibilidad de calendario"
            description="Cuánto tiempo está disponible tu calendario"
          >
            <SelectStylized
            //  options={OPTIONS}
            />
          </OptionBox>
          <OptionBox
            title="Disponibilidad de servicios"
            description="¿Tus servicios pueden agendarse al mismo tiempo? Recomendado si eres un centro deportivo que tiene los espacios disponibles de forma simultánea."
          >
            <Switch />
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
            //  options={OPTIONS}
            />
          </OptionBox>
          <OptionBox
            title="Política de reagendamiento"
            description="¿Con cuánto tiempo de anticipación tus clientes pueden reagendar?"
          >
            <SelectStylized
            //  options={OPTIONS}
            />
          </OptionBox>
          <OptionBox
            title="Política de reagendamiento"
            description="¿Cuántas veces pueden reagendar una cita?"
          >
            <SelectStylized
            //  options={OPTIONS}
            />
          </OptionBox>
          <OptionBox
            title="Política de cancelación"
            description="¿Con cuánto tiempo de anticipación tus clientes pueden cancelar una cita?"
          >
            <SelectStylized
            //  options={OPTIONS}
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
          <hr className="bg-brand_stroke mt-2 mb-6" />
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
