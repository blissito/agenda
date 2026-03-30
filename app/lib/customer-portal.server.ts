import type { CitaEvent } from "~/components/dash/CitasTable"
import { db } from "~/utils/db.server"

// ==================== TYPES ====================

export type PortalOrgInfo = {
  id: string
  name: string
  slug: string
  logo: string | null
  tel: string | null
}

export type PortalLoyalty = {
  org: PortalOrgInfo
  points: number
  totalEarned: number
  level: { name: string; image: string | null; minPoints: number } | null
  nextLevel: {
    name: string
    minPoints: number
    pointsNeeded: number
  } | null
  redemptions: {
    id: string
    code: string
    reward: { name: string; type: string; value: number }
  }[]
}

export type PortalData = {
  displayName: string
  email: string
  tel: string | null
  orgs: PortalOrgInfo[]
  upcoming: CitaEvent[]
  past: CitaEvent[]
  loyalty: PortalLoyalty[]
  stats: {
    eventCount: number
    points: number
    since: string | null
  }
  /** Maps eventId → orgId for filtering */
  eventOrgMap: Record<string, string>
}

// ==================== HELPERS ====================

function formatSince(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

// ==================== QUERIES ====================

export async function getCustomerPortalData(
  email: string,
): Promise<PortalData | null> {
  const customers = await db.customer.findMany({
    where: { email },
    include: {
      events: {
        orderBy: { start: "desc" },
        take: 50,
        include: { service: true },
      },
    },
  })

  if (!customers.length) return null

  // Resolve orgs (tolerates deleted orgs)
  const orgIds = [...new Set(customers.map((c) => c.orgId))]
  const orgsMap = new Map(
    (
      await db.org.findMany({
        where: { id: { in: orgIds } },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          tel: true,
          loyaltyEnabled: true,
        },
      })
    ).map((o) => [o.id, o]),
  )

  const now = new Date()
  const allUpcoming: CitaEvent[] = []
  const allPast: CitaEvent[] = []
  const orgs: PortalOrgInfo[] = []
  const loyalty: PortalLoyalty[] = []
  const eventOrgMap: Record<string, string> = {}
  let totalPoints = 0
  let firstEventDate: Date | null = null
  let tel: string | null = null

  const seenOrgIds = new Set<string>()

  for (const customer of customers) {
    const org = orgsMap.get(customer.orgId)
    if (!org) continue

    if (!seenOrgIds.has(org.id)) {
      seenOrgIds.add(org.id)
      orgs.push({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        tel: org.tel ?? null,
      })
    }

    if (customer.tel && !tel) tel = customer.tel

    for (const event of customer.events) {
      if (!firstEventDate || new Date(event.start) < firstEventDate) {
        firstEventDate = new Date(event.start)
      }

      eventOrgMap[event.id] = org.id

      if (new Date(event.start) < now && event.service) {
        totalPoints += Number(event.service.points ?? 0)
      }

      if (new Date(event.start) >= now) {
        allUpcoming.push(event)
      } else {
        allPast.push(event)
      }
    }

    // Loyalty (one entry per org)
    if (org.loyaltyEnabled && !loyalty.some((l) => l.org.id === org.id)) {
      const level = customer.loyaltyLevelId
        ? await db.loyaltyLevel.findUnique({
            where: { id: customer.loyaltyLevelId },
            select: { name: true, image: true, minPoints: true },
          })
        : null

      let nextLevel: PortalLoyalty["nextLevel"] = null
      const levels = await db.loyaltyLevel.findMany({
        where: { orgId: org.id },
        orderBy: { minPoints: "asc" },
      })
      const totalEarned = customer.loyaltyTotalEarned ?? 0
      const found = levels.find((l) => l.minPoints > totalEarned)
      if (found) {
        nextLevel = {
          name: found.name,
          minPoints: found.minPoints,
          pointsNeeded: found.minPoints - totalEarned,
        }
      }

      const redemptions = await db.loyaltyRedemption.findMany({
        where: { customerId: customer.id, status: "pending" },
        include: {
          reward: { select: { name: true, type: true, value: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      loyalty.push({
        org: { id: org.id, name: org.name, slug: org.slug, logo: org.logo, tel: org.tel ?? null },
        points: customer.loyaltyPoints ?? 0,
        totalEarned,
        level,
        nextLevel,
        redemptions,
      })
    }
  }

  allUpcoming.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
  allPast.sort(
    (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
  )

  const totalEvents = allUpcoming.length + allPast.length

  return {
    displayName: customers[0].displayName,
    email,
    tel,
    orgs,
    upcoming: allUpcoming,
    past: allPast,
    loyalty,
    eventOrgMap,
    stats: {
      eventCount: totalEvents,
      points: totalPoints,
      since: firstEventDate ? formatSince(firstEventDate) : null,
    },
  }
}
