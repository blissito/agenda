/**
 * WhatsApp Business OAuth - Callback Handler
 *
 * This route handles the OAuth callback from Meta after user authorization.
 * It exchanges the authorization code for access tokens and stores them.
 */

import type { LoaderFunctionArgs } from "react-router"
import { redirect } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state") // orgId
  const error = url.searchParams.get("error")

  // Handle OAuth errors
  if (error) {
    console.error(
      "[WhatsApp OAuth] Error:",
      error,
      url.searchParams.get("error_description"),
    )
    throw redirect(
      `/dash/ajustes?error=whatsapp_oauth_failed&message=${encodeURIComponent(error)}`,
    )
  }

  // Verify user is logged in (redirects if not)
  const user = await getUserOrRedirect(request)

  // Verify state matches user's org
  if (!state || state !== user.orgId) {
    throw redirect("/dash/ajustes?error=whatsapp_invalid_state")
  }

  if (!code) {
    throw redirect("/dash/ajustes?error=whatsapp_no_code")
  }

  // Check if credentials are configured
  const clientId = process.env.META_CLIENT_ID
  const clientSecret = process.env.META_CLIENT_SECRET
  const redirectUri = `${process.env.APP_URL}/integrations/whatsapp/callback`

  if (!clientId || !clientSecret) {
    throw redirect("/dash/ajustes?error=whatsapp_not_configured")
  }

  try {
    // Exchange code for access token
    const tokenUrl = new URL(
      "https://graph.facebook.com/v18.0/oauth/access_token",
    )
    tokenUrl.searchParams.set("client_id", clientId)
    tokenUrl.searchParams.set("client_secret", clientSecret)
    tokenUrl.searchParams.set("redirect_uri", redirectUri)
    tokenUrl.searchParams.set("code", code)

    const tokenResponse = await fetch(tokenUrl.toString())
    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error("[WhatsApp OAuth] Token error:", tokenData.error)
      throw redirect(
        `/dash/ajustes?error=whatsapp_token_failed&message=${encodeURIComponent(tokenData.error.message)}`,
      )
    }

    // Get WhatsApp Business Account info
    // Note: This is a simplified example - actual implementation needs to fetch WABA details
    const wabaResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/business_users?access_token=${tokenData.access_token}`,
    )
    const wabaData = await wabaResponse.json()

    // TODO: Parse WABA response to get phoneNumberId and businessId
    // For now, we'll store what we have

    // Update org with WhatsApp integration
    await db.org.update({
      where: { id: state },
      data: {
        integrations: {
          whatsapp: {
            accessToken: tokenData.access_token,
            phoneNumberId: wabaData.data?.[0]?.id || null, // Placeholder
            businessId: wabaData.data?.[0]?.business?.id || null, // Placeholder
            connectedAt: new Date(),
          },
        },
      },
    })

    throw redirect("/dash/ajustes?success=whatsapp_connected")
  } catch (e) {
    // Re-throw redirects
    if (e instanceof Response) throw e

    console.error("[WhatsApp OAuth] Error:", e)
    throw redirect("/dash/ajustes?error=whatsapp_failed")
  }
}

export default function WhatsAppCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">
          Procesando conexión con WhatsApp...
        </h1>
        <p className="text-gray-600">Por favor espera un momento.</p>
      </div>
    </div>
  )
}
