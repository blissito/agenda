import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react"
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { FeaturesList } from "~/components/icons/cathegories/featuresList"
import { Graduate } from "~/components/icons/cathegories/graduate"
import { HelpIcon } from "~/components/icons/help"

const ARTICLES = [
  {
    slug: "configurar-agenda",
    title: "Como configurar tu agenda",
    description:
      "Aprende a configurar tu agenda de citas desde cero: horarios, servicios, colaboradores y mas.",
    image: "https://i.imgur.com/DXNLhab.png",
    category: "aprendizaje",
  },
  {
    slug: "novedades",
    title: "Lo nuevo en Denik",
    description:
      "Descubre las ultimas funcionalidades y mejoras que hemos lanzado en la plataforma.",
    image: "https://i.imgur.com/G2GZLMm.png",
    category: "novedades",
  },
  {
    slug: "crear-cuenta",
    title: "Como crear una cuenta",
    description:
      "Guia paso a paso para registrarte y crear tu cuenta de negocio en Denik.",
    image: "https://i.imgur.com/PSDVeEC.png",
    category: "aprendizaje",
  },
  {
    slug: "cambiar-plan",
    title: "Como cambiar tu plan",
    description:
      "Conoce como actualizar, cambiar o cancelar tu plan de suscripcion en cualquier momento.",
    image: "/images/illustrations/blog/cel.svg",
    category: "aprendizaje",
  },
  {
    slug: "template-agenda",
    title: "Como cambiar el template de tu agenda",
    description:
      "Personaliza la apariencia de tu pagina de reservaciones con los templates disponibles.",
    image: "https://i.imgur.com/DXNLhab.png",
    category: "aprendizaje",
  },
  {
    slug: "programa-lealtad",
    title: "Programa de lealtad",
    description:
      "Configura puntos, niveles y recompensas para fidelizar a tus clientes.",
    image: "https://i.imgur.com/G2GZLMm.png",
    category: "novedades",
  },
  {
    slug: "denik-link",
    title: "Denik link",
    description:
      "Comparte tu link de reservaciones en redes sociales y permite que tus clientes agenden facilmente.",
    image: "https://i.imgur.com/PSDVeEC.png",
    category: "novedades",
  },
  {
    slug: "landing-ia",
    title: "Genera tu landing page con IA",
    description:
      "Usa inteligencia artificial para crear una pagina web profesional para tu negocio en minutos.",
    image: "/images/illustrations/blog/cel.svg",
    category: "novedades",
  },
]

export default function Help() {
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
    let results = ARTICLES
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
  }, [search, activeSlug])

  const handleSidebarClick = (slug: string) => {
    setActiveSlug((prev) => (prev === slug ? null : slug))
  }

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] pb-[120px]">
        <TopBar />

        <div className="grid grid-cols-1 lg:grid-cols-8 max-w-[90%] xl:max-w-7xl mx-auto gap-12 pt-[240px]">
          {/* Sidebar */}
          <Catalogue search={search} setSearch={setSearch} activeSlug={activeSlug} onItemClick={handleSidebarClick} />

          {/* Main content */}
          <Content filtered={filtered} search={search} />
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
  filtered: typeof ARTICLES
  search: string
}) => {
  return (
    <section className="lg:col-span-6">
      <h2 className="group text-4xl lg:text-6xl font-satoBold text-brand_dark leading-tight flex flex-wrap items-center justify-start">
        <span className="mr-4">Ayuda,</span>
        <HelpIcon className="group-hover:animate-vibration-effect cursor-pointer w-10 h-10 lg:w-14 lg:h-14" />
        <span className="ml-4 mr-4">recursos</span> y soporte
      </h2>
      <p className="mt-6 text-brand_gray text-lg">
        Encuentre las respuestas que necesita para aprovechar todo el potencial
        de Deník e impulsa las ventas de tu negocio. Chatea con nuestro equipo
        o envia un correo electronico a{" "}
        <a href="mailto:hola@denik.me" className="text-brand_blue underline">
          hola@denik.me
        </a>
      </p>

      {/* Articles */}
      <div className="mt-16">
        <h3 className="text-2xl lg:text-3xl font-satoBold text-brand_dark border-b border-brand_pale pb-4">
          Documentos de ayuda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-10 gap-12">
          {filtered.map((article) => (
            <TiltCard
              key={article.slug}
              title={article.title}
              link={`/help/${article.slug}`}
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
  search,
  setSearch,
  activeSlug,
  onItemClick,
}: {
  search: string
  setSearch: (v: string) => void
  activeSlug: string | null
  onItemClick: (slug: string) => void
}) => {
  const aprendizaje = ARTICLES.filter((a) => a.category === "aprendizaje")
  const novedades = ARTICLES.filter((a) => a.category === "novedades")

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
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="inset-4 grid place-content-center"
      >
        <section className="w-full">
          <img
            className="h-[240px] w-full object-cover rounded-2xl"
            src={image ? image : "/images/serviceDefault.png"}
            alt={title}
          />
          <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
          <p className="mb-4 mt-1 text-brand_gray">{description}</p>
          <span className="text-brand_blue font-satoMiddle underline">
            Leer articulo
          </span>
        </section>
      </div>
    </motion.div>
  )
}
