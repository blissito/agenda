import type { Org } from "@prisma/client";
import { redirect } from "react-router";
import { db } from "~/utils/db.server";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  let data = JSON.parse(formData.get("data") as string) as Partial<Org>;

  if (intent === "org_check_slug") {
    const exist = await db.org.findUnique({ where: { slug: data.slug } });
    // @todo don't send error when same slug
    if (exist) {
      return { errors: { slug: "este slug ya ha sido tomado" } };
    }
  }
  // @TODo add minimal validation ?
  if (intent === "org_update") {
    const { id } = data;
    delete data.id;
    await db.org.update({ where: { id }, data });
  }
  return null;
};
