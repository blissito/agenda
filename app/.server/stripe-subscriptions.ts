import { type User } from "@prisma/client"
import Stripe from "stripe"
import { db } from "~/utils/db.server"

let client: Stripe | undefined
export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_TEST) {
    throw new Error("STRIPE_SECRET_TEST not configured")
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_TEST)
  return client
}

export type DenikPlan = "PRO" | "ENTERPRISE"

const isDev = process.env.NODE_ENV === "development"

// Price IDs come from env. Create them in Stripe dashboard (recurring, MXN) and set in Fly secrets.
// Fallbacks point to test prices used in development.
export const PRICE_IDS = {
  PRO_MONTHLY:
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID ||
    (isDev ? "price_pro_monthly_test" : ""),
  PRO_ANNUAL:
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID ||
    (isDev ? "price_pro_annual_test" : ""),
  ENTERPRISE_MONTHLY:
    process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ||
    (isDev ? "price_ent_monthly_test" : ""),
  ENTERPRISE_ANNUAL:
    process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID ||
    (isDev ? "price_ent_annual_test" : ""),
} as const

// Stripe Coupon ID for the trial→PRO welcome promo: 80% off first 3 months.
// Create in Stripe Dashboard → Products → Coupons:
//   percent_off: 80, duration: repeating, duration_in_months: 3
// Then set STRIPE_WELCOME_PROMO_COUPON_ID to the coupon ID.
export const WELCOME_PROMO_COUPON_ID =
  process.env.STRIPE_WELCOME_PROMO_COUPON_ID || ""

export const getOrCreateCustomerId = async (user: User): Promise<string> => {
  const stripe = getStripe()

  if (user.customerId) {
    try {
      const existing = await stripe.customers.retrieve(user.customerId)
      if (existing && !("deleted" in existing && existing.deleted)) {
        return existing.id
      }
    } catch {
      // Customer no longer exists in Stripe → fall through and create a new one
    }
  }

  const found = await stripe.customers.list({ email: user.email, limit: 1 })
  if (found.data.length > 0) {
    const customer = found.data[0]
    await db.user.update({
      where: { id: user.id },
      data: { customerId: customer.id },
    })
    return customer.id
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.displayName || undefined,
    metadata: { userId: user.id },
  })
  await db.user.update({
    where: { id: user.id },
    data: { customerId: customer.id },
  })
  return customer.id
}

export const getActiveSubscription = async (
  user: User,
): Promise<Stripe.Subscription | null> => {
  if (!user.customerId) return null
  const stripe = getStripe()
  try {
    const subs = await stripe.subscriptions.list({
      customer: user.customerId,
      status: "active",
      limit: 5,
    })
    return subs.data[0] ?? null
  } catch (e) {
    console.error("[Stripe] getActiveSubscription error:", e)
    return null
  }
}

type CheckoutResult =
  | { type: "checkout"; url: string }
  | { type: "upgraded"; subscription: Stripe.Subscription }
  | { type: "same_plan"; plan: DenikPlan }

export const createCheckoutSessionURL = async ({
  user,
  origin,
  priceId,
  plan,
  applyWelcomePromo = false,
}: {
  user: User
  origin: string
  priceId: string
  plan: DenikPlan
  applyWelcomePromo?: boolean
}): Promise<CheckoutResult> => {
  const stripe = getStripe()
  const active = await getActiveSubscription(user)

  if (active) {
    const currentPriceId = active.items.data[0]?.price.id
    if (currentPriceId === priceId) {
      return { type: "same_plan", plan }
    }
    const updated = await stripe.subscriptions.update(active.id, {
      items: [{ id: active.items.data[0].id, price: priceId }],
      proration_behavior: "always_invoice",
      metadata: { ...active.metadata, plan, userId: user.id },
    })
    await db.user.update({
      where: { id: user.id },
      data: { plan, subscriptionStatus: updated.status },
    })
    return { type: "upgraded", subscription: updated }
  }

  const customer = await getOrCreateCustomerId(user)

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dash?checkout=success&plan=${plan}`,
    cancel_url: `${origin}/planes?checkout=cancelled`,
    metadata: { plan, userId: user.id },
    subscription_data: { metadata: { plan, userId: user.id } },
  }

  if (applyWelcomePromo && WELCOME_PROMO_COUPON_ID) {
    sessionConfig.discounts = [{ coupon: WELCOME_PROMO_COUPON_ID }]
  } else {
    // Only one of `discounts` or `allow_promotion_codes` can be set.
    sessionConfig.allow_promotion_codes = true
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)
  if (!session.url) throw new Error("Stripe did not return a checkout URL")
  return { type: "checkout", url: session.url }
}

export const createBillingSessionURL = async (user: User): Promise<string> => {
  const stripe = getStripe()
  const customer = await getOrCreateCustomerId(user)
  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: `${process.env.APP_URL || "http://localhost:3000"}/dash`,
  })
  return session.url
}

export const determinePlanFromSubscription = (
  sub: Stripe.Subscription,
): DenikPlan => {
  const metaPlan = sub.metadata?.plan?.toUpperCase()
  if (metaPlan === "PRO" || metaPlan === "ENTERPRISE") return metaPlan
  const priceId = sub.items.data[0]?.price.id
  if (priceId === PRICE_IDS.ENTERPRISE_MONTHLY || priceId === PRICE_IDS.ENTERPRISE_ANNUAL) {
    return "ENTERPRISE"
  }
  return "PRO"
}
