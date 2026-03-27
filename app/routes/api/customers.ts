import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import { newCustomerSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/customers"

export const action = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()

  if (intent === "delete") {
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const customerId = formData.get("customerId") as string
    if (!customerId) {
      return Response.json({ error: "customerId requerido" }, { status: 400 })
    }
    const customer = await db.customer.findFirst({
      where: { id: customerId, orgId: org.id },
    })
    if (!customer) {
      return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
    }
    const block = formData.get("block") === "true"
    await Promise.all([
      db.event.deleteMany({ where: { customerId } }),
      db.surveyResponse.deleteMany({ where: { customerId } }),
      db.loyaltyTransaction.deleteMany({ where: { customerId } }),
      db.loyaltyRedemption.deleteMany({ where: { customerId } }),
    ])
    if (block) {
      await db.customer.update({
        where: { id: customerId },
        data: { blocked: true, loyaltyPoints: 0, loyaltyTotalEarned: 0 },
      })
    } else {
      await db.customer.delete({ where: { id: customerId } })
    }
    return Response.json({ success: true })
  }

  if (intent === "new") {
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const rawData = JSON.parse(formData.get("data") as string)
    const result = newCustomerSchema.safeParse(rawData)
    if (!result.success) {
      return Response.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 },
      )
    }
    const now = new Date()
    return await db.customer.upsert({
      where: { email_orgId: { email: result.data.email, orgId: org.id } },
      update: {
        displayName: result.data.displayName,
        tel: result.data.tel ?? undefined,
        comments: result.data.comments ?? undefined,
        updatedAt: now,
      },
      create: {
        displayName: result.data.displayName,
        email: result.data.email,
        tel: result.data.tel ?? "",
        comments: result.data.comments ?? "",
        orgId: org.id,
        createdAt: now,
        updatedAt: now,
      },
    })
  }
  return null
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }
  const url = new URL(request.url)
  const rawSearch = url.searchParams.get("search") || ""
  // Sanitize: remove special regex chars and limit length
  const search = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "").slice(0, 100)

  if (!search) {
    return {
      customers: await db.customer.findMany({
        where: { orgId: org.id },
        take: 50,
      }),
    }
  }

  return {
    customers: await db.customer.findMany({
      where: {
        orgId: org.id,
        OR: [
          {
            displayName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            comments: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            tel: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 50,
    }),
  }
}
