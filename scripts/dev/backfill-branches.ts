/**
 * Backfill de sucursales (Branch) para orgs existentes.
 * Uso: npx tsx scripts/dev/backfill-branches.ts [--dry]
 *
 * Por cada Org sin defaultBranchId:
 *   1. crea Branch "Principal" (isDefault, copiando address/lat/lng/timezone/weekDays de la Org)
 *   2. Org.defaultBranchId = branch.id
 *   3. por cada Service de la org → ServiceBranch { serviceId, branchId } sin overrides
 *   4. Event.updateMany({ orgId }) → branchId = branch.id
 *
 * Idempotente: orgs que ya tienen defaultBranchId se saltan. Los pasos 3-4
 * usan el branch existente si ya hay uno default.
 *
 * MongoDB quirk: `where: { defaultBranchId: null }` no captura docs donde el
 * campo no existe. Por eso iteramos todas las orgs y filtramos en memoria.
 */

import { PrismaClient } from "@prisma/client"
import slugify from "slugify"

const db = new PrismaClient()
const DRY = process.argv.includes("--dry")

async function main() {
  const orgs = await db.org.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      defaultBranchId: true,
      address: true,
      lat: true,
      lng: true,
      timezone: true,
      weekDays: true,
    },
  })
  const pending = orgs.filter((o) => !o.defaultBranchId)
  console.log(
    `Total orgs: ${orgs.length} — sin sucursal Principal: ${pending.length}${DRY ? " (dry-run)" : ""}`,
  )

  for (const org of pending) {
    if (DRY) {
      const services = await db.service.count({ where: { orgId: org.id } })
      const events = await db.event.count({ where: { orgId: org.id } })
      console.log(
        `  [dry] ${org.slug} (${org.name}) → Branch "Principal" + ${services} serviceBranches + ${events} events`,
      )
      continue
    }

    // 1. Branch "Principal" — reusa una existente isDefault si la hubiera.
    let branch = await db.branch.findFirst({
      where: { orgId: org.id, isDefault: true },
      select: { id: true },
    })
    if (!branch) {
      branch = await db.branch.create({
        data: {
          orgId: org.id,
          name: "Principal",
          slug: slugify("Principal", { lower: true, strict: true }),
          isDefault: true,
          isActive: true,
          address: org.address ?? null,
          lat: org.lat ?? null,
          lng: org.lng ?? null,
          timezone: org.timezone ?? null,
          weekDays: org.weekDays ?? undefined,
        },
        select: { id: true },
      })
    }

    // 2. Org.defaultBranchId
    await db.org.update({
      where: { id: org.id },
      data: { defaultBranchId: branch.id },
    })

    // 3. ServiceBranch por cada servicio (saltando los que ya existen).
    const services = await db.service.findMany({
      where: { orgId: org.id },
      select: { id: true },
    })
    let sbCreated = 0
    for (const svc of services) {
      const exists = await db.serviceBranch.findFirst({
        where: { serviceId: svc.id, branchId: branch.id },
        select: { id: true },
      })
      if (exists) continue
      await db.serviceBranch.create({
        data: { serviceId: svc.id, branchId: branch.id },
      })
      sbCreated++
    }

    // 4. Event.branchId — todos los eventos de la org. Como solo entramos aquí
    // para orgs sin sucursal previa, todos van a la sede "Principal". (Filtrar
    // por `branchId: null` no captura docs donde el campo no existe en Mongo.)
    const ev = await db.event.updateMany({
      where: { orgId: org.id },
      data: { branchId: branch.id },
    })

    console.log(
      `  ✓ ${org.slug} (${org.name}) → branch ${branch.id} · ${sbCreated} serviceBranches · ${ev.count} events`,
    )
  }
  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
