import { redirect, type LoaderFunctionArgs } from "react-router";
import { getOAuthUser, isValidProvider } from "~/.server/oauth";
import { commitSession, getSession } from "~/sessions";
import { db } from "~/utils/db.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { provider } = params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (!provider || !isValidProvider(provider)) {
    throw redirect("/signin");
  }

  if (error || !code) {
    console.error(`OAuth ${provider} error:`, error);
    throw redirect("/signin");
  }

  const origin = url.origin;
  const redirectUri = `${origin}/auth/callback/${provider}`;

  try {
    const oauthUser = await getOAuthUser(provider, code, redirectUri);

    const user = await db.user.upsert({
      where: { email: oauthUser.email },
      create: {
        email: oauthUser.email,
        emailVerified: true,
        displayName: oauthUser.name,
        photoURL: oauthUser.picture,
        providerId: provider,
        uid: oauthUser.id,
      },
      update: {
        emailVerified: true,
        displayName: oauthUser.name || undefined,
        photoURL: oauthUser.picture || undefined,
        providerId: provider,
      },
    });

    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);

    throw redirect("/dash", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error(`OAuth ${provider} error:`, error);
    throw redirect("/signin");
  }
};
