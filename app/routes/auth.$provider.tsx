import { redirect, type LoaderFunctionArgs } from "react-router";
import { getAuthURL, isValidProvider } from "~/.server/oauth";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { provider } = params;

  if (!provider || !isValidProvider(provider)) {
    throw redirect("/signin");
  }

  // Usar APP_URL en producción, o detectar del request en desarrollo
  const origin = process.env.APP_URL || new URL(request.url).origin;
  const redirectUri = `${origin}/auth/callback/${provider}`;

  const authUrl = getAuthURL(provider, redirectUri);
  throw redirect(authUrl);
};
