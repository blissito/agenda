import type { Org } from "@prisma/client";
import { redirect } from "react-router";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/api.org";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  let data = JSON.parse(formData.get("data") as string) as Partial<Org>;

  if (intent === "org_check_slug") {
    const exist = await db.org.findUnique({ where: { slug: data.slug } });
    if (exist) {
      return { errors: { slug: "este username ya ha sido tomado" } };
    }
  }
  // @TODo add minimal validation ?
  if (intent === "org_update") {
    const { id } = data;
    delete data.id;
    await db.org.update({ where: { id }, data });
  }

  if (intent === "org_update_and_redirect") {
    const next = formData.get("next") as string;
    const { id } = data;
    delete data.id;
    await db.org.update({ where: { id }, data });
    throw redirect(next);
  }

  return null;
};
