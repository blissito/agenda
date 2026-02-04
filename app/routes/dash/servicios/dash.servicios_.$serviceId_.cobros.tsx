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
import { SecondaryButton } from "~/components/common/secondaryButton";

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
    const { id, config: newConfig, ...rest } = data;

    if (newConfig) {
      const currentService = await db.service.findUnique({ where: { id } });
      const currentConfig = currentService?.config || {
        confirmation: false,
        reminder: false,
        survey: false,
        whatsapp_confirmation: null,
        whatsapp_reminder: null,
      };

      await db.service.update({
        where: { id },
        data: {
          ...rest,
          config: {
            set: {
              ...currentConfig,
              ...newConfig,
            },
          },
        },
      });
    } else {
      await db.service.update({
        where: { id },
        data: rest,
      });
    }
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
        <div className="flex flex-col gap-6">
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
            defaultChecked={service.config?.whatsapp_confirmation ?? false}
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
            defaultChecked={service.config?.whatsapp_reminder ?? false}
            onChange={(checked: boolean) =>
              handleSwitchChange("whatsapp_reminder", checked)
            }
            name="whatsapp_reminder"
            label="Whatsapp de recordatorio"
            subtitle="Lo enviaremos 24 hrs antes de la sesión"
            icon={<FaWhatsapp />}
          />
        </div>

        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton
            as="Link"
            to={`/dash/servicios/${service.id}`}
            className="w-[120px]"
          >
            Cancelar
          </SecondaryButton>
          <PrimaryButton as="Link" to={`/dash/servicios/${service.id}`}>
            Guardar
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
