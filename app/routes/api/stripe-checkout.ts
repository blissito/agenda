import { redirect, type ActionFunctionArgs } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import {
  PRICE_IDS,
  createBillingSessionURL,
  createCheckoutSessionURL,
  type DenikPlan,
} from "~/.server/stripe-subscriptions"

type Intent =
  | "pro_monthly"
  | "pro_annual"
  | "enterprise_monthly"
  | "enterprise_annual"
  | "manage_billing"

const intentToPlan: Record<Exclude<Intent, "manage_billing">, { priceKey: keyof typeof PRICE_IDS; plan: DenikPlan }> = {
  pro_monthly: { priceKey: "PRO_MONTHLY", plan: "PRO" },
  pro_annual: { priceKey: "PRO_ANNUAL", plan: "PRO" },
  enterprise_monthly: { priceKey: "ENTERPRISE_MONTHLY", plan: "ENTERPRISE" },
  enterprise_annual: { priceKey: "ENTERPRISE_ANNUAL", plan: "ENTERPRISE" },
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserOrRedirect(request)
  const formData = await request.formData()
  const intent = formData.get("intent") as Intent | null
  const promo = formData.get("promo")
  const origin = new URL(request.url).origin

  if (intent === "manage_billing") {
    const url = await createBillingSessionURL(user)
    return redirect(url)
  }

  if (!intent || !(intent in intentToPlan)) {
    return Response.json({ error: "Invalid intent" }, { status: 400 })
  }

  const { priceKey, plan } = intentToPlan[intent as keyof typeof intentToPlan]
  const priceId = PRICE_IDS[priceKey]
  if (!priceId) {
    return Response.json(
      { error: `Price ID for ${priceKey} not configured` },
      { status: 500 },
    )
  }

  const result = await createCheckoutSessionURL({
    user,
    origin,
    priceId,
    plan,
    applyWelcomePromo: promo === "welcome3m80",
  })

  if (result.type === "checkout") return redirect(result.url)
  if (result.type === "upgraded") {
    return redirect(`/dash?checkout=upgraded&plan=${plan}`)
  }
  return redirect(`/dash?checkout=same_plan&plan=${plan}`)
}
