import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/services";
import type { Service } from "@prisma/client";
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
    } = ServerServiceConfigFormSchema.safeParse(data); // change
    console.error("ZOD_ERROR", error);
    if (!success) throw new Response("Error in form fields", { status: 400 });

    await db.service.update({
      where: { id: data.id },
      // @ts-ignore
      data: { ...parsedData, isActive: true }, // revisit
    });
    return { id: data.id, nextIndex: 4 };
  }

  if (intent === "times_form") {
    const {
      success,
      data: parsedData,
      error,
    } = serviceTimesSchema.safeParse(data); // change
    if (!success) throw new Response("Error in form fields", { status: 400 });

    await db.service.update({
      where: { id: data.id },
      // @ts-ignore
      data: parsedData,
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
      // @ts-ignore
      data: parsedData,
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
      },
    });
    // throw redirect("/dash/servicios/nuevo?id=" + newService.id);
    return new Response(JSON.stringify({ id: newService.id, nextIndex: 1 }));
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
