export type OAuthProvider = "google" | "outlook";

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
}

const providers: Record<OAuthProvider, ProviderConfig> = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "email profile",
  },
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID || "",
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET || "",
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    userInfoUrl: "https://graph.microsoft.com/v1.0/me",
    scope: "openid email profile User.Read",
  },
};

export function getProvider(name: OAuthProvider): ProviderConfig {
  const provider = providers[name];
  if (!provider?.clientId) {
    throw new Error(`Provider ${name} not configured`);
  }
  return provider;
}

export function isValidProvider(name: string): name is OAuthProvider {
  return name === "google" || name === "outlook";
}
