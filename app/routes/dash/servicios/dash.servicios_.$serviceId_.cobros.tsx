import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { db } from "~/utils/db.server";
import { useFetcher } from "react-router";
import type { Route } from "./+types/dash.servicios_.$serviceId_.cobros";
import { Switch } from "~/components/common/Switch";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { PrimaryButton } from "~/components/common/primaryButton";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const serviceId = params.serviceId;
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Response(null, { status: 404 });
  return { service };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_service") {
    const data = JSON.parse(formData.get("data") as string);
    await db.service.update({
      where: { id: data.id },
      data: {
        ...data,
        id: undefined,
      },
    });
  }
  return null;
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData;
  const fetcher = useFetcher();
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === "payment") {
      fetcher.submit(
        {
          intent: "update_service",
          data: JSON.stringify({ payment: checked, id: service.id }),
        },
        { method: "post" }
      );
      return;
    }

    fetcher.submit(
      {
        intent: "update_service",
        data: JSON.stringify({
          id: service.id,
          config: { ...service.config, [name]: checked },
        }),
      },
      { method: "post" }
    );
  };
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
        <section>
          <Switch
            defaultChecked={service.payment}
            onChange={(checked: boolean) =>
              handleSwitchChange("payment", checked)
            }
            name="payment"
            label="Pago al agendar"
            subtitle="Activar los pagos para este servicio"
          />
          <Switch
            defaultChecked={service.config?.confirmation}
            onChange={(checked: boolean) =>
              handleSwitchChange("confirmation", checked)
            }
            name="confirmation"
            label="Mail de confirmación"
            subtitle="Lo enviaremos en cuanto se complete la reservación"
          />
          <Switch
            defaultChecked={service.config?.whatsapp_confirmation}
            onChange={(checked: boolean) =>
              handleSwitchChange("whatsapp_confirmation", checked)
            }
            name="whatsapp_confirmation"
            label="Whatsapp de confirmación"
            subtitle="Lo enviaremos en cuanto se complete la reservación"
            icon={<FaWhatsapp />}
          />
          <Switch
            defaultChecked={service.config?.reminder}
            onChange={(checked: boolean) =>
              handleSwitchChange("reminder", checked)
            }
            name="reminder"
            label="Mail de recordatorio"
            subtitle="Lo enviaremos 24 hrs antes de la sesión"
          />
          <Switch
            defaultChecked={service.config?.whatsapp_reminder}
            onChange={(checked: boolean) =>
              handleSwitchChange("whatsapp_reminder", checked)
            }
            name="whatsapp_reminder"
            label="Whatsapp de recordatorio"
            subtitle="Lo enviaremos 24 hrs antes de la sesión"
            icon={<FaWhatsapp />}
          />
          <PrimaryButton as="Link" to={"/dash/servicios/" + service.id}>
            Volver
          </PrimaryButton>
        </section>
      </div>
    </section>
  );
}
