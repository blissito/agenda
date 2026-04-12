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
    throw Response.json({ error: "Missing X-Denik-Api-Key header" }, { status: 401 })
  }
  const org = await db.org.findUnique({ where: { apiKey } })
  if (!org) {
    throw Response.json({ error: "Invalid API key" }, { status: 401 })
  }
  return org
}
