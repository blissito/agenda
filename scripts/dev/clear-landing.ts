import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
async function main() {
  const orgId = process.argv[2]
  if (!orgId) {
    console.error("Usage: tsx clear-landing.ts <orgId>")
    process.exit(1)
  }
  await db.$runCommandRaw({
    update: "Org",
    updates: [
      {
        q: { _id: { $oid: orgId } },
        u: { $unset: { landingSections: "", landingPublished: "" } },
      },
    ],
  })
  console.log("cleared landingSections for org", orgId)
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
