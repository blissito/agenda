import crypto from "node:crypto"
import { MercadoPagoConfig, OAuth, Payment, Preference } from "mercadopago"
import { db } from "~/utils/db.server"

// Cliente con token del marketplace (tu app)
const getClient = () =>
  new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 },
  })

// Cliente con token del vendedor (para crear pagos en su nombre)
const getSellerClient = (accessToken: string) =>
  new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 },
  })

export const mpOAuth = new OAuth(getClient())

export const createPreference = async (
  sellerAccessToken: string,
  data: {
    serviceId: string
    serviceName: string
    price: number // en centavos
    customerId: string
    start: string
    end: string
    backUrl: string
    webhookUrl: string
  },
) => {
  const client = getSellerClient(sellerAccessToken)
  const preference = new Preference(client)

  const unitPrice = data.price / 100 // centavos a pesos
  const marketplaceFee = Math.round(unitPrice * 0.05 * 100) / 100 // 5% comisión

  return preference.create({
    body: {
      items: [
        {
          id: data.serviceId,
          title: data.serviceName,
          unit_price: unitPrice,
          quantity: 1,
          currency_id: "MXN",
        },
      ],
      marketplace_fee: marketplaceFee,
      back_urls: {
        success: `${data.backUrl}/mercadopago/success`,
        failure: `${data.backUrl}/mercadopago/failure`,
        pending: `${data.backUrl}/mercadopago/pending`,
      },
      auto_return: "approved",
      external_reference: JSON.stringify({
        serviceId: data.serviceId,
        customerId: data.customerId,
        start: data.start,
        end: data.end,
      }),
      notification_url: data.webhookUrl,
    },
  })
}

export const getPayment = async (paymentId: string) => {
  const client = getClient()
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}

export const exchangeCodeForTokens = async (
  code: string,
  redirectUri: string,
) => {
  const response = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.MP_CLIENT_ID,
      client_secret: process.env.MP_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })
  return response.json() as Promise<{
    access_token: string
    refresh_token: string
    user_id: number
    public_key: string
    expires_in: number
  }>
}

export const getMPAuthUrl = (redirectUri: string) =>
  `https://auth.mercadopago.com.mx/authorization?client_id=${process.env.MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}`

// Validar firma HMAC-SHA256 del webhook
export const validateWebhookSignature = (
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
): boolean => {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret || !xSignature || !xRequestId) return false

  // Parsear ts y v1 del header x-signature
  const parts = xSignature.split(",")
  let ts = ""
  let hash = ""
  for (const part of parts) {
    const [key, value] = part.split("=")
    if (key === "ts") ts = value
    if (key === "v1") hash = value
  }
  if (!ts || !hash) return false

  // Generar manifest y HMAC
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")

  return hash === expected
}

// Verificar si token expira pronto
export const isTokenExpiringSoon = (
  expiresAt: Date | null,
  bufferMinutes = 60,
): boolean => {
  if (!expiresAt) return true
  const now = new Date()
  const buffer = bufferMinutes * 60 * 1000
  return expiresAt.getTime() - now.getTime() < buffer
}

// Refrescar token de MercadoPago
export const refreshMercadoPagoToken = async (
  userId: string,
  refreshToken: string,
) => {
  const response = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.MP_CLIENT_ID,
      client_secret: process.env.MP_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    console.error("MP token refresh failed:", await response.text())
    return null
  }

  const data = (await response.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  // Actualizar en BD
  const expiresAt = new Date(Date.now() + data.expires_in * 1000)
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user?.mercadopago) {
    await db.user.update({
      where: { id: userId },
      data: {
        mercadopago: {
          ...user.mercadopago,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: expiresAt,
        },
      },
    })
  }

  return data.access_token
}

// ── Payments search ────────────────────────────────────────────
// Doc: https://www.mercadopago.com.mx/developers/es/reference/payments/_payments_search/get

export type MpPayment = {
  id: number
  status: string
  status_detail?: string | null
  transaction_amount: number
  currency_id: string
  date_approved: string | null
  date_created: string
  money_release_date: string | null
  payment_method_id?: string
  payment_type_id?: string
  description?: string | null
  external_reference?: string | null
  transaction_details?: {
    net_received_amount?: number
    total_paid_amount?: number
  }
  fee_details?: Array<{
    amount: number
    fee_payer: string
    type: string
  }>
}

export const searchMpPayments = async ({
  accessToken,
  beginDate,
  endDate,
  limit = 50,
  offset = 0,
}: {
  accessToken: string
  beginDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}): Promise<{
  results: MpPayment[]
  paging: { total: number; limit: number; offset: number }
}> => {
  const params = new URLSearchParams({
    sort: "date_created",
    criteria: "desc",
    limit: String(limit),
    offset: String(offset),
  })
  if (beginDate) params.set("begin_date", beginDate.toISOString())
  if (endDate) params.set("end_date", endDate.toISOString())
  // status approved → cobros efectivos
  params.set("status", "approved")
  params.set("range", "date_created")

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`MP payments/search ${res.status}: ${text}`)
  }
  return res.json()
}

// Obtener token válido (refresh si es necesario)
export const getValidAccessToken = async (
  user: {
    id: string
    mercadopago?: {
      access_token: string
      refresh_token: string
      expires_at: Date
    } | null
  } | null,
): Promise<string | null> => {
  if (!user?.mercadopago) return null

  const { access_token, refresh_token, expires_at } = user.mercadopago

  if (!isTokenExpiringSoon(expires_at)) {
    return access_token
  }

  return refreshMercadoPagoToken(user.id, refresh_token)
}
