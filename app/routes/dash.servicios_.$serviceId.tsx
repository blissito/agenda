import { SecondaryButton } from "~/components/common/secondaryButton";
import { InfoBox } from "./dash.website";
import { Form, useLoaderData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { Service } from "@prisma/client";
import { getUserAndOrgOrRedirect } from "~/db/userGetters";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // @TODO ensure is the owner
  const { org } = await getUserAndOrgOrRedirect(request);
  const service = await db.service.findUnique({
    where: { id: params.serviceId, orgId: org.id }, // @TODO: this can vary if multiple orgs
  });
  if (!service) return json(null, { status: 404 });
  return {
    service,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // const formData = await request.formData();
  // const intent = formData.get("intent");
  // if (intent == "delete_service") {
  //   // delete
  //   const serviceId = formData.get("serviceId") as string;
  //   if (!serviceId) return json("no service id found on body", { status: 422 });
  //   const service = await db.service.findUnique({ where: { id: serviceId } });
  //   await db.event.updateMany({
  //     where: { serviceId },
  //     data: {
  //       status: "DELETED",
  //       legacyService: { ...service },
  //     },
  //   }); // @TODO: should we delete in cascade?
  //   await db.service.delete({ where: { id: serviceId } });
  //   return redirect("/dash/servicios");
  // }
  return null;
};

export default function Page() {
  const { service } = useLoaderData<typeof loader>();
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
        <ServiceDetail service={service} />
      </div>
    </section>
  );
}

export const ServiceDetail = ({ service }: { service: Service }) => {
  return (
    <div className="bg-white rounded-2xl p-8 col-span-4 lg:col-span-3">
      <div className="grid grid-cols-1 gap-8 ">
        <img
          alt="service"
          className="h-[180px]  rounded-2xl w-full object-cover"
          src={
            service.photoURL ? service.photoURL : "/images/serviceDefault.png"
          }
        />
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
          <SecondaryButton
            as="Link"
            to={`/dash/servicios/${service.id}/agendamiento`}
            className="h-10"
          >
            {" "}
            Editar
          </SecondaryButton>
        </div>
        <InfoBox title="Servicio" value={service.place} />
        <InfoBox title="Agendamiento en línea" value="Activo" />
        <InfoBox title="Agendamiento simultáneo" value="hasta 6 citas" />
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
          con <span className="font-bold font-satoMedium">15 minutos</span> de
          descanso.
        </p>
        <InfoBox title="Lunes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Martes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Miércoles" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Jueves" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Viernes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Sábado" value="Cerrado" />
        <InfoBox title="Domingo" value="Cerrado" />
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
        value="Lo enviaremos en cuanto se complete la reservación"
      />
      <InfoBox
        title="Mail de recordatorio"
        value="Lo enviaremos 24 hrs antes de la sesión"
      />
      <InfoBox
        title="Whats app de recordatorio"
        value="Lo enviaremos 4hrs antes de la sesión"
      />
      <InfoBox
        title="Mail de evaluación"
        value="Lo enviaremos 10 min después de terminar la sesión"
      />
    </div>
  );
};
