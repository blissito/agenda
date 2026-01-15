import { redirect, type LoaderFunctionArgs } from "react-router";
import { getAuthURL, isValidProvider } from "~/.server/oauth";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { provider } = params;
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/dash";

  if (!provider || !isValidProvider(provider)) {
    throw redirect("/signin");
  }

  // Usar APP_URL en producción, o detectar del request en desarrollo
  const origin = process.env.APP_URL || url.origin;
  const redirectUri = `${origin}/auth/callback/${provider}`;

  // Pasar next en state (codificado base64url)
  const state = Buffer.from(JSON.stringify({ next })).toString("base64url");
  const authUrl = getAuthURL(provider, redirectUri, state);
  throw redirect(authUrl);
};
