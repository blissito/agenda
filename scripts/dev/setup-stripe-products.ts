/**
 * One-shot setup script: creates Stripe products + prices + welcome coupon via
 * the API (no Stripe Dashboard clicking required). Idempotent — reruns are safe
 * because every price uses a `lookup_key`, so an already-existing price is
 * fetched instead of recreated.
 *
 * Usage:
 *   npx tsx scripts/dev/setup-stripe-products.ts
 *
 * Prints `fly secrets set ...` commands at the end for prod rollout.
 *
 * Pricing source of truth: `app/routes/planes.tsx` (yearlyItems / monthlyItems).
 *   - PRO        $249 MXN/mes  |  $199 MXN/mes anual ($2388/año)
 *   - ENTERPRISE $599 MXN/mes  |  $479 MXN/mes anual ($5748/año)
 * Annual prices are billed as a single yearly charge at 12× the equivalent
 * monthly rate (cheaper per-month than the monthly plan = standard discount).
 *
 * Welcome promo: 80% off for first 3 months (repeating coupon), promised by
 * trial-warning email — see CLAUDE.md "TRIAL → PRO" TODO.
 */
import "dotenv/config"
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_TEST) {
  console.error("ERROR: STRIPE_SECRET_TEST no configurada en .env")
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_TEST)

// ── Pricing config ───────────────────────────────────────────────────────────
type PriceSpec = {
  lookupKey: string
  unitAmount: number // in cents (centavos for MXN)
  interval: "month" | "year"
  nickname: string
}

const PLAN_DEFS = [
  {
    productKey: "denik_pro",
    productName: "Denik Profesional",
    productDescription:
      "Agenda con IA · landing page · WhatsApp · pagos en línea",
    prices: [
      {
        lookupKey: "denik_pro_monthly",
        unitAmount: 24900, // $249 MXN
        interval: "month",
        nickname: "PRO mensual",
      },
      {
        lookupKey: "denik_pro_annual",
        unitAmount: 238800, // $2388 MXN/año ($199 × 12)
        interval: "year",
        nickname: "PRO anual",
      },
    ] as PriceSpec[],
  },
  {
    productKey: "denik_enterprise",
    productName: "Denik Enterprise",
    productDescription:
      "Todo lo de PRO + equipo, chatbot IA en landing, soporte prioritario",
    prices: [
      {
        lookupKey: "denik_enterprise_monthly",
        unitAmount: 59900, // $599 MXN
        interval: "month",
        nickname: "ENTERPRISE mensual",
      },
      {
        lookupKey: "denik_enterprise_annual",
        unitAmount: 574800, // $5748 MXN/año ($479 × 12)
        interval: "year",
        nickname: "ENTERPRISE anual",
      },
    ] as PriceSpec[],
  },
] as const

const COUPON_ID = "denik-welcome-3m-80"

const WEBHOOK_URL = "https://denik.me/stripe/webhook"
// Events Denik's app/routes/stripe/webhook.ts actually handles:
const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "payment_intent.payment_failed",
]

// ── Helpers ──────────────────────────────────────────────────────────────────

async function findOrCreateProduct(
  name: string,
  description: string,
): Promise<Stripe.Product> {
  // Stripe doesn't have a product lookup_key, so search by name.
  const existing = await stripe.products.search({
    query: `active:'true' AND name:'${name}'`,
    limit: 1,
  })
  if (existing.data.length > 0) {
    console.log(`  product · existe (${existing.data[0].id})`)
    return existing.data[0]
  }
  const created = await stripe.products.create({
    name,
    description,
    type: "service",
  })
  console.log(`  product · creado (${created.id})`)
  return created
}

async function findOrCreatePrice(
  productId: string,
  spec: PriceSpec,
): Promise<Stripe.Price> {
  const existing = await stripe.prices.list({
    lookup_keys: [spec.lookupKey],
    limit: 1,
    active: true,
  })
  if (existing.data.length > 0) {
    console.log(`  price · existe ${spec.lookupKey} (${existing.data[0].id})`)
    return existing.data[0]
  }
  const created = await stripe.prices.create({
    product: productId,
    unit_amount: spec.unitAmount,
    currency: "mxn",
    recurring: { interval: spec.interval },
    lookup_key: spec.lookupKey,
    nickname: spec.nickname,
  })
  console.log(`  price · creado ${spec.lookupKey} (${created.id})`)
  return created
}

