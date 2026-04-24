import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import matter from "gray-matter"
import { marked } from "marked"

const BLOG_DIR = join(process.cwd(), "content", "blog")

export type BlogCategory = "aprendizaje" | "novedades"

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  image?: string
  category: BlogCategory
  date: string
}

export interface BlogPost extends BlogPostMeta {
  html: string
}

function parseFile(filename: string): BlogPost {
  const slug = filename.replace(/\.md$/, "")
  const raw = readFileSync(join(BLOG_DIR, filename), "utf8")
  const { data, content } = matter(raw)
  const html = marked.parse(content, { async: false }) as string
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    image: data.image ? String(data.image) : undefined,
    category: (data.category === "novedades" ? "novedades" : "aprendizaje"),
    date: String(data.date ?? ""),
    html,
  }
}

export function getAllPosts(): BlogPostMeta[] {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
  const posts = files.map(parseFile)
  return posts
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ html: _html, ...meta }) => meta)
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    return parseFile(`${slug}.md`)
  } catch {
    return null
  }
}
