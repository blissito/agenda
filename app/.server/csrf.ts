import { randomBytes } from "node:crypto"

/**
 * Simple CSRF protection using double-submit cookie pattern.
 * Token is set as a cookie and must match the form field value.
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex")
}

export function setCsrfCookie(headers: Headers, token: string) {
  headers.append(
    "Set-Cookie",
    `_csrf=${token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=3600`,
  )
}

export function validateCsrf(request: Request, formToken: string | null): boolean {
  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.match(/(?:^|;\s*)_csrf=([a-f0-9]{64})/)
  const cookieToken = match?.[1]
  if (!cookieToken || !formToken) return false
  return cookieToken === formToken
}
