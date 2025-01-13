import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { ServiceConfigForm } from "~/components/forms/services_model/ServiceConfigForm";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const serviceId = params.serviceId;
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return json(null, { status: 404 });
  return { service };
};

export default function Index() {
  const { service } = useLoaderData<typeof loader>();

  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios">Servicios</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dash/servicios/${service.id}`}>
              {service.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios/serviceid/horario">
              Cobros y recordatorios
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <h2 className="font-satoMiddle mb-8 text-xl">
          Actualiza tus cobros y recordatorios
        </h2>
        <div></div>
        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton as="Link" to="/dash/website" className="w-[120px]">
            Cancelar
          </SecondaryButton>
          <PrimaryButton>Guardar</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
