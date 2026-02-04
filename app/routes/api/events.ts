import type { Event } from "@prisma/client"
import invariant from "tiny-invariant"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import { newEventSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/customers"

export const action = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()

  if (intent === "delete") {
    const eventId = url.searchParams.get("eventId") as string
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    return await db.event.update({
      where: { id: eventId, orgId: org.id },
      data: { archived: true },
    })
  }

  if (intent === "update") {
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const eventId = url.searchParams.get("eventId") as string
    const data: Event = JSON.parse(formData.get("data") as string)

    // Validate with schema
    const validData = newEventSchema.parse(data)

    // Validate service belongs to org (prevent cross-org event update)
    if (validData.serviceId) {
      const service = await db.service.findUnique({
        where: { id: validData.serviceId },
        select: { orgId: true },
      })
      if (!service || service.orgId !== org.id) {
        return Response.json(
          {
            error: "Servicio no encontrado o no pertenece a esta organización",
          },
          { status: 403 },
        )
      }
    }

    const customer = await db.customer.findUnique({
      where: { id: validData.customerId as string },
      select: { displayName: true },
    })
    invariant(customer)

    // Only update allowed fields - ensure event belongs to org
    const updatedEvent = await db.event.update({
      where: {
        id: eventId,
        orgId: org.id,
      },
      data: {
        start: validData.start,
        end: validData.end,
        duration: validData.duration,
        customerId: validData.customerId,
        employeeId: validData.employeeId,
        serviceId: validData.serviceId,
        paid: validData.paid,
        payment_method: validData.payment_method,
        notes: validData.notes,
        title: customer.displayName as string,
      },
    })
    return updatedEvent
  }

  if (intent === "new") {
    const { org, user } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const data: Event = JSON.parse(formData.get("data") as string)
    const validData = newEventSchema.parse(data)

    // Validate service belongs to org (prevent cross-org event creation)
    if (validData.serviceId) {
      const service = await db.service.findUnique({
        where: { id: validData.serviceId },
        select: { orgId: true },
      })
      if (!service || service.orgId !== org.id) {
        return Response.json(
          {
            error: "Servicio no encontrado o no pertenece a esta organización",
          },
          { status: 403 },
        )
      }
    }

    const customer = await db.customer.findUnique({
      where: { id: validData.customerId as string },
      select: { displayName: true },
    })
    const now = new Date()
    const event = await db.event.create({
      data: {
        ...validData,
        orgId: org.id,
        userId: user.id,
        title: customer?.displayName ?? "",
        // Required fields
        allDay: false,
        archived: false,
        status: "pending",
        type: "APPOINTMENT",
        createdAt: now,
        updatedAt: now,
      },
    })
    return event
  }
  return null
}
