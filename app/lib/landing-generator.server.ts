import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import type { Section3 } from "@easybits.cloud/html-tailwind-generator"
import type { GenerateOptions } from "@easybits.cloud/html-tailwind-generator/generate"
import { generateLanding } from "@easybits.cloud/html-tailwind-generator/generate"
import type { RefineOptions } from "@easybits.cloud/html-tailwind-generator/refine"
import {
  REFINE_SYSTEM,
  refineLanding,
} from "@easybits.cloud/html-tailwind-generator/refine"
import type { Org, Service } from "@prisma/client"
import { db } from "~/utils/db.server"
import { getPublicImageUrl } from "~/utils/urls"
import { DAY_LABELS, WEEK_DAYS } from "~/utils/weekDays"

// ==================== TYPES ====================
export type { Section3 }

// ==================== USAGE LIMITS ====================
const LIMITS = { gen: 5, refine: 20 } // Profesional tier default

export async function getLandingUsage(orgId: string) {
  const org = await db.org.findUniqueOrThrow({
    where: { id: orgId },
    select: {
      landingGenCount: true,
      landingRefineCount: true,
      landingUsageMonth: true,
    },
  })
  const currentMonth = new Date().toISOString().slice(0, 7)
  const isCurrentMonth = org.landingUsageMonth === currentMonth
  return {
    genUsed: isCurrentMonth ? org.landingGenCount : 0,
    refineUsed: isCurrentMonth ? org.landingRefineCount : 0,
    genLimit: LIMITS.gen,
    refineLimit: LIMITS.refine,
  }
}

