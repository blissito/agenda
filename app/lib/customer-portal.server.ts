import type { CitaEvent } from "~/components/dash/CitasTable"
import { db } from "~/utils/db.server"
import { getPublicImageUrl } from "~/utils/urls"

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
  level: { name: string; image: string | null; minPoints: number; discountPercent: number } | null
  nextLevel: {
    name: string
    image: string | null
    minPoints: number
    discountPercent: number
    pointsNeeded: number
  } | null
  redemptions: {
    id: string
    code: string
    reward: { name: string; type: string; value: number }
  }[]
}

export type PortalReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  orgId: string
  orgName: string
  orgLogo: string | null
}

export type PortalData = {
  displayName: string
  email: string
  tel: string | null
  orgs: PortalOrgInfo[]
  upcoming: CitaEvent[]
  past: CitaEvent[]
  reviews: PortalReview[]
  loyalty: PortalLoyalty[]
  stats: {
    eventCount: number
    points: number
    reviewCount: number
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

    totalPoints += customer.loyaltyPoints || 0

    for (const event of customer.events) {
      if (!firstEventDate || new Date(event.start) < firstEventDate) {
        firstEventDate = new Date(event.start)
      }

      eventOrgMap[event.id] = org.id

      if (new Date(event.start) >= now) {
        allUpcoming.push(event)
      } else {
        allPast.push(event)
      }
    }

    // Loyalty (one entry per org)
    if (org.loyaltyEnabled && !loyalty.some((l) => l.org.id === org.id)) {
      const rawLevel = customer.loyaltyLevelId
        ? await db.loyaltyLevel.findUnique({
            where: { id: customer.loyaltyLevelId },
            select: { name: true, image: true, minPoints: true, discountPercent: true },
          })
        : null
      const level = rawLevel
        ? { ...rawLevel, image: getPublicImageUrl(rawLevel.image) ?? null, discountPercent: rawLevel.discountPercent }
        : null

      let nextLevel: PortalLoyalty["nextLevel"] = null
      const levels = await db.loyaltyLevel.findMany({
        where: { orgId: org.id },
        orderBy: { minPoints: "asc" },
      })
      const customerTotalEarned = customer.loyaltyTotalEarned || 0
      const found = levels.find((l) => l.minPoints > customerTotalEarned)
      if (found) {
        nextLevel = {
          name: found.name,
          image: getPublicImageUrl(found.image) ?? null,
          minPoints: found.minPoints,
          discountPercent: found.discountPercent,
          pointsNeeded: found.minPoints - customerTotalEarned,
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
        points: customer.loyaltyPoints || 0,
        totalEarned: customer.loyaltyTotalEarned || 0,
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

  // Load customer reviews
  const customerIds = customers.map((c) => c.id)
  const surveyResponses = await db.surveyResponse.findMany({
    where: { customerId: { in: customerIds } },
    orderBy: { createdAt: "desc" },
  })

  const reviews: PortalReview[] = surveyResponses.map((r) => {
    const org = orgsMap.get(r.orgId)
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      orgId: r.orgId,
      orgName: org?.name ?? "—",
      orgLogo: org?.logo ?? null,
    }
  })

  const totalEvents = allUpcoming.length + allPast.length

  return {
    displayName: customers[0].displayName,
    email,
    tel,
    orgs,
    upcoming: allUpcoming,
    past: allPast,
    reviews,
    loyalty,
    eventOrgMap,
    stats: {
      eventCount: totalEvents,
      points: totalPoints,
      reviewCount: reviews.length,
      since: firstEventDate ? formatSince(firstEventDate) : null,
    },
  }
}
