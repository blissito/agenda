import { redirect } from "react-router";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/api.org";
import { orgUpdateSchema } from "~/utils/zod_schemas";
import { z } from "zod";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const rawData = JSON.parse(formData.get("data") as string);

  if (intent === "org_check_slug") {
    const slugSchema = z.object({ slug: z.string().min(1) });
    const result = slugSchema.safeParse(rawData);
    if (!result.success) {
      return { errors: { slug: "slug inválido" } };
    }
    const exist = await db.org.findUnique({ where: { slug: result.data.slug } });
    if (exist) {
      return { errors: { slug: "este username ya ha sido tomado" } };
    }
    return null;
  }

  if (intent === "org_update" || intent === "org_update_and_redirect") {
    const result = orgUpdateSchema.safeParse(rawData);
    if (!result.success) {
      return Response.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }
    const { id, ...data } = result.data;
    await db.org.update({ where: { id }, data });

    if (intent === "org_update_and_redirect") {
      const next = formData.get("next") as string;
      if (!next || !next.startsWith("/")) {
        return Response.json({ error: "Redirect inválido" }, { status: 400 });
      }
      throw redirect(next);
    }
  }

  return null;
};
