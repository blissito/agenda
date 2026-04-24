import { useEffect } from "react"
import { data, Link, useLoaderData } from "react-router"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { getPostBySlug, type BlogPost } from "~/lib/blog.server"
import { getMetaTags } from "~/utils/getMetaTags"
import type { Route } from "./+types/blog.$slug"

export const loader = async ({ params }: Route.LoaderArgs) => {
  const post = getPostBySlug(params.slug)
  if (!post) throw data({ message: "Post not found" }, { status: 404 })
  return { post }
}

export const meta = ({ data: loaderData }: { data?: { post: BlogPost } }) => {
  if (!loaderData?.post) {
    return getMetaTags({
      title: "Artículo no encontrado | Deník",
      description: "El artículo que buscas no existe.",
      url: "https://denik.me/blog",
    })
  }
  const { post } = loaderData
  return getMetaTags({
    title: `${post.title} | Deník`,
    description: post.description,
    image: post.image,
    url: `https://denik.me/blog/${post.slug}`,
  })
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] pb-20 md:pb-[120px]">
        <TopBar />

        <article className="max-w-3xl mx-auto px-6 pt-40 lg:pt-[240px]">
          <Link
            to="/blog"
            className="text-brand_blue hover:underline text-sm inline-flex items-center gap-1 mb-8"
          >
            ← Volver al blog
          </Link>

          <p className="text-brand_iron text-sm uppercase tracking-wide mb-3">
            {post.category === "novedades" ? "Novedades" : "Aprendizaje"}
          </p>
          <h1 className="text-4xl lg:text-5xl font-satoBold text-brand_dark leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-brand_gray text-lg mb-10">{post.description}</p>

          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto rounded-2xl mb-12 object-cover max-h-[480px]"
            />
          )}

          <div
            className="text-brand_dark text-lg leading-relaxed
              [&_h2]:text-3xl [&_h2]:font-satoBold [&_h2]:mt-12 [&_h2]:mb-4
              [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-10 [&_h3]:mb-3
              [&_p]:mb-5 [&_p]:text-brand_gray
              [&_a]:text-brand_blue [&_a]:underline
              [&_strong]:text-brand_dark [&_strong]:font-semibold
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:text-brand_gray [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:text-brand_gray [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2
              [&_blockquote]:border-l-4 [&_blockquote]:border-brand_pale [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-brand_iron [&_blockquote]:my-6
              [&_code]:bg-brand_pale [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
              [&_pre]:bg-brand_dark [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-6"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </div>
      <Footer />
    </main>
  )
}
