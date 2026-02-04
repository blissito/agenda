/**
 * Messenger OAuth - Callback Handler
 *
 * This route handles the OAuth callback from Meta after user authorization.
 * It exchanges the authorization code for page access tokens and stores them.
 */
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // orgId
  const error = url.searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("[Messenger OAuth] Error:", error, url.searchParams.get("error_description"));
    throw redirect(`/dash/ajustes?error=messenger_oauth_failed&message=${encodeURIComponent(error)}`);
  }

  // Verify user is logged in (redirects if not)
  const user = await getUserOrRedirect(request);

  // Verify state matches user's org
  if (!state || state !== user.orgId) {
    throw redirect("/dash/ajustes?error=messenger_invalid_state");
  }

  if (!code) {
    throw redirect("/dash/ajustes?error=messenger_no_code");
  }

  // Check if credentials are configured
  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;
  const redirectUri = `${process.env.APP_URL}/integrations/messenger/callback`;

  if (!clientId || !clientSecret) {
    throw redirect("/dash/ajustes?error=messenger_not_configured");
  }

  try {
    // Exchange code for user access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("[Messenger OAuth] Token error:", tokenData.error);
      throw redirect(`/dash/ajustes?error=messenger_token_failed&message=${encodeURIComponent(tokenData.error.message)}`);
    }

    // Get user's pages to find ones with messaging enabled
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
    );
    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      throw redirect("/dash/ajustes?error=messenger_no_pages");
    }

    // Use the first page (could be extended to let user choose)
    const page = pagesData.data[0];

    // Update org with Messenger integration
    await db.org.update({
      where: { id: state },
      data: {
        integrations: {
          messenger: {
            pageId: page.id,
            pageAccessToken: page.access_token,
            connectedAt: new Date(),
          },
        },
      },
    });

    throw redirect("/dash/ajustes?success=messenger_connected");
  } catch (e) {
    // Re-throw redirects
    if (e instanceof Response) throw e;

    console.error("[Messenger OAuth] Error:", e);
    throw redirect("/dash/ajustes?error=messenger_failed");
  }
};

export default function MessengerCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Procesando conexión con Messenger...</h1>
        <p className="text-gray-600">Por favor espera un momento.</p>
      </div>
    </div>
  );
}
