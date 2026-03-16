import { db } from "~/utils/db.server"

export const loader = async () => {
  const orgs = await db.org.findMany({
    where: { landingPublished: true },
    select: { slug: true, customDomain: true },
  })

  const staticPages = [
    { loc: "https://denik.me", priority: "1.0" },
    { loc: "https://denik.me/planes", priority: "0.8" },
    { loc: "https://denik.me/features", priority: "0.7" },
  ]

  const orgPages = orgs.map((org) => ({
    loc: `https://${org.customDomain || `${org.slug}.denik.me`}`,
    priority: "0.6",
  }))

  const entries = [...staticPages, ...orgPages]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
