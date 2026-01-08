import { getProvider, type OAuthProvider } from "./providers";

export function getAuthURL(provider: OAuthProvider, redirectUri: string): string {
  const config = getProvider(provider);
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scope,
  });
  return `${config.authUrl}?${params}`;
}

export async function getOAuthUser(
  provider: OAuthProvider,
  code: string,
  redirectUri: string
) {
  const config = getProvider(provider);

  // Intercambiar code por tokens
  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    throw new Error("No access token received");
  }

  // Obtener info del usuario
  const userRes = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userData = await userRes.json();

  // Normalizar respuesta (Google vs Outlook tienen campos diferentes)
  return normalizeUser(provider, userData);
}

function normalizeUser(provider: OAuthProvider, data: Record<string, unknown>) {
  if (provider === "google") {
    return {
      email: data.email as string,
      name: data.name as string,
      picture: data.picture as string,
      id: data.id as string,
    };
  }
  // Outlook
  return {
    email: (data.mail || data.userPrincipalName) as string,
    name: data.displayName as string,
    picture: null,
    id: data.id as string,
  };
}

export { isValidProvider, type OAuthProvider } from "./providers";
