import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/dash.servicios_.$serviceId_.horario";
import { TimesForm } from "~/components/forms/TimesForm";
import { PrimaryButton } from "~/components/common/primaryButton";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const serviceId = params.serviceId;
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Response(null, { status: 404 });
  return { service };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_org") {
  }
  return null;
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData;
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
              Horario
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <h2
          className="font-satoMiddle mb-8 text-xl
        "
        >
          Horario: Actualiza los días y horarios en los que ofreces servicio
        </h2>
        <section>
          <h2>Este servicio utiliza los mismos horarios que la organización</h2>
          {/* <TimesForm /> */}
          <nav className="flex gap-4">
            <PrimaryButton
              as="Link"
              to={"/dash/servicios/" + service.id}
              className="my-4"
            >
              Volver
            </PrimaryButton>
            <PrimaryButton
              as="button"
              to={"/dash/servicios/" + service.id}
              className="my-4 disabled:bg-yellow-500/40"
              isDisabled
            >
              Crear horarios específicos
            </PrimaryButton>
          </nav>
        </section>
      </div>
    </section>
  );
}
