import type Stripe from "stripe"
import { db } from "~/utils/db.server"
import { determinePlanFromSubscription, getStripe } from "~/.server/stripe-subscriptions"

const findUserByCustomer = async (
  customerId: string,
  fallbackEmail?: string | null,
) => {
  let user = await db.user.findFirst({ where: { customerId } })
  if (user) return user

  if (fallbackEmail) {
    user = await db.user.findUnique({ where: { email: fallbackEmail } })
    if (user) {
      user = await db.user.update({
        where: { id: user.id },
        data: { customerId },
      })
      return user
    }
  }
  return null
}

const periodEnd = (sub: Stripe.Subscription): Date | null => {
  // Stripe API ≥2025: current_period_end is on each subscription item.
  // Fallback to top-level for older accounts.
  const itemEnd = sub.items.data[0]?.current_period_end as number | undefined
  const topLevelEnd = (sub as unknown as { current_period_end?: number })
    .current_period_end
  const ts = itemEnd ?? topLevelEnd
  return ts ? new Date(ts * 1000) : null
}

export const handleSubscriptionCreated = async (sub: Stripe.Subscription) => {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id

  let customerEmail: string | null = null
  try {
    const customer = await getStripe().customers.retrieve(customerId)
    if (!("deleted" in customer && customer.deleted)) {
      customerEmail = customer.email
    }
  } catch {}

  const user = await findUserByCustomer(customerId, customerEmail)
  if (!user) {
    console.warn(`[Stripe sub] No user for customer ${customerId}`)
    return
  }

  const plan = determinePlanFromSubscription(sub)

  await db.user.update({
    where: { id: user.id },
    data: {
      plan,
      subscriptionStatus: sub.status,
      currentPeriodEnd: periodEnd(sub),
      subscriptionIds: user.subscriptionIds.includes(sub.id)
        ? user.subscriptionIds
        : { push: sub.id },
    },
  })

  console.log(`[Stripe sub] Created → ${user.email} now ${plan}`)
}

export const handleSubscriptionUpdated = async (sub: Stripe.Subscription) => {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id
  const user = await findUserByCustomer(customerId)
  if (!user) {
    console.warn(`[Stripe sub] update: no user for customer ${customerId}`)
    return
  }

  // Cancellation scheduled — keep plan until period ends, just update status
  if (sub.cancel_at_period_end) {
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: sub.status,
        currentPeriodEnd: periodEnd(sub),
      },
    })
    console.log(`[Stripe sub] ${user.email} scheduled to cancel at period end`)
    return
  }

  if (sub.status === "active" || sub.status === "trialing") {
    const plan = determinePlanFromSubscription(sub)
    await db.user.update({
      where: { id: user.id },
      data: {
        plan,
        subscriptionStatus: sub.status,
        currentPeriodEnd: periodEnd(sub),
      },
    })
    console.log(`[Stripe sub] ${user.email} updated → ${plan} (${sub.status})`)
  } else {
    await db.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: sub.status },
    })
  }
}

export const handleSubscriptionDeleted = async (sub: Stripe.Subscription) => {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id
  const user = await findUserByCustomer(customerId)
  if (!user) return

  // Check if user has any other active subscriptions before downgrading
  const stripe = getStripe()
  const others = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 5,
  })
  const otherActive = others.data.filter((s) => s.id !== sub.id)

  let plan: string = "EXPIRED"
  if (otherActive.length > 0) {
    plan = determinePlanFromSubscription(otherActive[0])
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      plan,
      subscriptionStatus: "canceled",
      currentPeriodEnd: periodEnd(sub),
      subscriptionIds: user.subscriptionIds.filter((id) => id !== sub.id),
    },
  })
  console.log(`[Stripe sub] ${user.email} subscription deleted → ${plan}`)
}
