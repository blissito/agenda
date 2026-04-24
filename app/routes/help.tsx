import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react"
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import { Link, useLoaderData, type MetaFunction } from "react-router"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { FeaturesList } from "~/components/icons/cathegories/featuresList"
import { Graduate } from "~/components/icons/cathegories/graduate"
import { HelpIcon } from "~/components/icons/help"
import { getAllPosts, type BlogPostMeta } from "~/lib/blog.server"
import { getMetaTags } from "~/utils/getMetaTags"

export const meta: MetaFunction = () =>
  getMetaTags({
    title: "Ayuda y recursos | Deník",
    description:
      "Encuentra guías, novedades y respuestas para sacarle el máximo provecho a Deník y hacer crecer tu negocio.",
    url: "https://denik.me/blog",
  })

export const loader = async () => {
  return { posts: getAllPosts() }
}

export default function Help() {
  const { posts } = useLoaderData<typeof loader>()
  const [search, setSearch] = useState("")
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("help-search")?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const filtered = useMemo(() => {
    let results = posts
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q),
      )
    }
    if (activeSlug) {
      results = results.filter((a) => a.slug === activeSlug)
    }
    return results
  }, [posts, search, activeSlug])

  const handleSidebarClick = (slug: string) => {
    setActiveSlug((prev) => (prev === slug ? null : slug))
  }

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] pb-20 md:pb-[120px]">
        <TopBar />

        <div className="max-w-[90%] xl:max-w-7xl mx-auto pt-40 lg:pt-[240px]">
          {/* Title — always on top on mobile, inside grid on lg */}
          <div className="lg:hidden mb-8">
            <h2 className="group text-3xl lg:text-6xl font-satoBold text-brand_dark leading-tight flex flex-wrap items-center justify-start">
              <span className="mr-4">Ayuda,</span>
              <HelpIcon className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10" />
              <span className="ml-4 mr-4">recursos</span> y soporte
            </h2>
            <p className="mt-4 text-brand_gray text-lg">
              Encuentra las respuestas que necesitas para aprovechar todo el
              potencial de Deník.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-12">
            {/* Sidebar */}
            <Catalogue
              posts={posts}
              search={search}
              setSearch={setSearch}
              activeSlug={activeSlug}
              onItemClick={handleSidebarClick}
            />

            {/* Main content */}
            <Content filtered={filtered} search={search} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

const Content = ({
  filtered,
  search,
}: {
  filtered: BlogPostMeta[]
  search: string
}) => {
  return (
    <section className="lg:col-span-6">
      <div className="hidden lg:block">
        <h2 className="group text-4xl lg:text-6xl font-satoBold text-brand_dark leading-tight flex flex-wrap items-center justify-start">
          <span className="mr-4">Ayuda,</span>
          <HelpIcon className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10 lg:w-14 lg:h-14" />
          <span className="ml-4 mr-4">recursos</span> y soporte
        </h2>
        <p className="mt-6 text-brand_gray text-lg">
          Encuentra las respuestas que necesitas para aprovechar todo el
          potencial de Deník e impulsa las ventas de tu negocio. Chatea con
          nuestro equipo o envía un correo electrónico a{" "}
          <a href="mailto:hola@denik.me" className="text-brand_blue underline">
            hola@denik.me
          </a>
        </p>
      </div>

      {/* Articles */}
      <div className=" mt-0 md:mt-16">
        <h3 className="text-2xl lg:text-3xl font-satoBold text-brand_dark border-b border-brand_pale pb-4">
          Documentos de ayuda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-10 gap-12">
          {filtered.map((article) => (
            <TiltCard
              key={article.slug}
              title={article.title}
              link={`/blog/${article.slug}`}
              description={article.description}
              image={article.image}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-brand_iron text-center py-20">
            No se encontraron resultados para "{search}"
          </p>
        )}
      </div>
    </section>
  )
}

const Catalogue = ({
  posts,
  search,
  setSearch,
  activeSlug,
  onItemClick,
}: {
  posts: BlogPostMeta[]
  search: string
  setSearch: (v: string) => void
  activeSlug: string | null
  onItemClick: (slug: string) => void
}) => {
  const aprendizaje = posts.filter((a) => a.category === "aprendizaje")
  const novedades = posts.filter((a) => a.category === "novedades")

  return (
    <section className="lg:col-span-2">
      <div className="sticky top-[280px] flex flex-col gap-6">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_iron"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="help-search"
            type="text"
            placeholder="Busca un tema"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-16 py-3 border border-brand_pale rounded-full text-brand_dark placeholder:text-brand_iron focus:outline-none focus:ring-0 focus:border-brand_blue border transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-brand_iron text-xs font-medium px-2 py-0.5 bg-brand_pale rounded pointer-events-none">
            ⌘ K
          </kbd>
        </div>

        {/* Aprendizaje */}
        <div className="text-brand_gray flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <Graduate className="flex" />
            <h3 className="font-semibold text-brand_dark">Aprendizaje</h3>
          </div>
          {aprendizaje.map((a) => (
            <p
              key={a.slug}
              className={`pl-8 cursor-pointer transition-colors ${activeSlug === a.slug ? "text-brand_blue" : "hover:text-brand_blue"}`}
              onClick={() => onItemClick(a.slug)}
            >
              {a.title}
            </p>
          ))}
        </div>

        {/* Nuevas funcionalidades */}
        <div className="text-brand_gray flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <FeaturesList className="flex" />
            <h3 className="font-semibold text-brand_dark">
              Nuevas funcionalidades
            </h3>
          </div>
          {novedades.map((a) => (
            <p
              key={a.slug}
              className={`pl-8 cursor-pointer transition-colors ${activeSlug === a.slug ? "text-brand_blue" : "hover:text-brand_blue"}`}
              onClick={() => onItemClick(a.slug)}
            >
              {a.title}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

const ROTATION_RANGE = 32.5
const HALF_ROTATION_RANGE = 32.5 / 2

const TiltCard = ({
  image,
  link,
  title,
  description,
}: {
  image?: string
  title: string
  link: string
  description: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x)
  const ySpring = useSpring(y)

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return [0, 0]

    const rect = ref.current.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1
    const rY = mouseX / width - HALF_ROTATION_RANGE

    x.set(rX)
    y.set(rY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className="relative"
    >
      <Link
        to={link}
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="inset-4 grid place-content-center block group"
      >
        <section className="w-full">
          <img
            className="h-[240px] w-full object-cover rounded-2xl"
            src={image ? image : "/images/serviceDefault.png"}
            alt={title}
          />
          <h3 className="mt-4 text-2xl font-semibold group-hover:text-brand_blue transition-colors">{title}</h3>
          <p className="mb-4 mt-1 text-brand_gray">{description}</p>
          <span className="text-brand_blue font-satoMiddle underline">
            Leer artículo
          </span>
        </section>
      </Link>
    </motion.div>
  )
}
