/**
 * Prepare Denik for EasyBits video CTA
 * - Update org slug: fixtergeek-ai7d → bliss
 * - Update org name: Fixtergeek → Fixter.org
 * - Create service "Hablemos de tu producto" (free, 60min)
 * - Update weekDays: Mon-Fri 14:30-16:30
 */
import { PrismaClient } from "@prisma/client"
import slugify from "slugify"

const db = new PrismaClient()
const ORG_ID = "69af87ed0a3772a7b2d11ff4"

async function main() {
  // 1. Update org slug + name
  const org = await db.org.update({
    where: { id: ORG_ID },
    data: {
      slug: "bliss",
      name: "Fixter.org",
      description:
        "Creamos productos digitales y ayudamos a otros a crear los suyos.",
    },
  })
  console.log(`✅ Org updated: slug=${org.slug}, name=${org.name}`)

  // 2. Update weekDays
  const weekDays = {
    monday: [["14:30", "16:30"]],
    tuesday: [["14:30", "16:30"]],
    wednesday: [["14:30", "16:30"]],
    thursday: [["14:30", "16:30"]],
    friday: [["14:30", "16:30"]],
    saturday: null,
    sunday: null,
  }
  await db.org.update({
    where: { id: ORG_ID },
    data: { weekDays },
  })
  console.log("✅ WeekDays updated: Mon-Fri 14:30-16:30")

  // 3. Create service
  const serviceName = "Hablemos de tu producto"
  const baseSlug = slugify(serviceName, { lower: true, strict: true })

  // Check if slug is available
  const existing = await db.service.findFirst({ where: { slug: baseSlug } })
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  const service = await db.service.create({
    data: {
      orgId: ORG_ID,
      name: serviceName,
      slug,
      duration: 60,
      price: 0,
      isActive: true,
      allowMultiple: false,
      archived: false,
      currency: "MXN",
      paid: false,
      payment: false,
      place: "online",
      points: 0,
      seats: 1,
      description:
        "Platicamos sobre tu idea de producto digital y cómo puedo ayudarte a construirlo.",
    },
  })
  console.log(`✅ Service created: ${service.name} (slug: ${service.slug})`)

  console.log("\n🔗 URLs:")
  console.log(`   Landing: bliss.denik.me`)
  console.log(`   Booking: bliss.denik.me/${service.slug}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
