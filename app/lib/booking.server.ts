/**
 * Public booking creation flow (used by the chatbot MCP).
 *
 * Difference vs the landing-driven booking in `service.$serviceSlug.tsx`:
 * - The visitor is unauthenticated and we don't fully trust them yet
 * - For paid services we don't create an Event — we hand off the URL so the
 *   landing's existing MP flow runs
 * - For free services we create the Event in pending state and require the
 *   customer to click an emailed confirmation link before Meet/Zoom and the
 *   owner notification fire (see `/booking/confirm/$token`)
 */
import type { Org } from "@prisma/client"
import { db } from "~/utils/db.server"
import { sendBookingConfirmationLink } from "~/utils/emails/sendBookingConfirmationLink"
import { generateEventActionToken } from "~/utils/tokens"
import { getServicePublicUrl } from "~/utils/urls"

export type PublicBookingCustomer = {
  name: string
  email: string
  phone?: string
  notes?: string
}

export type PublicBookingInput = {
  org: Org
  serviceSlug: string
  start: Date
  customer: PublicBookingCustomer
}

export type PublicBookingResult =
  | {
      status: "pending_confirmation"
      eventId: string
      emailMasked: string
      message: string
    }
  | {
      status: "paid_service"
      checkoutUrl: string
      price: number
      currency: string
      message: string
    }
  | {
      status: "error"
      error: string
    }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!user || !domain) return email
  const visible = user.slice(0, 1)
  return `${visible}${"*".repeat(Math.max(2, user.length - 1))}@${domain}`
}

export async function createPublicBooking(
  input: PublicBookingInput,
): Promise<PublicBookingResult> {
  const { org, serviceSlug, start, customer } = input

  if (!customer?.name?.trim()) {
    return { status: "error", error: "customer.name is required" }
  }
  if (!customer.email || !EMAIL_REGEX.test(customer.email)) {
    return { status: "error", error: "customer.email is invalid" }
  }
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    return { status: "error", error: "start must be a valid date" }
  }
  if (start.getTime() <= Date.now()) {
    return { status: "error", error: "start must be in the future" }
  }

  const service = await db.service.findUnique({
    where: { slug: serviceSlug },
  })
  if (!service || service.orgId !== org.id || service.archived || !service.isActive) {
    return { status: "error", error: "service not found" }
  }

  const durationMinutes = Number(service.duration)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
  const price = Number(service.price)

  // Paid services: hand off to the landing (MP flow + login + coupons live there).
  if (service.payment && price > 0) {
    const baseUrl = getServicePublicUrl(org.slug, service.slug)
    const checkoutUrl = `${baseUrl}?date=${encodeURIComponent(start.toISOString())}`
    return {
      status: "paid_service",
      checkoutUrl,
      price,
      currency: service.currency,
      message: `Este servicio cuesta ${price} ${service.currency}. Reserva y paga en: ${checkoutUrl}`,
    }
  }

  // Free service: create Event in pending state. Side effects (Meet/Zoom + owner
  // notification) wait until the customer clicks the confirmation link.
  const now = new Date()
  const dbCustomer = await db.customer.upsert({
    where: { email_orgId: { email: customer.email, orgId: org.id } },
    update: {
      displayName: customer.name,
      tel: customer.phone || undefined,
      updatedAt: now,
    },
    create: {
      displayName: customer.name,
      email: customer.email,
      tel: customer.phone || "",
      comments: customer.notes || "",
      org: { connect: { id: org.id } },
      createdAt: now,
      updatedAt: now,
    },
  })

  let event
  try {
    event = await db.event.create({
      data: {
        start,
        end,
        duration: durationMinutes,
        service: { connect: { id: service.id } },
        title: service.name,
        status: "pending",
        org: { connect: { id: org.id } },
        customer: { connect: { id: dbCustomer.id } },
        allDay: false,
        archived: false,
        createdAt: now,
        paid: price === 0,
        type: "appointment",
        userId: org.ownerId,
        updatedAt: now,
        notes: customer.notes || null,
        confirmedAt: null,
      },
      include: {
        customer: true,
        service: { include: { org: true } },
      },
    })
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return { status: "error", error: "slot already taken" }
    }
    throw e
  }

  const token = generateEventActionToken({
    eventId: event.id,
    customerId: dbCustomer.id,
    action: "confirm",
  })

  try {
    await sendBookingConfirmationLink({
      email: dbCustomer.email,
      event: event as any,
      token,
    })
  } catch (e) {
    console.error("[createPublicBooking] email send failed:", e)
  }

  return {
    status: "pending_confirmation",
    eventId: event.id,
    emailMasked: maskEmail(dbCustomer.email),
    message: `Reserva tentativa creada. Enviamos un email a ${maskEmail(dbCustomer.email)} con un link para confirmar.`,
  }
}
