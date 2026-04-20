import { type LoaderFunctionArgs, redirect } from "react-router"
import { getOAuthUser, isValidProvider } from "~/.server/oauth"
import { commitSession, getSession } from "~/sessions"
import { db } from "~/utils/db.server"
import { sendWelcome } from "~/utils/emails/sendWelcome"

const TRIAL_DAYS = 30

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { provider } = params
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  if (!provider || !isValidProvider(provider)) {
    throw redirect("/signin")
  }

  if (error || !code) {
    console.error(`OAuth ${provider} error:`, error)
    throw redirect("/signin")
  }

  // Usar APP_URL en producción, o detectar del request en desarrollo
  const origin = process.env.APP_URL || url.origin
  const redirectUri = `${origin}/auth/callback/${provider}`

  try {
    const oauthUser = await getOAuthUser(provider, code, redirectUri)

    const existing = await db.user.findUnique({
      where: { email: oauthUser.email },
    })
    let user
    if (!existing) {
      const now = new Date()
      user = await db.user.create({
        data: {
          email: oauthUser.email,
          emailVerified: true,
          displayName: oauthUser.name,
          photoURL: oauthUser.picture,
          providerId: provider,
          uid: oauthUser.id,
          role: "user",
          plan: "TRIAL",
          trialStartsAt: now,
          trialEndsAt: new Date(
            now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      })
      sendWelcome(oauthUser.email, oauthUser.name).catch((err) =>
        console.error("sendWelcome failed:", err),
      )
    } else {
      user = await db.user.update({
        where: { email: oauthUser.email },
        data: {
          emailVerified: true,
          displayName: oauthUser.name || undefined,
          photoURL: oauthUser.picture || undefined,
          providerId: provider,
        },
      })
    }

    const session = await getSession(request.headers.get("Cookie"))
    session.set("userId", user.id)

    // Decodificar state para obtener next
    const stateParam = url.searchParams.get("state")
    let nextUrl = "/dash"
    if (stateParam) {
      try {
        const { next } = JSON.parse(
          Buffer.from(stateParam, "base64url").toString(),
        )
        if (next?.startsWith("/")) nextUrl = next
      } catch {}
    }

    throw redirect(nextUrl, {
      headers: { "Set-Cookie": await commitSession(session) },
    })
  } catch (error) {
    if (error instanceof Response) throw error
    console.error(`OAuth ${provider} error:`, error)
    throw redirect("/signin")
  }
}
