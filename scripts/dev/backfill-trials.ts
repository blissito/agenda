/**
 * Backfill de plan="TRIAL" para owners existentes sin plan.
 * Uso: npx tsx scripts/dev/backfill-trials.ts [--dry]
 *
 * Asigna trialStartsAt=now, trialEndsAt=now+30d. Al día 20 recibirán el
 * warning via job check-trials (definitions.server.ts).
 *
 * Solo afecta users que son `ownerId` de al menos una Org (excluye
 * customers/collaborators que deben mantener plan=null).
 *
 * MongoDB quirk: `where: { plan: null }` NO captura docs donde el campo no
 * existe. Iteramos y filtramos en memoria.
 */

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const DRY = process.argv.includes("--dry")
const TRIAL_DAYS = 30

async function main() {
  const orgs = await db.org.findMany({ select: { ownerId: true } })
  const ownerIds = Array.from(new Set(orgs.map((o) => o.ownerId)))

  const owners = await db.user.findMany({
    where: { id: { in: ownerIds } },
    select: { id: true, email: true, displayName: true, plan: true },
  })

  const toBackfill = owners.filter((u) => !u.plan)
  console.log(
    `Total owners: ${owners.length} — sin plan: ${toBackfill.length}${DRY ? " (dry-run)" : ""}`,
  )

  const now = new Date()
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

  for (const u of toBackfill) {
    if (DRY) {
      console.log(
        `  [dry] ${u.email} (${u.displayName ?? "—"}) → TRIAL until ${trialEndsAt.toISOString()}`,
      )
    } else {
      await db.user.update({
        where: { id: u.id },
        data: {
          plan: "TRIAL",
          trialStartsAt: now,
          trialEndsAt,
        },
      })
      console.log(`  ✓ ${u.email}`)
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
