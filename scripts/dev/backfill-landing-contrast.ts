/**
 * Re-run the SDK sanitizer + injectServiceLinks on saved landingSections.
 * No token cost — purely HTML rewriting.
 *
 * Usage:
 *   npx tsx scripts/dev/backfill-landing-contrast.ts --dry                  # all orgs, dry-run
 *   npx tsx scripts/dev/backfill-landing-contrast.ts                         # all orgs, live
 *   npx tsx scripts/dev/backfill-landing-contrast.ts --orgId <id>            # single org
 *   npx tsx scripts/dev/backfill-landing-contrast.ts --slug <slug>           # single org by slug
 */
import { db } from "../../app/utils/db.server"
import type { Section3 } from "@easybits.cloud/html-tailwind-generator"
import { injectServiceLinks } from "../../app/lib/landing-generator.server"

async function loadSanitize(): Promise<(s: string) => string> {
  // The sanitizer isn't in the SDK's public exports; locate it by scanning dist/chunk-*.js
  // for the one that exports it. Stable across bumps since it's called internally by generate/refine.
  const fs = await import("node:fs")
  const path = await import("node:path")
  const dir = path.resolve(
    "node_modules/@easybits.cloud/html-tailwind-generator/dist",
  )
  const files = fs.readdirSync(dir).filter((f) => f.startsWith("chunk-") && f.endsWith(".js"))
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8")
    if (/export\s*{[^}]*\bsanitizeSemanticColors\b/.test(src)) {
      const mod = (await import(path.join(dir, f))) as {
        sanitizeSemanticColors?: (s: string) => string
      }
      if (mod.sanitizeSemanticColors) return mod.sanitizeSemanticColors
    }
  }
  throw new Error("Could not locate sanitizeSemanticColors in SDK bundle")
}

async function main() {
  const args = process.argv.slice(2)
  const dry = args.includes("--dry")
  const orgIdArg = args[args.indexOf("--orgId") + 1]
  const slugArg = args[args.indexOf("--slug") + 1]

  const sanitize = await loadSanitize()

  const where = orgIdArg && args.includes("--orgId")
    ? { id: orgIdArg }
    : slugArg && args.includes("--slug")
      ? { slug: slugArg }
      : {}

  const orgs = await db.org.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      landingSections: true,
      services: {
        where: { isActive: true, archived: false },
        select: { name: true, slug: true },
      },
    },
  })

  let totalOrgs = 0
  let changedOrgs = 0
  let totalSections = 0
  let changedSections = 0

  for (const org of orgs) {
    totalOrgs++
    const raw = org.landingSections
    if (!Array.isArray(raw) || raw.length === 0) continue
    const sections = raw as unknown as Section3[]
    let orgChanged = false
    const next = sections.map((s) => {
      if (!s.html) return s
      totalSections++
      const step1 = sanitize(s.html)
      const step2 = injectServiceLinks(step1, org.services)
      if (step2 !== s.html) {
        changedSections++
        orgChanged = true
        return { ...s, html: step2 }
      }
      return s
    })

    if (orgChanged) {
      changedOrgs++
      console.log(
        `${dry ? "[DRY]" : "[LIVE]"} ${org.name} (${org.slug}) — ${
          next.filter((_, i) => (raw[i] as any).html !== next[i].html).length
        } / ${next.length} sections rewritten`,
      )
      if (!dry) {
        await db.org.update({
          where: { id: org.id },
          data: { landingSections: next as any },
        })
      }
    }
  }

  console.log(
    `\nSummary: ${changedOrgs}/${totalOrgs} orgs changed; ${changedSections}/${totalSections} sections rewritten (${dry ? "DRY" : "LIVE"})`,
  )
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
