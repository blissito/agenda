import { db } from "~/utils/db.server"

/**
 * Resuelve una Org a partir del header `X-Denik-Api-Key`.
 * Usado por los endpoints `/api/mcp.*` que son consumidos por el paquete
 * `@denik/mcp` (servidor MCP stdio). NO usar para rutas de dashboard —
 * esas siguen usando `getUserAndOrgOrRedirect`.
 */
export async function getOrgFromApiKey(request: Request) {
  const apiKey = request.headers.get("x-denik-api-key")
  if (!apiKey) {
    throw Response.json(
      { error: "Missing X-Denik-Api-Key header" },
      { status: 401 },
    )
  }
  const org = await db.org.findUnique({ where: { apiKey } })
  if (!org) {
    throw Response.json({ error: "Invalid API key" }, { status: 401 })
  }
  return org
}

const PUBLIC_KEY_PREFIX = "dnk_pub_"

/**
 * Resuelve una Org a partir del header `X-Denik-Api-Key` cuando la key tiene
 * el prefijo `dnk_pub_`. Scope reducido: solo lectura + create_booking (free).
 * Usado por `/api/mcp/public/*`, consumido por chatbots públicos (Formmy,
 * widget de landing).
 */
export async function getOrgFromPublicApiKey(request: Request) {
  const apiKey = request.headers.get("x-denik-api-key")
  if (!apiKey) {
    throw Response.json(
      { error: "Missing X-Denik-Api-Key header" },
      { status: 401 },
    )
  }
  if (!apiKey.startsWith(PUBLIC_KEY_PREFIX)) {
    throw Response.json(
      { error: "Public scope required (key must start with dnk_pub_)" },
      { status: 403 },
    )
  }
  const org = await db.org.findUnique({ where: { publicApiKey: apiKey } })
  if (!org) {
    throw Response.json({ error: "Invalid API key" }, { status: 401 })
  }
  return org
}
