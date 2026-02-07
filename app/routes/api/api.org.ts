import { redirect } from "react-router"
import { z } from "zod"
import { db } from "~/utils/db.server"
import { orgUpdateSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/api.org"

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
]

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
  })

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  const rawData = JSON.parse(formData.get("data") as string)

  if (intent === "org_check_slug") {
    const checkSchema = z.object({
      slug: slugSchema,
      id: z.string().optional(),
    })
    const result = checkSchema.safeParse(rawData)
    if (!result.success) {
      return { errors: { slug: result.error.issues[0].message } }
    }
    const existing = await db.org.findUnique({
      where: { slug: result.data.slug },
    })
    if (existing && existing.id !== result.data.id) {
      return { errors: { slug: "Este nombre ya está en uso" } }
    }
    return null
  }

  if (intent === "org_update" || intent === "org_update_and_redirect") {
    const result = orgUpdateSchema.safeParse(rawData)
    if (!result.success) {
      console.log("❌ org_update validation error:", result.error.flatten())
      console.log("❌ rawData received:", JSON.stringify(rawData, null, 2))
      return Response.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 },
      )
    }
    const { id, weekDays, social, ...restData } = result.data

    // Validate slug if being updated
    if (restData.slug) {
      const normalized = restData.slug.toLowerCase().trim()
      const slugValidation = slugSchema.safeParse(normalized)
      if (!slugValidation.success) {
        return Response.json(
          { error: slugValidation.error.issues[0].message },
          { status: 400 },
        )
      }
      const existing = await db.org.findUnique({ where: { slug: normalized } })
      if (existing && existing.id !== id) {
        return Response.json(
          { error: "Este nombre ya está en uso" },
          { status: 400 },
        )
      }
      restData.slug = normalized
    }

    // Build Prisma update data, wrapping embedded types in `set`
    // For social, ensure all fields are strings (Prisma embedded type requires non-null)
    const normalizedSocial = social
      ? {
          facebook: social.facebook ?? "",
          instagram: social.instagram ?? "",
          linkedin: social.linkedin ?? "",
          tiktok: social.tiktok ?? "",
          website: social.website ?? "",
          x: social.x ?? "",
          youtube: social.youtube ?? "",
        }
      : undefined

    const prismaData = {
      ...restData,
      ...(weekDays && { weekDays: { set: weekDays } }),
      ...(normalizedSocial && { social: { set: normalizedSocial } }),
    }

    await db.org.update({ where: { id }, data: prismaData })

    if (intent === "org_update_and_redirect") {
      const next = formData.get("next") as string
      if (!next || !next.startsWith("/")) {
        return Response.json({ error: "Redirect inválido" }, { status: 400 })
      }
      throw redirect(next)
    }
  }

  return null
}