export async function incrementLandingUsage(
  orgId: string,
  type: "gen" | "refine",
) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const org = await db.org.findUniqueOrThrow({
    where: { id: orgId },
    select: { landingUsageMonth: true },
  })
  const reset = org.landingUsageMonth !== currentMonth
  if (type === "gen") {
    await db.org.update({
      where: { id: orgId },
      data: {
        landingUsageMonth: currentMonth,
        landingGenCount: reset ? 1 : { increment: 1 },
        ...(reset ? { landingRefineCount: 0 } : {}),
      },
    })
  } else {
    await db.org.update({
      where: { id: orgId },
      data: {
        landingUsageMonth: currentMonth,
        landingRefineCount: reset ? 1 : { increment: 1 },
        ...(reset ? { landingGenCount: 0 } : {}),
      },
    })
  }
}

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
  const parts: string[] = [`Landing page para "${org.name}"`]

  if (org.businessType) parts.push(`un negocio de ${org.businessType}`)
  if (org.description) parts.push(`Descripción: ${org.description}`)

  if (services.length > 0) {
    const serviceList = services
      .map((s) => {
        const price = s.price ? `$${Number(s.price)}` : "Gratis"
        const slugPart = s.slug ? ` [link: /${s.slug}]` : ""
        return `- ${s.name} (${price})${slugPart}${s.description ? `: ${s.description}` : ""}`
      })
      .join("\n")
    parts.push(`Servicios:\n${serviceList}`)
    parts.push(
      `IMPORTANT — service links: every service CTA (anchor or button) MUST use the exact link shown in [link: /slug] for that service. The primary "Agendar"/"Reservar" hero CTA should point to the first service link. NEVER use href="#" or placeholder hrefs on service CTAs.`,
    )
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

function getAIKeys() {
  const keys: {
    anthropicApiKey?: string
    pexelsApiKey?: string
    openaiApiKey?: string
  } = {}
  if (process.env.ANTHROPIC_API_KEY)
    keys.anthropicApiKey = process.env.ANTHROPIC_API_KEY
  if (process.env.PEXELS_API_KEY) keys.pexelsApiKey = process.env.PEXELS_API_KEY
  if (process.env.OPENAI_API_KEY) keys.openaiApiKey = process.env.OPENAI_API_KEY
  return keys
}

/** Download a DALL-E temp image and persist it to S3/Tigris. Returns permanent URL. */
function makePersistImage(orgId: string) {
  let _s3: S3Client | null = null
  const getS3 = () => {
    if (!_s3) {
      _s3 = new S3Client({
        region: process.env.AWS_REGION || "auto",
        endpoint: process.env.AWS_ENDPOINT_URL_S3!,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })
    }
    return _s3
  }

  return async (tempUrl: string, _query: string): Promise<string> => {
    const key = `landings/${orgId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
    const response = await fetch(tempUrl)
    const buffer = Buffer.from(await response.arrayBuffer())

    await getS3().send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET || "easybits-public",
        Key: `denik/${key}`,
        Body: buffer,
        ContentType: "image/png",
        ACL: "public-read",
      }),
    )

    return getPublicImageUrl(key)!
  }
}

// ==================== SERVICE LINK INJECTION ====================

type ServiceLike = { name: string; slug?: string | null }

/**
 * Rewrite AI-generated anchor hrefs to point at real service booking URLs.
 * - Matches anchor text by service name (exact, contains, or contained-by).
 * - Fallback: anchors whose text is a CTA verb ("Agendar", "Reservar", etc.)
 *   without a matched service → first service slug.
 * - Leaves external (http/mailto/tel) and in-page (#section) links untouched.
 * Idempotent — safe to run on already-fixed HTML.
 */
export function injectServiceLinks(
  html: string,
  services: ServiceLike[],
): string {
  const withSlugs = services.filter(
    (s): s is { name: string; slug: string } => !!s.slug,
  )
  if (withSlugs.length === 0) return html

  const firstSlug = withSlugs[0].slug
  const CTA_WORDS =
    /\b(?:agendar|agenda|reservar|reserva|reservación|book(?:ing)?|schedule|contratar|empezar|comenzar|ver más|ver detalles|más información)\b/i

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .replace(/\s+/g, " ")

  const byName = withSlugs.map((s) => ({
    name: normalize(s.name),
    slug: s.slug,
  }))
  const validHrefs = new Set(withSlugs.map((s) => `/${s.slug}`))

  return html.replace(
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, attrs, inner) => {
      const hrefMatch = attrs.match(/\bhref="([^"]*)"/)
      const currentHref = hrefMatch?.[1] ?? ""

      // Respect external, mail, tel, and in-page anchor links.
      if (/^(https?:|mailto:|tel:|#[a-zA-Z])/.test(currentHref)) return match

      // Already points at a real service slug — trust it, don't rewrite.
      if (validHrefs.has(currentHref)) return match

      const text = inner
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      const normText = normalize(text)

      let matchedSlug: string | null = null
      for (const { name, slug } of byName) {
        if (
          normText === name ||
          (name.length >= 3 && normText.includes(name)) ||
          (normText.length >= 3 && name.includes(normText))
        ) {
          matchedSlug = slug
          break
        }
      }

      // CTA fallback only applies when the href is empty or a placeholder.
      const isPlaceholderHref =
        currentHref === "" || currentHref === "#" || currentHref === "/"
      if (!matchedSlug && isPlaceholderHref && CTA_WORDS.test(text)) {
        matchedSlug = firstSlug
      }

      if (!matchedSlug) return match

      const desiredHref = `/${matchedSlug}`
      if (currentHref === desiredHref) return match

      const newAttrs = hrefMatch
        ? attrs.replace(/\bhref="[^"]*"/, `href="${desiredHref}"`)
        : ` href="${desiredHref}"${attrs}`
      return `<a${newAttrs}>${inner}</a>`
    },
  )
}

// ==================== CONTRAST SAFETY NET ====================

/**
 * Ancestor-aware pass that rewrites text colors to match the nearest opaque
 * semantic bg ancestor. Handles cases the upstream SDK walker misses:
 *   - suffixed semantic colors (text-primary-dark on bg-primary-dark)
 *   - text-on-X mismatched with effective ancestor (e.g. text-on-primary
 *     appearing inside a bg-surface card nested in a bg-secondary section)
 * Idempotent: safe to run on already-sanitized HTML. Runs on every output
 * path of generate/refine/save so the DB never holds broken contrast.
 */
const SEMANTIC_BG_TOKEN =
  /^bg-(primary|secondary|accent|surface)(?:-(?:light|dark|alt))?(?:\/(\d{1,3}))?$/
const VOID_TAGS = new Set([
  "br",
  "hr",
  "img",
  "input",
  "meta",
  "link",
  "area",
  "base",
  "col",
  "embed",
  "source",
  "track",
  "wbr",
])

type BgFamily = "primary" | "secondary" | "accent" | "surface"

function detectBgFamily(classStr: string): BgFamily | null {
  const tokens = classStr.split(/\s+/).filter((c) => c && !c.includes(":"))
  let found: BgFamily | null = null
  for (const t of tokens) {
    const m = t.match(SEMANTIC_BG_TOKEN)
    if (!m) {
      if (/^bg-gradient-/.test(t)) {
        for (const u of tokens) {
          const g = u.match(
            /^from-(primary|secondary|accent|surface)(?:-(?:light|dark|alt))?(?:\/\d+)?$/,
          )
          if (g) found = g[1] as BgFamily
        }
      }
      continue
    }
    const opacity = m[2] ? Number.parseInt(m[2], 10) : 100
    if (opacity < 50) continue
    found = m[1] as BgFamily
  }
  return found
}

function effectiveBg(stack: (BgFamily | null)[]): BgFamily {
  for (let i = stack.length - 1; i >= 0; i--) {
    const v = stack[i]
    if (v !== null) return v
  }
  return "surface"
}

function fixTextForBg(cls: string, bg: BgFamily): string {
  let s = cls
  const on = `text-on-${bg}`
  const mutedOn = bg === "surface" ? "text-on-surface-muted" : on

  // Seed markers from the SDK (in case it ran first).
  s = s
    .replace(/\btext-on-surface-LIGHT\b/g, on)
    .replace(/\btext-on-surface-DARK\b/g, on)
    .replace(/\btext-on-surface-MUTED\b/g, mutedOn)

  // Neutralize raw color classes that collapse against the same-family bg.
  if (bg === "primary") {
    s = s
      .replace(/\btext-on-surface(?:-muted)?\b/g, on)
      .replace(/\btext-on-secondary\b/g, on)
      .replace(/\btext-on-accent\b/g, on)
      .replace(/\btext-primary(?:-light|-dark)?\b/g, on)
  } else if (bg === "secondary") {
    s = s
      .replace(/\btext-on-surface(?:-muted)?\b/g, on)
      .replace(/\btext-on-primary\b/g, on)
      .replace(/\btext-on-accent\b/g, on)
      .replace(/\btext-secondary(?:-light|-dark)?\b/g, on)
  } else if (bg === "accent") {
    s = s
      .replace(/\btext-on-surface(?:-muted)?\b/g, on)
      .replace(/\btext-on-primary\b/g, on)
      .replace(/\btext-on-secondary\b/g, on)
      .replace(/\btext-accent(?:-light|-dark)?\b/g, on)
  } else {
    // bg is surface — keep colored accent text (it reads fine on neutral),
    // but swap mismatched on-* tokens back to the surface default.
    s = s
      .replace(/\btext-on-primary\b/g, "text-on-surface")
      .replace(/\btext-on-secondary\b/g, "text-on-surface")
      .replace(/\btext-on-accent\b/g, "text-on-surface")
  }
  return s
}

const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>/g

export function sanitizeContrast(html: string): string {
  try {
    const stack: (BgFamily | null)[] = []
    let out = ""
    let lastIdx = 0
    let m: RegExpExecArray | null
    TAG_RE.lastIndex = 0
    while ((m = TAG_RE.exec(html)) !== null) {
      const [full, slash, tagName, attrs, selfCloseSlash] = m
      out += html.slice(lastIdx, m.index)
      lastIdx = m.index + full.length
      if (slash === "/") {
        stack.pop()
        out += full
        continue
      }
      const classMatch = attrs.match(/\bclass="([^"]*)"/)
      const ownBg = classMatch ? detectBgFamily(classMatch[1]) : null
      const effective = ownBg ?? effectiveBg(stack)
      let newAttrs = attrs
      if (classMatch) {
        const fixed = fixTextForBg(classMatch[1], effective)
        if (fixed !== classMatch[1]) {
          newAttrs = attrs.replace(/\bclass="[^"]*"/, `class="${fixed}"`)
        }
      }
      out += `<${tagName}${newAttrs}${selfCloseSlash}>`
      const isVoid =
        VOID_TAGS.has(tagName.toLowerCase()) || selfCloseSlash === "/"
      if (!isVoid) stack.push(ownBg)
    }
    out += html.slice(lastIdx)
    return out
      .replace(/\btext-on-surface-LIGHT\b/g, "text-on-surface")
      .replace(/\btext-on-surface-DARK\b/g, "text-on-surface")
      .replace(/\btext-on-surface-MUTED\b/g, "text-on-surface-muted")
  } catch {
    return html
  }
}

// ==================== GENERATION ====================

export async function generateOrgLanding(
  org: Org,
  services: Service[],
  options?: Partial<GenerateOptions>,
): Promise<Section3[]> {
  const prompt = buildOrgPrompt(org, services)
  const keys = getAIKeys()
  const transform = (html: string) =>
    sanitizeContrast(injectServiceLinks(html, services))
  const userOpts = options ?? {}
  const wrapped: Partial<GenerateOptions> = {
    ...userOpts,
    onSection: userOpts.onSection
      ? (s) => userOpts.onSection!({ ...s, html: transform(s.html) })
      : undefined,
    onImageUpdate: userOpts.onImageUpdate
      ? (id, html) => userOpts.onImageUpdate!(id, transform(html))
      : undefined,
    onDone: userOpts.onDone
      ? (sections) =>
          userOpts.onDone!(
            sections.map((s) => ({ ...s, html: transform(s.html) })),
          )
      : undefined,
  }
  const result = await generateLanding({
    prompt,
    model: "claude-sonnet-4-6",
    ...keys,
    persistImage: keys.openaiApiKey ? makePersistImage(org.id) : undefined,
    ...wrapped,
  })
  return result.map((s) => ({ ...s, html: transform(s.html) }))
}

export async function refineOrgLanding(
  orgId: string,
  currentHtml: string,
  instruction: string,
  options?: Partial<RefineOptions>,
): Promise<string> {
  const keys = getAIKeys()
  const services = await db.service.findMany({
    where: { orgId, isActive: true, archived: false },
    select: { name: true, slug: true },
  })
  const transform = (html: string) =>
    sanitizeContrast(injectServiceLinks(html, services))
  const userOpts = options ?? {}
  const wrapped: Partial<RefineOptions> = {
    ...userOpts,
    onChunk: userOpts.onChunk
      ? (html) => userOpts.onChunk!(transform(html))
      : undefined,
    onDone: userOpts.onDone
      ? (html) => userOpts.onDone!(transform(html))
      : undefined,
  }
  const finalHtml = await refineLanding({
    currentHtml,
    instruction,
    systemPrompt: RESPONSIVE_REFINE_SYSTEM,
    ...keys,
    persistImage: keys.openaiApiKey ? makePersistImage(orgId) : undefined,
    ...wrapped,
  })
  return transform(finalHtml)
}
