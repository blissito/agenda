import { getAllPosts } from "~/lib/blog.server"
import { db } from "~/utils/db.server"
import { resolveHostForIndex } from "~/utils/host.server"
import type { Route } from "./+types/sitemap[.]xml"

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const urlEntry = (
  loc: string,
  opts: { lastmod?: string; changefreq?: string; priority?: string } = {},
) => {
  const parts = [`<loc>${escape(loc)}</loc>`]
  if (opts.lastmod) parts.push(`<lastmod>${escape(opts.lastmod.slice(0, 10))}</lastmod>`)
  if (opts.changefreq) parts.push(`<changefreq>${opts.changefreq}</changefreq>`)
  if (opts.priority) parts.push(`<priority>${opts.priority}</priority>`)
  return `  <url>${parts.join("")}</url>`
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const resolution = await resolveHostForIndex(request)
  const origin = new URL(request.url).origin

  const entries: string[] = []

  if (resolution.type === "org") {
    const { org } = resolution
    entries.push(urlEntry(`${origin}/`, { changefreq: "weekly", priority: "1.0" }))
    const services = await db.service.findMany({
      where: { orgId: org.id, isActive: true, archived: false },
      select: { slug: true },
    })
    for (const s of services) {
      if (s.slug) {
        entries.push(
          urlEntry(`${origin}/${s.slug}`, {
            changefreq: "weekly",
            priority: "0.8",
          }),
        )
      }
    }
  } else {
    const marketingPaths: { path: string; priority: string }[] = [
      { path: "/", priority: "1.0" },
      { path: "/planes", priority: "0.9" },
      { path: "/funcionalidades", priority: "0.8" },
      { path: "/ia", priority: "0.8" },
      { path: "/negocios", priority: "0.8" },
      { path: "/community", priority: "0.6" },
      { path: "/blog", priority: "0.7" },
      { path: "/terminosycondiciones", priority: "0.3" },
      { path: "/avisodeprivacidad", priority: "0.3" },
      { path: "/privacidad", priority: "0.3" },
    ]
    for (const m of marketingPaths) {
      entries.push(
        urlEntry(`${origin}${m.path}`, {
          changefreq: "weekly",
          priority: m.priority,
        }),
      )
    }
    try {
      for (const post of getAllPosts()) {
        entries.push(
          urlEntry(`${origin}/blog/${post.slug}`, {
            lastmod: post.date,
            changefreq: "monthly",
            priority: "0.6",
          }),
        )
      }
    } catch {
      // blog dir not present in this build — skip
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
