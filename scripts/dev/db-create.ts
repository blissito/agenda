#!/usr/bin/env npx tsx
/**
 * Create test data in the database
 *
 * Usage:
 *   npx tsx scripts/dev/db-create.ts User
 *   npx tsx scripts/dev/db-create.ts User --email "test@example.com" --name "John Doe"
 *   npx tsx scripts/dev/db-create.ts Org --full          # Creates user + org + 2 services + 3 customers
 *   npx tsx scripts/dev/db-create.ts Service --orgId "ID" --name "Consulta" --price 300 --duration 60
 *   npx tsx scripts/dev/db-create.ts Customer --count 5 --orgId "ID"
 *   npx tsx scripts/dev/db-create.ts Event --serviceId "ID" --customerId "ID"
 */
import { PrismaClient } from "@prisma/client"
import {
  generateCustomer,
  generateEvent,
  generateOrg,
  generateService,
  generateUser,
} from "./factories"

const prisma = new PrismaClient()

const MODELS = ["User", "Org", "Service", "Customer", "Event"] as const
type ModelName = (typeof MODELS)[number]

function parseArgs() {
  const args = process.argv.slice(2)
  const options: {
    model?: string
    full: boolean
    count: number
    orgId?: string
    serviceId?: string
    customerId?: string
    userId?: string
    // Custom field overrides
    name?: string
    slug?: string
    price?: number
    duration?: number
    email?: string
  } = {
    full: false,
    count: 1,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === "--full") {
      options.full = true
    } else if (arg === "--count" && args[i + 1]) {
      options.count = parseInt(args[++i], 10)
    } else if (arg === "--orgId" && args[i + 1]) {
      options.orgId = args[++i]
    } else if (arg === "--serviceId" && args[i + 1]) {
      options.serviceId = args[++i]
    } else if (arg === "--customerId" && args[i + 1]) {
      options.customerId = args[++i]
    } else if (arg === "--userId" && args[i + 1]) {
      options.userId = args[++i]
    } else if (arg === "--name" && args[i + 1]) {
      options.name = args[++i]
    } else if (arg === "--slug" && args[i + 1]) {
      options.slug = args[++i]
    } else if (arg === "--price" && args[i + 1]) {
      options.price = parseInt(args[++i], 10)
    } else if (arg === "--duration" && args[i + 1]) {
      options.duration = parseInt(args[++i], 10)
    } else if (arg === "--email" && args[i + 1]) {
      options.email = args[++i]
    } else if (!arg.startsWith("--") && !options.model) {
      options.model = arg
    }
  }

  return options
}

async function createUser(overrides?: { email?: string; name?: string }) {
  const data = generateUser({
    email: overrides?.email,
    displayName: overrides?.name,
  })
  const user = await prisma.user.create({ data })
  console.log(`Created User: [${user.id}] ${user.email}`)
  return user
}

async function createOrg(
  ownerId: string,
  overrides?: { name?: string; slug?: string; email?: string },
) {
  const data = generateOrg(ownerId, overrides)
  const org = await prisma.org.create({ data })

  // Update user's orgId and orgIds
  await prisma.user.update({
    where: { id: ownerId },
    data: {
      orgId: org.id,
      orgIds: { push: org.id },
    },
  })

  console.log(`Created Org: [${org.id}] ${org.slug} - ${org.name}`)
  return org
}

async function createService(
  orgId: string,
  overrides?: {
    name?: string
    slug?: string
    price?: number
    duration?: number
  },
) {
  const data = generateService(orgId, overrides)
  const service = await prisma.service.create({ data })

  // Get org slug to build booking URL
  const org = await prisma.org.findUnique({
    where: { id: orgId },
    select: { slug: true },
  })
  const bookingUrl = org
    ? `https://${org.slug}.denik.me/${service.slug}`
    : `(org not found)`

  console.log(
    `Created Service: [${service.id}] ${service.slug} - ${service.name}`,
  )
  console.log(`  Booking URL: ${bookingUrl}`)
  return service
}

async function createCustomer(
  orgId: string,
  overrides?: { name?: string; email?: string },
) {
  const data = generateCustomer(orgId, {
    displayName: overrides?.name,
    email: overrides?.email,
  })
  const customer = await prisma.customer.create({ data })
  console.log(
    `Created Customer: [${customer.id}] ${customer.email} - ${customer.displayName}`,
  )
  return customer
}

async function createEvent(data: {
  orgId: string
  userId: string
  serviceId?: string
  customerId?: string
}) {
  const eventData = generateEvent(data)
  const event = await prisma.event.create({ data: eventData })
  console.log(`Created Event: [${event.id}] ${event.title} - ${event.status}`)
  return event
}

