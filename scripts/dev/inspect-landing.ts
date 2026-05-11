import { db } from "../../app/utils/db.server"

async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.log("usage: tsx scripts/dev/inspect-landing.ts <orgSlug>")
    return
  }
  const org = await db.org.findFirst({
    where: { slug },
    select: {
      id: true,
      slug: true,
      landingPublished: true,
      landingTheme: true,
      landingCustomColors: true,
      landingSections: true,
    },
  })
  if (!org) {
    console.log("not found")
    return
  }
  console.log("id:", org.id)
  console.log("slug:", org.slug)
  console.log("published:", org.landingPublished)
  console.log("theme:", org.landingTheme)
  console.log("customColors:", JSON.stringify(org.landingCustomColors, null, 2))
  const sections = org.landingSections as any[]
  console.log("sectionCount:", sections?.length)
  if (sections) {
    for (const s of sections) {
      console.log("\n=== section ===")
      console.log("id:", s.id, "order:", s.order, "label:", s.label)
      console.log("html size:", s.html?.length)
      console.log(s.html || "")
    }
  }
}

main().then(() => process.exit(0))
