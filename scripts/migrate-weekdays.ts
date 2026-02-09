/**
 * Migration script: Convert weekDays keys from Spanish to English in all Org and Service records.
 *
 * Usage:
 *   npx tsx scripts/migrate-weekdays.ts --dry-run   # Preview changes
 *   npx tsx scripts/migrate-weekdays.ts              # Apply changes
 *
 * Idempotent: safe to re-run. Already-English keys are left as-is.
 */
import { PrismaClient } from "@prisma/client"

const LEGACY_TO_ENGLISH: Record<string, string> = {
  lunes: "monday",
  martes: "tuesday",
  miércoles: "wednesday",
  mi_rcoles: "wednesday",
  miercoles: "wednesday",
  jueves: "thursday",
  viernes: "friday",
  sábado: "saturday",
  s_bado: "saturday",
  sabado: "saturday",
  domingo: "sunday",
}

const ENGLISH_DAYS = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
])

function convertKeys(
  weekDays: Record<string, any>,
): { converted: Record<string, any>; changed: boolean } {
  const result: Record<string, any> = {}
  let changed = false

  for (const [key, value] of Object.entries(weekDays)) {
    if (ENGLISH_DAYS.has(key)) {
      result[key] = value
    } else if (LEGACY_TO_ENGLISH[key]) {
      result[LEGACY_TO_ENGLISH[key]] = value
      changed = true
    }
    // Unknown keys are dropped
  }

  return { converted: result, changed }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const prisma = new PrismaClient()

  console.log(dryRun ? "=== DRY RUN ===" : "=== MIGRATING ===")

  try {
    // Migrate Orgs
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

    // Migrate Services
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

    console.log(`\n${dryRun ? "Would update" : "Updated"}: ${orgCount} orgs, ${serviceCount} services`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
