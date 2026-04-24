import { Link } from "react-router"
import type { BlogPostMeta } from "~/lib/blog.server"
import { Plan } from "../icons/plan"

const FALLBACK_IMAGES = [
  "https://i.imgur.com/DXNLhab.png",
  "https://i.imgur.com/G2GZLMm.png",
  "https://i.imgur.com/PSDVeEC.png",
  "/images/illustrations/blog/cel.svg",
  "https://i.imgur.com/G2GZLMm.png",
]

const tileBg = ["bg-brand_dark", "bg-brand_blue", "bg-brand_blue", "bg-brand_blue", "bg-brand_blue"]

export const BlogPreview = ({ posts = [] }: { posts?: BlogPostMeta[] }) => {
  const slots: (BlogPostMeta | null)[] = Array.from({ length: 5 }, (_, i) => posts[i] ?? null)

  const Tile = ({
    post,
    index,
    className,
  }: {
    post: BlogPostMeta | null
    index: number
    className: string
  }) => {
    const img = post?.image || FALLBACK_IMAGES[index]
    const content = (
      <div className={`relative ${tileBg[index]} rounded-2xl overflow-hidden w-full h-full group`}>
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={img}
          alt={post?.title || `blogpost${index + 1}`}
        />
        {post && (
          <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
            <p className="text-white font-satoBold text-sm md:text-base lg:text-lg leading-tight">
              {post.title}
            </p>
          </div>
        )}
      </div>
    )
    if (!post) {
      return <div className={className}>{content}</div>
    }
    return (
      <Link to={`/blog/${post.slug}`} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <section className="max-w-[90%] xl:max-w-7xl w-full mx-auto my-[160px] text-center">
      <h2 className="group text-4xl lg:text-6xl	font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4"> Nuestro</span>
        <Plan className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
        <span className="ml-4">blog </span>
      </h2>
      <article className="flex mt-20 gap-6 flex-wrap lg:flex-nowrap h-auto lg:h-[680px] box-border	">
        <Tile
          post={slots[0]}
          index={0}
          className="w-full md:w-[50%] h-[310px] md:h-auto block"
        />
        <div className="w-full md:w-[40%] md:grow lg:grow-0 lg:w-[25%] flex flex-row lg:flex-col gap-6 box-border	">
          <Tile
            post={slots[1]}
            index={1}
            className="w-[50%] md:w-full lg:w-auto h-auto lg:h-[320px] block"
          />
          <Tile
            post={slots[2]}
            index={2}
            className="w-[50%] md:w-full lg:w-auto grow block"
          />
        </div>
        <div className="w-full md:w-full lg:w-[25%] flex flex-row lg:flex-col gap-6 box-border	">
          <Tile
            post={slots[3]}
            index={3}
            className="w-[50%] md:w-auto grow block"
          />
          <Tile
            post={slots[4]}
            index={4}
            className="w-[50%] md:w-auto h-auto lg:h-[280px] block"
          />
        </div>
      </article>
      <Link
        to="/blog"
        className="inline-block mt-12 px-8 py-3 rounded-full border border-brand_dark text-brand_dark font-satoMedium hover:bg-brand_dark hover:text-white transition-colors"
      >
        Ver todos los artículos
      </Link>
    </section>
  )
}
