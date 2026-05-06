#!/usr/bin/env npx tsx
/**
 * Fix slugs with underscores (invalid in DNS)
 *
 * Underscores are not valid in DNS subdomains.
 * This script replaces underscores with hyphens in org slugs.
 *
 * Usage:
 *   npx tsx scripts/dev/fix-slugs.ts          # Dry run (preview changes)
 *   npx tsx scripts/dev/fix-slugs.ts --apply  # Apply changes
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const dryRun = !process.argv.includes("--apply")

  console.log(
    dryRun
      ? "\n🔍 DRY RUN (use --apply to execute)\n"
      : "\n🚀 APPLYING CHANGES\n",
  )

  // Find orgs with underscores in slug
  const orgsWithUnderscore = await prisma.org.findMany({
    where: {
      slug: { contains: "_" },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (orgsWithUnderscore.length === 0) {
    console.log("✅ No orgs found with underscores in slug. Nothing to fix.")
    return
  }

  console.log(
    `Found ${orgsWithUnderscore.length} org(s) with underscore in slug:\n`,
  )

  for (const org of orgsWithUnderscore) {
    const newSlug = org.slug
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "")

    console.log(`  📦 ${org.name}`)
    console.log(`     ${org.slug} → ${newSlug}`)

    if (!dryRun) {
      // Check if new slug already exists
      const existing = await prisma.org.findFirst({
        where: { slug: newSlug },
      })

      if (existing) {
        console.log(`     ⚠️  SKIPPED: slug "${newSlug}" already exists`)
        continue
      }

      await prisma.org.update({
        where: { id: org.id },
        data: { slug: newSlug },
      })
      console.log(`     ✅ Updated`)
    }

    console.log("")
  }

  if (dryRun) {
    console.log("Run with --apply to execute these changes.")
  } else {
    console.log("✅ Done!")
  }
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
