import type { Org, Service } from "@prisma/client"
import { generateLanding } from "@easybits.cloud/html-tailwind-generator/generate"
import { refineLanding } from "@easybits.cloud/html-tailwind-generator/refine"
import { DAY_LABELS, WEEK_DAYS } from "~/utils/weekDays"
import type { Section3 } from "@easybits.cloud/html-tailwind-generator"
import type { GenerateOptions } from "@easybits.cloud/html-tailwind-generator/generate"
import type { RefineOptions } from "@easybits.cloud/html-tailwind-generator/refine"

// ==================== TYPES ====================
export type { Section3 }

// ==================== HELPERS ====================

function formatWeekDays(weekDays: Org["weekDays"]): string {
  if (!weekDays) return "No especificado"
  const lines: string[] = []
  for (const day of WEEK_DAYS) {
    const val = (weekDays as Record<string, unknown>)[day]
    if (!val) continue
    const parsed = typeof val === "string" ? JSON.parse(val) : val
    if (parsed?.active && parsed.ranges?.length > 0) {
      const ranges = parsed.ranges
        .map((r: { start: string; end: string }) => `${r.start}-${r.end}`)
        .join(", ")
      lines.push(`${DAY_LABELS[day]}: ${ranges}`)
    }
  }
  return lines.length > 0 ? lines.join("\n") : "No especificado"
}

function formatSocialLinks(social: Org["social"]): string {
  if (!social) return ""
  const links: string[] = []
  for (const [key, val] of Object.entries(social)) {
    if (val && typeof val === "string" && val.trim()) {
      links.push(`${key}: ${val}`)
    }
  }
  return links.length > 0 ? links.join(", ") : ""
}

function buildOrgPrompt(org: Org, services: Service[]): string {
  const parts: string[] = [
    `Landing page para "${org.name}"`,
  ]

  if (org.businessType) parts.push(`un negocio de ${org.businessType}`)
  if (org.description) parts.push(`Descripción: ${org.description}`)

  if (services.length > 0) {
    const serviceList = services
      .map((s) => {
        const price = s.price ? `$${Number(s.price)}` : "Gratis"
        return `- ${s.name} (${price})${s.description ? `: ${s.description}` : ""}`
      })
      .join("\n")
    parts.push(`Servicios:\n${serviceList}`)
  }

  const schedule = formatWeekDays(org.weekDays)
  if (schedule !== "No especificado") {
    parts.push(`Horario:\n${schedule}`)
  }

  if (org.address) parts.push(`Dirección: ${org.address}`)

  const social = formatSocialLinks(org.social)
  if (social) parts.push(`Redes sociales: ${social}`)

  if (org.shopKeeper) parts.push(`Propietario: ${org.shopKeeper}`)

  return parts.join(".\n")
}

// ==================== AI CONFIG ====================

function getAIKeys(): { openaiApiKey?: string; anthropicApiKey?: string } {
  if (process.env.OPENAI_API_KEY) {
    return { openaiApiKey: process.env.OPENAI_API_KEY }
  }
  // Anthropic SDK auto-reads ANTHROPIC_API_KEY from env — no need to pass explicitly
  if (process.env.ANTHROPIC_API_KEY) {
    return { anthropicApiKey: process.env.ANTHROPIC_API_KEY }
  }
  return {}
}

// ==================== GENERATION ====================

export async function generateOrgLanding(
  org: Org,
  services: Service[],
  options?: Partial<GenerateOptions>,
): Promise<Section3[]> {
  const prompt = buildOrgPrompt(org, services)
  return generateLanding({
    prompt,
    ...getAIKeys(),
    ...options,
  })
}

export async function refineOrgLanding(
  currentHtml: string,
  instruction: string,
  options?: Partial<RefineOptions>,
): Promise<string> {
  return refineLanding({
    currentHtml,
    instruction,
    ...getAIKeys(),
    ...options,
  })
}
