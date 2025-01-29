import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/services";
import type { Service } from "@prisma/client";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  let data = JSON.parse(formData.get("data") as string) as Partial<Service>;

  if (intent === "service_update") {
    const { id } = data;
    delete data.id;
    await db.service.update({ where: { id }, data });
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
