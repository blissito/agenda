import { MercadoPagoConfig, Preference, Payment, OAuth } from "mercadopago";
import crypto from "crypto";
import { db } from "~/utils/db.server";

// Cliente con token del marketplace (tu app)
const getClient = () =>
  new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 },
  });

// Cliente con token del vendedor (para crear pagos en su nombre)
const getSellerClient = (accessToken: string) =>
  new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 },
  });

export const mpOAuth = new OAuth(getClient());

export const createPreference = async (
  sellerAccessToken: string,
  data: {
    serviceId: string;
    serviceName: string;
    price: number; // en centavos
    customerId: string;
    start: string;
    end: string;
    backUrl: string;
    webhookUrl: string;
  }
) => {
  const client = getSellerClient(sellerAccessToken);
  const preference = new Preference(client);

  const unitPrice = data.price / 100; // centavos a pesos
  const marketplaceFee = Math.round(unitPrice * 0.05 * 100) / 100; // 5% comisión

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
  });
};

export const getPayment = async (paymentId: string) => {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
};

export const exchangeCodeForTokens = async (code: string, redirectUri: string) => {
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
  });
  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    user_id: number;
    public_key: string;
    expires_in: number;
  }>;
};

export const getMPAuthUrl = (redirectUri: string) =>
  `https://auth.mercadopago.com.mx/authorization?client_id=${process.env.MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}`;

// Validar firma HMAC-SHA256 del webhook
export const validateWebhookSignature = (
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): boolean => {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !xSignature || !xRequestId) return false;

  // Parsear ts y v1 del header x-signature
  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  }
  if (!ts || !hash) return false;

  // Generar manifest y HMAC
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return hash === expected;
};

// Verificar si token expira pronto
export const isTokenExpiringSoon = (
  expiresAt: Date | null,
  bufferMinutes = 60
): boolean => {
  if (!expiresAt) return true;
  const now = new Date();
  const buffer = bufferMinutes * 60 * 1000;
  return expiresAt.getTime() - now.getTime() < buffer;
};

// Refrescar token de MercadoPago
export const refreshMercadoPagoToken = async (
  userId: string,
  refreshToken: string
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
  });

  if (!response.ok) {
    console.error("MP token refresh failed:", await response.text());
    return null;
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // Actualizar en BD
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  const user = await db.user.findUnique({ where: { id: userId } });
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
    });
  }

  return data.access_token;
};

// Obtener token válido (refresh si es necesario)
export const getValidAccessToken = async (
  user: {
    id: string;
    mercadopago?: {
      access_token: string;
      refresh_token: string;
      expires_at: Date;
    } | null;
  } | null
): Promise<string | null> => {
  if (!user?.mercadopago) return null;

  const { access_token, refresh_token, expires_at } = user.mercadopago;

  if (!isTokenExpiringSoon(expires_at)) {
    return access_token;
  }

  return refreshMercadoPagoToken(user.id, refresh_token);
};
