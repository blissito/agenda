import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/services";
import type { Prisma, Service } from "@prisma/client";
import { generalFormSchema } from "~/components/forms/services_model/ServiceGeneralForm";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { serverServicePhotoFormSchema } from "~/components/forms/services_model/ServicePhotoForm";
import { serviceTimesSchema } from "~/components/forms/services_model/ServiceTimesForm";
import { ServerServiceConfigFormSchema } from "~/components/forms/services_model/ServiceConfigForm";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  let data = JSON.parse(formData.get("data") as string) as Partial<Service>;

  if (intent === "service_update") {
    const { id } = data;
    delete data.id;
    return await db.service.update({ where: { id }, data });
  }
  //67c90587bd7089263a5cf40b

  if (intent === "config_form") {
    const {
      success,
      data: parsedData,
      error,
    } = ServerServiceConfigFormSchema.safeParse(data);
    if (!success) throw new Response("Error in form fields", { status: 400 });

    await db.service.update({
      where: { id: data.id },
      data: { ...parsedData, isActive: true } as Prisma.ServiceUpdateInput,
    });
    return { id: data.id, nextIndex: 4 };
  }

  if (intent === "times_form") {
    const {
      success,
      data: parsedData,
      error,
    } = serviceTimesSchema.safeParse(data);
    if (!success) throw new Response("Error in form fields", { status: 400 });

    // Convertir días de inglés a español para el schema de Prisma
    const dayMapping: Record<string, string> = {
      monday: "lunes",
      tuesday: "martes",
      wednesday: "mi_rcoles",
      thursday: "jueves",
      friday: "viernes",
      saturday: "s_bado",
      sunday: "domingo",
    };

    let weekDaysSpanish: Record<string, any> | null = null;
    if (parsedData.weekDays && typeof parsedData.weekDays === "object") {
      weekDaysSpanish = {};
      for (const [engDay, value] of Object.entries(parsedData.weekDays)) {
        const spanishDay = dayMapping[engDay];
        if (spanishDay && value) {
          weekDaysSpanish[spanishDay] = value;
        }
      }
    }

    await db.service.update({
      where: { id: data.id },
      data: {
        duration: parsedData.duration,
        weekDays: weekDaysSpanish ? { set: weekDaysSpanish } : undefined,
      },
    });
    return { id: data.id, nextIndex: 3 };
  }

  if (intent === "photo_form") {
    const {
      success,
      data: parsedData,
      error,
    } = serverServicePhotoFormSchema.safeParse(data);
    if (!success) throw new Response("Error in form fields", { status: 400 });

    await db.service.update({
      where: { id: data.id },
      data: parsedData as Prisma.ServiceUpdateInput,
    });
    return { id: data.id, nextIndex: 2 };
  }

  if (intent === "general_form") {
    const {
      success,
      error,
      data: parsedData,
    } = generalFormSchema.safeParse(data);
    if (!success) throw new Response("Error in form fields", { status: 400 });

    const { org } = await getUserAndOrgOrRedirect(request);
    const newService = await db.service.create({
      data: {
        ...parsedData,
        orgId: org.id,
        slug: slugify(parsedData.name + "_" + nanoid(4)),
        // Valores por defecto para campos requeridos
        allowMultiple: false,
        archived: false,
        currency: "MXN",
        duration: 30,
        isActive: false,
        paid: false,
        payment: false,
        place: "presencial",
        points: parsedData.points ?? 0,
        price: parsedData.price ?? 0,
        seats: 1,
      },
    });
    return { id: newService.id, nextIndex: 1 };
  }

  return null;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  return {
    services: await db.service.findMany({
      where: {
        orgId: org.id,
        archived: false,
      },
    }),
  };
};
