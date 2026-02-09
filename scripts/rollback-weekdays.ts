/**
 * Rollback script: Convert weekDays keys from English back to Spanish (Prisma schema format).
 *
 * Usage:
 *   npx tsx scripts/rollback-weekdays.ts --dry-run   # Preview changes
 *   npx tsx scripts/rollback-weekdays.ts              # Apply changes
 *
 * Idempotent: safe to re-run. Already-Spanish keys are left as-is.
 */
import { PrismaClient } from "@prisma/client"

const ENGLISH_TO_SPANISH: Record<string, string> = {
  monday: "lunes",
  tuesday: "martes",
  wednesday: "mi_rcoles",
  thursday: "jueves",
  friday: "viernes",
  saturday: "s_bado",
  sunday: "domingo",
}

const SPANISH_DAYS = new Set([
  "lunes",
  "martes",
  "mi_rcoles",
  "jueves",
  "viernes",
  "s_bado",
  "domingo",
])

function convertKeys(
  weekDays: Record<string, any>,
): { converted: Record<string, any>; changed: boolean } {
  const result: Record<string, any> = {}
  let changed = false

  for (const [key, value] of Object.entries(weekDays)) {
    if (SPANISH_DAYS.has(key)) {
      result[key] = value
    } else if (ENGLISH_TO_SPANISH[key]) {
      result[ENGLISH_TO_SPANISH[key]] = value
      changed = true
    }
  }

  return { converted: result, changed }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const prisma = new PrismaClient()

  console.log(dryRun ? "=== DRY RUN (ROLLBACK) ===" : "=== ROLLING BACK ===")

  try {
    const orgs = await prisma.org.findMany({
      where: { weekDays: { isNot: undefined } },
      select: { id: true, name: true, weekDays: true },
    })

    let orgCount = 0
    for (const org of orgs) {
      if (!org.weekDays) continue
      const { converted, changed } = convertKeys(org.weekDays as Record<string, any>)
      if (!changed) continue

      orgCount++
      console.log(`Org "${org.name}" (${org.id}):`)
      console.log("  Before:", JSON.stringify(org.weekDays))
      console.log("  After: ", JSON.stringify(converted))

      if (!dryRun) {
        await prisma.org.update({
          where: { id: org.id },
          data: { weekDays: { set: converted as any } },
        })
      }
    }

    const services = await prisma.service.findMany({
      where: { weekDays: { isNot: undefined } },
      select: { id: true, name: true, weekDays: true },
    })

    let serviceCount = 0
    for (const service of services) {
      if (!service.weekDays) continue
      const { converted, changed } = convertKeys(service.weekDays as Record<string, any>)
      if (!changed) continue

      serviceCount++
      console.log(`Service "${service.name}" (${service.id}):`)
      console.log("  Before:", JSON.stringify(service.weekDays))
      console.log("  After: ", JSON.stringify(converted))

      if (!dryRun) {
        await prisma.service.update({
          where: { id: service.id },
          data: { weekDays: { set: converted as any } },
        })
      }
    }

    console.log(`\n${dryRun ? "Would rollback" : "Rolled back"}: ${orgCount} orgs, ${serviceCount} services`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
