// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { SecondaryButton } from "~/components/common/secondaryButton";
import { db } from "~/utils/db.server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import type { Service } from "@prisma/client";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { Image, ImageInput } from "~/components/common/Image";
import { formatRange } from "~/components/common/FormatRange";
import type { Route } from "./+types/dash.servicios_.$serviceId";
import { InfoBox } from "../website/InfoBox";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  // @TODO ensure is the owner
  const { org } = await getUserAndOrgOrRedirect(request);
  const service = await db.service.findUnique({
    where: { id: params.serviceId, orgId: org.id }, // @TODO: this can vary if multiple orgs
  });
  if (!service) throw new Response(null, { status: 404 });
  return {
    service: { ...service, config: service.config ? service.config : {} },
    orgWeekDays: org.weekDays,
  };
};
// @TODO: orgWeekDays type
export default function Page({ loaderData }: Route.ComponentProps) {
  const { service, orgWeekDays } = loaderData;
  return (
    <section>
      {/* TODO: This should be a single component something like: <Bread pathname="dash/servicios" /> */}
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios">Servicios</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios/">
              {service.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-4 mt-8">
        <ServiceDetail service={service} orgWeekDays={orgWeekDays} />
      </div>
    </section>
  );
}

export const convertToMeridian = (hourString: string) => {
  const today = new Date();
  today.setHours(Number(hourString.split(":")[0]));
  today.setMinutes(Number(hourString.split(":")[1]));
  return today.toLocaleTimeString("es-MX", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });
};

export const ServiceDetail = ({
  service,
  orgWeekDays,
}: {
  service: Service;
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 col-span-4 lg:col-span-3">
      <div className="grid grid-cols-1 gap-8 ">
        <ImageInput />
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center">
          {" "}
          <h2 className="text-2xl font-bold font-jakarta">{service.name} </h2>
          <SecondaryButton
            as="Link"
            to={`/dash/servicios/${service.id}/general`}
            className="h-10 "
          >
            {" "}
            Editar
          </SecondaryButton>
        </div>

        {/* <InfoBox title="Categoría" value="Clases para niños" /> */}
        <InfoBox title="Precio" value={<span>${service.price} mxn</span>} />
        <InfoBox title="Puntos" value={service.points} />
        <InfoBox title="Descripción" value={service.description} />

        <hr className="bg-brand_stroke my-6" />

        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Agendamiento</h3>
          {/* <SecondaryButton
            as="Link"
            to={`/dash/servicios/${service.id}/agendamiento`}
            className="h-10"
          >
            {" "}
            Editar
          </SecondaryButton> */}
        </div>
        <InfoBox title="Servicio" value={service.place} />
        <InfoBox
          title="Agendamiento en línea"
          value={service.isActive ? "Activado" : "Desactivado"}
        />
        <InfoBox
          title="Agendamiento simultáneo"
          value={
            service.allowMultiple
              ? `hasta ${service.limit?.bookings || 6} citas`
              : "Desactivado"
          }
        />
        <hr className="bg-brand_stroke my-6" />
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Horario</h3>
          <SecondaryButton
            as="Link"
            to={`/dash/servicios/${service.id}/horario`}
            className="h-10"
          >
            {" "}
            Editar
          </SecondaryButton>
        </div>
        <p className="font-satoshi text-brand_gray">
          Sesiones de{" "}
          <span className="font-bold font-satoMedium">
            {service.duration} minutos
          </span>{" "}
          con <span className="font-bold font-satoMedium">0 minutos</span> de
          descanso.
        </p>
        <InfoBox title="Lunes" value={formatRange(orgWeekDays["lunes"])} />
        <InfoBox title="Martes" value={formatRange(orgWeekDays["martes"])} />
        <InfoBox
          title="Miércoles"
          value={formatRange(orgWeekDays["miércoles"])}
        />
        <InfoBox title="Jueves" value={formatRange(orgWeekDays["jueves"])} />
        <InfoBox title="Viernes" value={formatRange(orgWeekDays["viernes"])} />
        <InfoBox title="Sábado" value={formatRange(orgWeekDays["sábado"])} />
        <InfoBox title="Domingo" value={formatRange(orgWeekDays["domingo"])} />
      </div>
      <hr className="bg-brand_stroke my-6" />
      <div className="flex justify-between items-center">
        {" "}
        <h3 className="text-lg font-bold">Recordatorios y cobros</h3>
        <SecondaryButton
          className="h-10"
          as="Link"
          to={`/dash/servicios/${service.id}/cobros`}
        >
          {" "}
          Editar
        </SecondaryButton>
      </div>

      <InfoBox title="Pago" value="Al agendar" />
      <InfoBox
        title="Mail de confirmación"
        value={
          service.config?.confirmation
            ? "Lo enviamos en cuanto se completa la reservación"
            : "Desactivado"
        }
      />
      <InfoBox
        title="Whats app de recordatorio"
        value={
          service.config?.survey
            ? "Lo enviamos 4hrs antes de la sesión"
            : "Desactivado"
        }
      />
      <InfoBox
        title="Mail de evaluación"
        value={
          service.config?.confirmation
            ? "Lo enviamos 10 min después de terminar la sesión"
            : "Desactivado"
        }
      />
    </div>
  );
};
