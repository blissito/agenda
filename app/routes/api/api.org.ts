import { redirect } from "react-router";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/api.org";
import { orgUpdateSchema } from "~/utils/zod_schemas";
import { z } from "zod";
import { spanishToEnglish } from "~/utils/weekDaysTransform";

// Reserved slugs that cannot be used
const RESERVED_SLUGS = [
  "www",
  "api",
  "app",
  "admin",
  "dashboard",
  "dash",
  "login",
  "signin",
  "signup",
  "auth",
  "help",
  "support",
  "billing",
  "settings",
  "account",
  "denik",
];

const slugSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones")
  .refine((s) => !s.startsWith("-") && !s.endsWith("-"), {
    message: "No puede empezar ni terminar con guión",
  })
  .refine((s) => !RESERVED_SLUGS.includes(s), {
    message: "Este nombre está reservado",
  });

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  const rawData = JSON.parse(formData.get("data") as string);

  if (intent === "org_check_slug") {
    const checkSchema = z.object({
      slug: slugSchema,
      id: z.string().optional(),
    });
    const result = checkSchema.safeParse(rawData);
    if (!result.success) {
      return { errors: { slug: result.error.issues[0].message } };
    }
    const existing = await db.org.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing && existing.id !== result.data.id) {
      return { errors: { slug: "Este nombre ya está en uso" } };
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
    const { id, weekDays, ...restData } = result.data;

    // Validate slug if being updated
    if (restData.slug) {
      const normalized = restData.slug.toLowerCase().trim();
      const slugValidation = slugSchema.safeParse(normalized);
      if (!slugValidation.success) {
        return Response.json(
          { error: slugValidation.error.issues[0].message },
          { status: 400 }
        );
      }
      const existing = await db.org.findUnique({ where: { slug: normalized } });
      if (existing && existing.id !== id) {
        return Response.json(
          { error: "Este nombre ya está en uso" },
          { status: 400 }
        );
      }
      restData.slug = normalized;
    }

    // Transform Spanish day names to English for Prisma
    const transformedWeekDays = weekDays ? spanishToEnglish(weekDays) : undefined;

    // Build Prisma update data, wrapping weekDays in `set` for embedded types
    const prismaData = {
      ...restData,
      ...(transformedWeekDays && { weekDays: { set: transformedWeekDays } }),
    };

    await db.org.update({ where: { id }, data: prismaData });

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
