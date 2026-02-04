import { redirect } from "react-router"
import { exchangeCodeForTokens, getMPAuthUrl } from "~/.server/mercadopago"
import { getUserOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/mercadopago.oauth"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUserOrRedirect(request)
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  // Use APP_URL for consistent redirect URIs (required for MP OAuth)
  const origin =
    process.env.APP_URL ||
    (process.env.NODE_ENV === "production"
      ? url.origin.replace("http://", "https://")
      : url.origin)

  // Si no hay code, redirigir a MP para autorización
  if (!code) {
    const redirectUri = `${origin}/mercadopago/oauth`
    throw redirect(getMPAuthUrl(redirectUri))
  }

  // Intercambiar code por tokens
  const redirectUri = `${origin}/mercadopago/oauth`
  const tokens = await exchangeCodeForTokens(code, redirectUri)

  if (!tokens.access_token) {
    console.error("MP OAuth error:", tokens)
    throw redirect("/dash/pagos?mp_error=oauth_failed")
  }

  // Guardar tokens en el usuario
  await db.user.update({
    where: { id: user.id },
    data: {
      mercadopago: {
        user_id: String(tokens.user_id),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        public_key: tokens.public_key,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      },
    },
  })

  throw redirect("/dash/pagos?mp_success=true")
}
