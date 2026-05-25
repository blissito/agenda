/**
 * Backfill de Org.publicApiKey para orgs existentes.
 * Uso: npx tsx scripts/dev/backfill-public-api-keys.ts [--dry]
 *
 * Mismo patrón que backfill-api-keys.ts (ver ese archivo para el contexto
 * sobre el quirk de MongoDB con `where: { field: null }`).
 */

import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

const db = new PrismaClient()
const DRY = process.argv.includes("--dry")

async function main() {
  const all = await db.org.findMany({
    select: { id: true, slug: true, name: true, publicApiKey: true },
  })
  const toBackfill = all.filter((o) => !o.publicApiKey)
  console.log(
    `Total orgs: ${all.length} — sin publicApiKey: ${toBackfill.length}${DRY ? " (dry-run)" : ""}`,
  )

  for (const org of toBackfill) {
    const publicApiKey = `dnk_pub_${nanoid(32)}`
    if (DRY) {
      console.log(
        `  [dry] ${org.slug} (${org.name}) → ${publicApiKey.slice(0, 14)}...`,
      )
    } else {
      await db.org.update({ where: { id: org.id }, data: { publicApiKey } })
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
