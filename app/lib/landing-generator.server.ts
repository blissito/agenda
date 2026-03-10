import type { Org, Service } from "@prisma/client"
import { generateLanding } from "@easybits.cloud/html-tailwind-generator/generate"
import {
  refineLanding,
  REFINE_SYSTEM,
} from "@easybits.cloud/html-tailwind-generator/refine"
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

// ==================== RESPONSIVE REFINE PROMPT ====================

const RESPONSIVE_REFINE_SYSTEM =
  REFINE_SYSTEM +
  `

RESPONSIVE DESIGN — CRITICAL:
- All sections MUST work at 375px (mobile), 768px (tablet), and 1280px+ (desktop)
- Use Tailwind responsive prefixes: base for mobile, md: for tablet, lg: for desktop
- NEVER use fixed widths on interactive elements — buttons must use px/py padding, not w-*/h-* circles
- Grid: grid-cols-1 base, md:grid-cols-2, lg:grid-cols-3
- Images: w-full h-auto object-cover, never fixed dimensions
- Text: text-2xl md:text-4xl for headings, text-base for body`

// ==================== AI CONFIG ====================

function getAIKeys(): { anthropicApiKey?: string; pexelsApiKey?: string } {
  const keys: { anthropicApiKey?: string; pexelsApiKey?: string } = {}
  if (process.env.ANTHROPIC_API_KEY) {
    keys.anthropicApiKey = process.env.ANTHROPIC_API_KEY
  }
  if (process.env.PEXELS_API_KEY) {
    keys.pexelsApiKey = process.env.PEXELS_API_KEY
  }
  return keys
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
    systemPrompt: RESPONSIVE_REFINE_SYSTEM,
    ...getAIKeys(),
    ...options,
  })
}
