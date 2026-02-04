/**
 * Route: /event/action?token=xxx
 * Handles tokenized event actions from email links
 * Verifies JWT token and redirects to appropriate action page
 */
import { redirect } from "react-router"
import { commitSession, getSession } from "~/sessions"
import { db } from "~/utils/db.server"
import { verifyEventActionToken } from "~/utils/tokens"
import type { Route } from "./+types/event.action"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  if (!token) {
    throw redirect("/error?reason=missing_token")
  }

  const payload = verifyEventActionToken(token)

  if (!payload) {
    throw redirect("/error?reason=invalid_token")
  }

  // Verify event and customer exist
  const event = await db.event.findUnique({
    where: { id: payload.eventId },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  })

  if (!event) {
    throw redirect("/error?reason=event_not_found")
  }

  if (event.customerId !== payload.customerId) {
    throw redirect("/error?reason=unauthorized")
  }

  // Create a temporary session for the customer
  const session = await getSession(request.headers.get("Cookie"))
  session.set("customerEventAccess", {
    eventId: payload.eventId,
    customerId: payload.customerId,
    action: payload.action,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  })

  const headers = new Headers()
  headers.append("Set-Cookie", await commitSession(session))

  // Redirect to the appropriate action page
  switch (payload.action) {
    case "confirm": {
      // Confirm the event automatically when clicking the email link
      await db.event.update({
        where: { id: payload.eventId },
        data: {
          status: "CONFIRMED",
          updatedAt: new Date(),
        },
      })

      // Get the customer to create/link User account
      const customer = await db.customer.findUnique({
        where: { id: payload.customerId },
      })

      if (customer && !customer.userId) {
        // Create or find User by email
        const user = await db.user.upsert({
          where: { email: customer.email },
          create: {
            email: customer.email,
            displayName: customer.displayName,
            emailVerified: true,
            role: "customer", // Allows access without Org
          },
          update: {
            emailVerified: true,
            // Don't change role if user already exists (could be "user" with Org)
          },
        })

        // Link Customer → User
        await db.customer.update({
          where: { id: customer.id },
          data: { userId: user.id },
        })

        // Set flag to show "account created" message
        session.set("newUserCreated", true)
        headers.set("Set-Cookie", await commitSession(session))
      }

      throw redirect(`/event/${payload.eventId}/confirm`, { headers })
    }
    case "modify":
      throw redirect(`/event/${payload.eventId}/modify`, { headers })
    case "cancel":
      throw redirect(`/event/${payload.eventId}/cancel`, { headers })
    default:
      throw redirect("/error?reason=invalid_action")
  }
}

export default function EventActionPage() {
  // This should not render as loader always redirects
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirigiendo...</p>
    </div>
  )
}
