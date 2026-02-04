/**
 * Factories for generating fake data during development
 * Usage: Import these in db-create.ts
 */
import { faker } from "@faker-js/faker/locale/es_MX"

// Default week days configuration (Mon-Fri 9-18)
// Uses Spanish day names to match Prisma schema (ServiceWeekDays/OrgWeekDays types)
const defaultWeekDays = {
  lunes: [{ start: "09:00", end: "18:00" }],
  martes: [{ start: "09:00", end: "18:00" }],
  mi_rcoles: [{ start: "09:00", end: "18:00" }],
  jueves: [{ start: "09:00", end: "18:00" }],
  viernes: [{ start: "09:00", end: "18:00" }],
  s_bado: null,
  domingo: null,
}

const defaultServiceConfig = {
  confirmation: true,
  reminder: true,
  survey: true,
  whatsapp_confirmation: false,
  whatsapp_reminder: false,
}

export function generateUser(
  overrides?: Partial<{
    email: string
    displayName: string
    emailVerified: boolean
    role: string
  }>,
) {
  return {
    email: faker.internet.email().toLowerCase(),
    displayName: faker.person.fullName(),
    emailVerified: true,
    role: "user",
    orgIds: [],
    ...overrides,
  }
}

export function generateOrg(
  ownerId: string,
  overrides?: Partial<{
    name: string
    slug: string
    description: string
    email: string
    address: string
    businessType: string
  }>,
) {
  const name = overrides?.name || faker.company.name()
  const slug =
    overrides?.slug ||
    faker.helpers.slugify(name).toLowerCase() +
      "-" +
      faker.string.alphanumeric(4)

  return {
    name,
    slug,
    ownerId,
    isActive: true,
    description: faker.company.catchPhrase(),
    email: faker.internet.email().toLowerCase(),
    address: faker.location.streetAddress({ useFullAddress: true }),
    businessType: faker.helpers.arrayElement([
      "salud",
      "belleza",
      "educacion",
      "consultoria",
      "otro",
    ]),
    weekDays: defaultWeekDays,
    social: {
      facebook: "",
      instagram: "",
      linkedin: "",
      tiktok: "",
      website: "",
      x: "",
      youtube: "",
    },
    ...overrides,
  }
}

export function generateService(
  orgId: string,
  overrides?: Partial<{
    name: string
    slug: string
    price: number
    duration: number
    description: string
    employeeName: string
    currency: string
    seats: number
  }>,
) {
  const name = overrides?.name || faker.commerce.productName()
  const slug =
    overrides?.slug ||
    faker.helpers.slugify(name).toLowerCase() +
      "-" +
      faker.string.alphanumeric(4)

  // Extract fields that are handled explicitly above
  const {
    name: _name,
    slug: _slug,
    price,
    duration,
    seats,
    ...restOverrides
  } = overrides || {}

  return {
    name,
    slug,
    orgId,
    price: BigInt(price ?? faker.number.int({ min: 100, max: 5000 })),
    duration: BigInt(
      duration ?? faker.helpers.arrayElement([30, 45, 60, 90, 120]),
    ),
    description: faker.commerce.productDescription(),
    employeeName: faker.person.fullName(),
    currency: restOverrides.currency || "MXN",
    isActive: true,
    archived: false,
    paid: false,
    payment: true,
    allowMultiple: false,
    place: faker.helpers.arrayElement(["presencial", "virtual"]),
    points: BigInt(0),
    seats: BigInt(seats ?? 1),
    config: defaultServiceConfig,
    weekDays: defaultWeekDays,
    ...restOverrides,
  }
}

export function generateCustomer(
  orgId: string,
  overrides?: Partial<{
    displayName: string
    email: string
    tel: string
    comments: string
  }>,
) {
  return {
    orgId,
    displayName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    tel: faker.phone.number({ style: "national" }),
    comments:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ||
      "",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function generateEvent(
  data: {
    orgId: string
    userId: string
    serviceId?: string
    customerId?: string
  },
  overrides?: Partial<{
    title: string
    start: Date
    duration: number
    status: string
    type: string
    notes: string
  }>,
) {
  const start = overrides?.start || faker.date.soon({ days: 14 })
  const duration = overrides?.duration ?? 60
  const end = new Date(start.getTime() + duration * 60 * 1000)

  return {
    orgId: data.orgId,
    userId: data.userId,
    serviceId: data.serviceId || null,
    customerId: data.customerId || null,
    title: overrides?.title || faker.lorem.words(3),
    start,
    end,
    duration: BigInt(duration),
    status:
      overrides?.status ||
      faker.helpers.arrayElement(["confirmed", "pending", "cancelled"]),
    type: overrides?.type || "appointment",
    notes: overrides?.notes || "",
    allDay: false,
    archived: false,
    paid: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