async function findOrCreateWebhook(): Promise<{
  endpoint: Stripe.WebhookEndpoint
  secret: string | null
}> {
  // Stripe doesn't have lookup_keys for webhook endpoints. Match by URL.
  const list = await stripe.webhookEndpoints.list({ limit: 100 })
  const existing = list.data.find((w) => w.url === WEBHOOK_URL)
  if (existing) {
    console.log(`  webhook · existe (${existing.id}) — secret NO disponible`)
    console.log(`    └─ secrets sólo se exponen al crear el endpoint.`)
    console.log(`       Si no tienes el whsec_ guardado, borra el endpoint`)
    console.log(`       en stripe.com/webhooks y vuelve a correr el script.`)
    return { endpoint: existing, secret: null }
  }
  const created = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: WEBHOOK_EVENTS,
    description: "Denik production — denik.me",
    api_version: "2025-05-28.basil",
  })
  console.log(`  webhook · creado (${created.id})`)
  // `secret` only present on the create response, never on retrieval.
  return { endpoint: created, secret: created.secret ?? null }
}

async function findOrCreateCoupon(): Promise<Stripe.Coupon> {
  try {
    const existing = await stripe.coupons.retrieve(COUPON_ID)
    if (existing && !existing.deleted) {
      console.log(`  coupon · existe (${existing.id})`)
      return existing
    }
  } catch {
    // not found → fall through to create
  }
  const created = await stripe.coupons.create({
    id: COUPON_ID,
    percent_off: 80,
    duration: "repeating",
    duration_in_months: 3,
    name: "Bienvenida Denik · 80% off 3 meses",
  })
  console.log(`  coupon · creado (${created.id})`)
  return created
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const keyPrefix = process.env.STRIPE_SECRET_TEST!.slice(0, 7)
  console.log(`Stripe key: ${keyPrefix}... (live=${keyPrefix === "sk_live"})`)
  console.log("")

  const priceIds: Record<string, string> = {}

  for (const plan of PLAN_DEFS) {
    console.log(`▸ ${plan.productName}`)
    const product = await findOrCreateProduct(
      plan.productName,
      plan.productDescription,
    )
    for (const priceSpec of plan.prices) {
      const price = await findOrCreatePrice(product.id, priceSpec)
      priceIds[priceSpec.lookupKey] = price.id
    }
    console.log("")
  }

  console.log("▸ Welcome promo coupon (80% off · 3 meses)")
  const coupon = await findOrCreateCoupon()
  console.log("")

  console.log(`▸ Webhook endpoint (${WEBHOOK_URL})`)
  const { secret: webhookSecret } = await findOrCreateWebhook()
  console.log("")

  // ── Output: env-var-ready lines + Fly commands ────────────────────────────
  const envLines = [
    `STRIPE_PRO_MONTHLY_PRICE_ID=${priceIds.denik_pro_monthly}`,
    `STRIPE_PRO_ANNUAL_PRICE_ID=${priceIds.denik_pro_annual}`,
    `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=${priceIds.denik_enterprise_monthly}`,
    `STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=${priceIds.denik_enterprise_annual}`,
    `STRIPE_WELCOME_PROMO_COUPON_ID=${coupon.id}`,
  ]
  if (webhookSecret) {
    envLines.push(`STRIPE_WEBHOOK_SECRET=${webhookSecret}`)
  }

  console.log("─".repeat(60))
  console.log("PARA .env LOCAL — agrega/reemplaza estas líneas:")
  console.log("─".repeat(60))
  for (const line of envLines) console.log(line)
  console.log("")
  console.log("─".repeat(60))
  console.log("PARA FLY (denik) — corre este comando:")
  console.log("─".repeat(60))
  const flyArgs = envLines.map((l) => `"${l}"`).join(" \\\n  ")
  console.log(`fly secrets set --app denik \\\n  ${flyArgs}`)
  console.log("")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FAILED:", err)
    process.exit(1)
  })
