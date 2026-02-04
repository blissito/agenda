/**
 * Messenger OAuth - Initiate Flow
 *
 * This route redirects to Meta's OAuth flow for Messenger Platform.
 * Requires META_CLIENT_ID to be configured.
 *
 * Flow:
 * 1. User clicks "Connect Messenger" in dashboard
 * 2. Redirects here
 * 3. We redirect to Meta OAuth
 * 4. Meta redirects back to messenger.callback.tsx
 */
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserOrRedirect } from "~/.server/userGetters";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Verify user is logged in (redirects if not)
  const user = await getUserOrRedirect(request);

  // Check if credentials are configured
  const clientId = process.env.META_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/integrations/messenger/callback`;

  if (!clientId) {
    throw redirect("/dash/ajustes?error=messenger_not_configured");
  }

  // Build Meta OAuth URL
  const oauthUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
  oauthUrl.searchParams.set("client_id", clientId);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", "pages_messaging,pages_read_engagement,pages_manage_metadata");
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", user.orgId || "");

  // For now, redirect back with "coming soon" message since we don't have credentials
  throw redirect("/dash/ajustes?info=messenger_coming_soon");

  // When credentials are available, uncomment:
  // throw redirect(oauthUrl.toString());
};

export default function MessengerOAuth() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Conectando con Messenger...</h1>
        <p className="text-gray-600">Serás redirigido en un momento.</p>
      </div>
    </div>
  );
}
