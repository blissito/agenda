/**
 * WhatsApp Business OAuth - Initiate Flow
 *
 * This route redirects to Meta's OAuth flow for WhatsApp Business API.
 * Requires MP_CLIENT_ID (or similar env var for Meta) to be configured.
 *
 * Flow:
 * 1. User clicks "Connect WhatsApp" in dashboard
 * 2. Redirects here
 * 3. We redirect to Meta OAuth
 * 4. Meta redirects back to whatsapp.callback.tsx
 */
import { redirect } from "react-router";
import { getUserOrRedirect } from "~/.server/userGetters";
import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Verify user is logged in (redirects if not)
  const user = await getUserOrRedirect(request);

  // Check if credentials are configured
  const clientId = process.env.META_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/integrations/whatsapp/callback`;

  if (!clientId) {
    // Return error page or redirect with error
    throw redirect("/dash/ajustes?error=whatsapp_not_configured");
  }

  // Build Meta OAuth URL
  // Note: This is a placeholder - actual implementation needs proper Meta Business scopes
  const oauthUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
  oauthUrl.searchParams.set("client_id", clientId);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", "whatsapp_business_management,whatsapp_business_messaging");
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", user.orgId || "");

  // For now, redirect back with "coming soon" message since we don't have credentials
  throw redirect("/dash/ajustes?info=whatsapp_coming_soon");

  // When credentials are available, uncomment:
  // throw redirect(oauthUrl.toString());
};

export default function WhatsAppOAuth() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Conectando con WhatsApp Business...</h1>
        <p className="text-gray-600">Serás redirigido en un momento.</p>
      </div>
    </div>
  );
}
