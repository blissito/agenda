/**
 * Backfill de Org.apiKey para orgs existentes.
 * Uso: npx tsx scripts/dev/backfill-api-keys.ts [--dry]
 */
import { nanoid } from "nanoid"
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const DRY = process.argv.includes("--dry")

async function main() {
  const orgs = await db.org.findMany({
    where: { apiKey: null },
    select: { id: true, slug: true, name: true },
  })
  console.log(`Orgs sin apiKey: ${orgs.length}${DRY ? " (dry-run)" : ""}`)

  for (const org of orgs) {
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
