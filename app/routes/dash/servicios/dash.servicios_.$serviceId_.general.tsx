import { BasicInput } from "~/components/forms/BasicInput";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/dash.servicios_.$serviceId_.general";
import { Form, redirect, useFetcher } from "react-router";
import { serviceUpdateSchema } from "~/utils/zod_schemas";
import { Spinner } from "~/components/common/Spinner";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_service") {
    const form = Object.fromEntries(formData);
    const validData = serviceUpdateSchema.parse(form);
    await db.service.update({
      where: {
        id: validData.id,
      },
      data: { ...validData, id: undefined, slug: undefined },
    });
    return redirect("/dash/servicios/" + validData.id);
  }
  return null;
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const serviceId = params.serviceId;
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Response(null, { status: 404 });

  return { service };
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData;
  const fetcher = useFetcher();
  const isFetching = fetcher.state !== "idle";

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
            <BreadcrumbLink href={`/dash/servicios/${service.id}/general`}>
              General
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <fetcher.Form
        method="post"
        className="bg-white rounded-2xl max-w-3xl p-8 mt-6"
      >
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="slug" value={service.slug} />
        <input type="hidden" name="orgId" value={service.orgId} />

        <h2
          className="font-satoMiddle mb-8 text-xl
        "
        >
          Información General
        </h2>
        {/* Revisar props */}
        <div className="flex gap-6"></div>
        <BasicInput
          placeholder="Clase de piano"
          label="Nombre del servicio"
          name="name"
          defaultValue={service.name}
        />
        <BasicInput
          placeholder="$0.00"
          label="Precio"
          name="price"
          type="number"
          defaultValue={service.price}
        />
        <BasicInput
          name="points"
          placeholder="100"
          label="¿A cuántos puntos de recompensas equivale el servicio?"
          defaultValue={service.points}
        />
        <BasicInput
          as="textarea"
          name="description"
          placeholder="Cuéntale a tus clientes sobre tu servicio"
          label="Descripción"
          defaultValue={service.description}
        />

        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton
            as="Link"
            to={`/dash/servicios/${service.id}`}
            className="w-[120px]"
          >
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            isDisabled={isFetching}
            name="intent"
            value="update_service"
            type="submit"
          >
            {isFetching ? <Spinner /> : "Guardar"}
          </PrimaryButton>
        </div>
      </fetcher.Form>
    </section>
  );
}
