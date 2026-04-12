/**
 * Backfill de Org.apiKey para orgs existentes.
 * Uso: npx tsx scripts/dev/backfill-api-keys.ts [--dry]
 *
 * MongoDB quirk: `where: { apiKey: null }` NO captura docs donde el campo no
 * existe (solo donde existe y es null). Por eso iteramos todas las orgs y
 * filtramos en memoria.
 */
import { nanoid } from "nanoid"
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const DRY = process.argv.includes("--dry")

async function main() {
  const all = await db.org.findMany({
    select: { id: true, slug: true, name: true, apiKey: true },
  })
  const toBackfill = all.filter((o) => !o.apiKey)
  console.log(`Total orgs: ${all.length} — sin apiKey: ${toBackfill.length}${DRY ? " (dry-run)" : ""}`)

  for (const org of toBackfill) {
    const apiKey = `dk_${nanoid(32)}`
    if (DRY) {
      console.log(`  [dry] ${org.slug} (${org.name}) → ${apiKey.slice(0, 10)}...`)
    } else {
      await db.org.update({ where: { id: org.id }, data: { apiKey } })
      console.log(`  ✓ ${org.slug} (${org.name})`)
    }
  }
  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