async function createFullOrg() {
  console.log("\n=== Creating Full Org Setup ===\n")

  // 1. Create User
  const user = await createUser()

  // 2. Create Org
  const org = await createOrg(user.id)

  // 3. Create 2 Services
  console.log("\nCreating services...")
  const services = []
  for (let i = 0; i < 2; i++) {
    services.push(await createService(org.id))
  }

  // 4. Create 3 Customers
  console.log("\nCreating customers...")
  const customers = []
  for (let i = 0; i < 3; i++) {
    customers.push(await createCustomer(org.id))
  }

  // 5. Create 2 Events
  console.log("\nCreating events...")
  await createEvent({
    orgId: org.id,
    userId: user.id,
    serviceId: services[0].id,
    customerId: customers[0].id,
  })
  await createEvent({
    orgId: org.id,
    userId: user.id,
    serviceId: services[1].id,
    customerId: customers[1].id,
  })

  console.log("\n=== Summary ===")
  console.log(`User:      ${user.email}`)
  console.log(`Org:       ${org.slug} (${org.name})`)
  console.log(`Services:  ${services.map((s) => s.slug).join(", ")}`)
  console.log(`Customers: ${customers.length}`)
  console.log(`Events:    2`)
  console.log(`\nOrg ID for reference: ${org.id}`)

  return { user, org, services, customers }
}

async function main() {
  const options = parseArgs()

  if (!options.model) {
    console.log("\nUsage:")
    console.log("  npx tsx scripts/dev/db-create.ts User")
    console.log(
      '  npx tsx scripts/dev/db-create.ts User --email "test@example.com" --name "John Doe"',
    )
    console.log("  npx tsx scripts/dev/db-create.ts Org --full")
    console.log(
      '  npx tsx scripts/dev/db-create.ts Service --orgId "ID" --name "Consulta" --price 300',
    )
    console.log(
      '  npx tsx scripts/dev/db-create.ts Customer --count 5 --orgId "ID"',
    )
    console.log(
      '  npx tsx scripts/dev/db-create.ts Event --serviceId "ID" --customerId "ID"',
    )
    console.log(`\nAvailable models: ${MODELS.join(", ")}`)
    console.log("\nOptional flags:")
    console.log("  --name      Custom name/displayName")
    console.log("  --slug      Custom slug")
    console.log("  --price     Custom price (Service)")
    console.log("  --duration  Custom duration in minutes (Service)")
    console.log("  --email     Custom email")
    return
  }

  const model = options.model as ModelName
  if (!MODELS.includes(model)) {
    console.error(
      `Error: Unknown model "${options.model}". Available: ${MODELS.join(", ")}`,
    )
    process.exit(1)
  }

  try {
    switch (model) {
      case "User":
        for (let i = 0; i < options.count; i++) {
          await createUser({ email: options.email, name: options.name })
        }
        break

      case "Org":
        if (options.full) {
          await createFullOrg()
        } else {
          // Need a user to create an org
          let userId = options.userId
          if (!userId) {
            console.log("No --userId provided, creating a new user...")
            const user = await createUser({ email: options.email })
            userId = user.id
          }
          for (let i = 0; i < options.count; i++) {
            await createOrg(userId, {
              name: options.name,
              slug: options.slug,
              email: options.email,
            })
          }
        }
        break

      case "Service":
        if (!options.orgId) {
          console.error("Error: --orgId required for creating Service")
          process.exit(1)
        }
        for (let i = 0; i < options.count; i++) {
          await createService(options.orgId, {
            name: options.name,
            slug: options.slug,
            price: options.price,
            duration: options.duration,
          })
        }
        break

      case "Customer":
        if (!options.orgId) {
          console.error("Error: --orgId required for creating Customer")
          process.exit(1)
        }
        for (let i = 0; i < options.count; i++) {
          await createCustomer(options.orgId, {
            name: options.name,
            email: options.email,
          })
        }
        break

      case "Event": {
        if (!options.orgId) {
          console.error("Error: --orgId required for creating Event")
          process.exit(1)
        }
        // Get org to find userId
        const org = await prisma.org.findUnique({
          where: { id: options.orgId },
        })
        if (!org) {
          console.error(`Error: Org with id "${options.orgId}" not found`)
          process.exit(1)
        }
        for (let i = 0; i < options.count; i++) {
          await createEvent({
            orgId: options.orgId,
            userId: org.ownerId,
            serviceId: options.serviceId,
            customerId: options.customerId,
          })
        }
        break
      }
    }

    console.log("\nDone!")
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
