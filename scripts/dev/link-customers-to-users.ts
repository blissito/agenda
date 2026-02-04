#!/usr/bin/env npx tsx
/**
 * Link existing Customers to Users by matching email
 *
 * This script finds all Customers without a userId and links them
 * to existing Users with the same email address.
 *
 * Usage:
 *   npx tsx scripts/dev/link-customers-to-users.ts
 *   npx tsx scripts/dev/link-customers-to-users.ts --dry-run
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const isDryRun = process.argv.includes("--dry-run")

  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n")
  }

  // Find all customers without userId
  // Note: For MongoDB, we need to check for both null and non-existent field
  const allCustomers = await prisma.customer.findMany({
    select: { id: true, email: true, displayName: true, userId: true },
  })
  const customers = allCustomers.filter((c) => !c.userId)

  console.log(`Found ${customers.length} customers without userId\n`)

  let linked = 0
  let notFound = 0

  for (const customer of customers) {
    // Find user with same email
    const user = await prisma.user.findUnique({
      where: { email: customer.email },
      select: { id: true, email: true },
    })

    if (user) {
      if (!isDryRun) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { userId: user.id },
        })
      }
      console.log(`✅ Linked: ${customer.email} → User ${user.id}`)
      linked++
    } else {
      console.log(`⏭️  No user found for: ${customer.email}`)
      notFound++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Linked: ${linked}`)
  console.log(`   No user found: ${notFound}`)
  console.log(`   Total processed: ${customers.length}`)

  if (isDryRun) {
    console.log("\n💡 Run without --dry-run to apply changes")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
