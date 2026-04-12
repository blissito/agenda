/**
 * Fetch wrapper contra el backend de Denik.
 * Lee `DENIK_API_KEY` y `DENIK_BASE_URL` del env.
 */
const BASE_URL = process.env.DENIK_BASE_URL ?? "https://www.denik.me"
const API_KEY = process.env.DENIK_API_KEY

if (!API_KEY) {
  // No hacer throw aquí — el servidor MCP debe poder arrancar para listar tools.
  // El error sale al invocar una tool.
  console.error("[denik-mcp] WARNING: DENIK_API_KEY env var is not set")
}

export async function denikGet<T = unknown>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  if (!API_KEY) throw new Error("DENIK_API_KEY env var is required")

  const url = new URL(`/api/mcp/${path}`, BASE_URL)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v))
  }

  const res = await fetch(url, {
    headers: { "X-Denik-Api-Key": API_KEY, Accept: "application/json" },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Denik API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export async function denikPost<T = unknown>(
  path: string,
  body: Record<string, any>,
): Promise<T> {
  if (!API_KEY) throw new Error("DENIK_API_KEY env var is required")

  const url = new URL(`/api/mcp/${path}`, BASE_URL)
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Denik-Api-Key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Denik API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}
