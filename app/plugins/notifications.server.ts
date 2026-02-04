/**
 * Multi-Channel Notifications Plugin
 *
 * Handles sending notifications through multiple channels (email, WhatsApp, Messenger)
 * based on organization integrations and service configuration.
 *
 * Supported Events:
 * - booking.created: Send confirmation
 * - booking.reminder: Send reminder before appointment
 * - booking.completed: Send survey after appointment
 * - booking.cancelled: Send cancellation notice
 */
import type { Customer, Event, Org, Service } from "@prisma/client"
import {
  isWhatsAppConfigured,
  sendWhatsAppConfirmation,
  sendWhatsAppReminder,
  WhatsAppNotConfiguredError,
} from "~/.server/whatsapp"
import { db } from "~/utils/db.server"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import { register } from "./index.server"

type ServiceConfig = {
  confirmation?: boolean
  reminder?: boolean
  survey?: boolean
  whatsapp_confirmation?: boolean
  whatsapp_reminder?: boolean
}

type OrgWithIntegrations = Org & {
  integrations?: {
    whatsapp?: {
      phoneNumberId?: string | null
      accessToken?: string | null
      businessId?: string | null
      connectedAt?: Date | null
    } | null
    messenger?: {
      pageId?: string | null
      pageAccessToken?: string | null
      connectedAt?: Date | null
    } | null
  } | null
  timezone?: string | null
}

type BookingEventData = {
  event: Event
  service: Service
  customer: Customer
}

/**
 * Get formatted date string for notifications
 */
function getFormattedDateTime(date: Date, timezone?: string | null): string {
  return formatFullDateInTimezone(date, timezone || DEFAULT_TIMEZONE)
}

/**
 * Handle booking.created event
 * Sends confirmation via configured channels
 */
async function handleBookingCreated(
  data: unknown,
  orgId: string,
): Promise<void> {
  const { event, service, customer } = data as BookingEventData
  const config = service.config as ServiceConfig | null

  // Get org with integrations
  const org = (await db.org.findUnique({
    where: { id: orgId },
  })) as OrgWithIntegrations | null

  if (!org) return

  const dateTime = getFormattedDateTime(event.start, org.timezone)

  // WhatsApp confirmation
  if (config?.whatsapp_confirmation && customer.tel) {
    try {
      if (isWhatsAppConfigured(org)) {
        await sendWhatsAppConfirmation(
          org,
          customer.tel,
          customer.displayName,
          service.name,
          dateTime,
        )
        console.log(
          `[Notifications] WhatsApp confirmation sent for event ${event.id}`,
        )
      }
    } catch (error) {
      if (!(error instanceof WhatsAppNotConfiguredError)) {
        console.error(`[Notifications] WhatsApp confirmation failed:`, error)
      }
    }
  }

  // Messenger confirmation (if we have a Messenger ID for the customer)
  // Note: This requires storing customer's Messenger ID, which is a future feature
  // For now, Messenger notifications would require the customer to initiate contact first
}

/**
 * Handle booking.reminder event
 * Sends reminder via configured channels
 */
async function handleBookingReminder(
  data: unknown,
  orgId: string,
): Promise<void> {
  const { event, service, customer } = data as BookingEventData
  const config = service.config as ServiceConfig | null

  // Get org with integrations
  const org = (await db.org.findUnique({
    where: { id: orgId },
  })) as OrgWithIntegrations | null

  if (!org) return

  const dateTime = getFormattedDateTime(event.start, org.timezone)

  // WhatsApp reminder
  if (config?.whatsapp_reminder && customer.tel) {
    try {
      if (isWhatsAppConfigured(org)) {
        await sendWhatsAppReminder(
          org,
          customer.tel,
          customer.displayName,
          service.name,
          dateTime,
        )
        console.log(
          `[Notifications] WhatsApp reminder sent for event ${event.id}`,
        )
      }
    } catch (error) {
      if (!(error instanceof WhatsAppNotConfiguredError)) {
        console.error(`[Notifications] WhatsApp reminder failed:`, error)
      }
    }
  }
}

/**
 * Handle booking.completed event
 * Could send survey or follow-up via multiple channels
 */
async function handleBookingCompleted(
  data: unknown,
  _orgId: string,
): Promise<void> {
  const { event } = data as BookingEventData

  // Survey is handled by email via the job scheduler
  // WhatsApp/Messenger surveys would be a future feature
  console.log(`[Notifications] Booking completed: ${event.id}`)
}

/**
 * Handle booking.cancelled event
 * Sends cancellation notice via configured channels
 */
async function handleBookingCancelled(
  data: unknown,
  orgId: string,
): Promise<void> {
  const { event, service, customer } = data as BookingEventData

  // Get org with integrations
  const org = (await db.org.findUnique({
    where: { id: orgId },
  })) as OrgWithIntegrations | null

  if (!org) return

  // Email cancellation is handled elsewhere
  // WhatsApp/Messenger cancellation would be a future feature
  console.log(`[Notifications] Booking cancelled: ${event.id}`)
}

// Register the notifications plugin
register({
  id: "notifications",
  name: "Notificaciones Multi-Canal",
  description: "Envía notificaciones por email, WhatsApp y Messenger",
  icon: "bell",
  onEvent: {
    "booking.created": handleBookingCreated,
    "booking.reminder": handleBookingReminder,
    "booking.completed": handleBookingCompleted,
    "booking.cancelled": handleBookingCancelled,
  },
})
