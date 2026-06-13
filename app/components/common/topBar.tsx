import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"
import { FORMMY_WAITLIST_URL } from "~/utils/urls"
import { ArrowRight } from "../icons/arrowRight"
import { Denik } from "../icons/denik"
import { PrimaryButton } from "./primaryButton"

type NavLink = { to: string; label: string }
// `href` (link externo) tiene prioridad sobre `to` (link interno)
type Cta = { to?: string; href?: string; label: string }

const NAV_LINKS: NavLink[] = [
  { to: "/funcionalidades", label: "Funcionalidades" },
  { to: "/ia", label: "IA✨" },
  { to: "/negocios", label: "Negocios" },
  { to: "/planes", label: "Planes" },
  { to: "/blog", label: "Blog" },
]

const DEFAULT_CTA: Cta = { href: FORMMY_WAITLIST_URL, label: "Aparta tu lugar" }

// Renderiza el CTA como link externo (formmy) o interno (react-router) según props
const CtaButton = ({ cta, className }: { cta: Cta; className?: string }) =>
  cta.href ? (
    <PrimaryButton
      as="a"
      href={cta.href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {cta.label} <ArrowRight />
    </PrimaryButton>
  ) : (
    <PrimaryButton as="Link" to={cta.to ?? "/"} className={className}>
      {cta.label} <ArrowRight />
    </PrimaryButton>
  )

// Subrayado dibujado a mano para el link activo
const ActiveUnderline = () => (
  <svg
    viewBox="0 0 100 12"
    preserveAspectRatio="none"
    aria-hidden="true"
    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/5 h-2 text-brand_blue"
  >
    <path
      d="M2 7 Q 25 2, 50 6 T 98 5"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      className="animate-underline-draw"
    />
  </svg>
)

export const TopBar = ({
  withBanner = false,
  navLinks = NAV_LINKS,
  cta = DEFAULT_CTA,
}: {
  withBanner?: boolean
  navLinks?: NavLink[]
  cta?: Cta
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <section className="fixed flex justify-center w-full z-40 px-4 md:px-8">
      <article
        className={`border bg-white/40 backdrop-blur-xl backdrop-saturate-150 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex items-center h-16 md:h-20 max-w-6xl w-full rounded-full mx-auto ${
          withBanner ? "mt-12 md:mt-14" : "mt-4 md:mt-8"
        } pl-4 md:pl-8 pr-4 justify-between relative`}
      >
        <Link to="/">
          <Denik className="w-[88px] md:w-[96px]" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-brand_dark">
          {navLinks.map((link) => {
            const active =
              location.pathname === link.to ||
              location.pathname.startsWith(`${link.to}/`)
            return (
              <Link key={link.to} to={link.to}>
                <p
                  className={`relative inline-block font-satoshi font-medium hover:text-brand_blue transition-colors ${
                    active ? "text-brand_blue" : ""
                  }`}
                >
                  {link.label}
                  {active && <ActiveUnderline />}
                </p>
              </Link>
            )
          })}
          <CtaButton cta={cta} />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menú"
        >
          <span
            className={`block w-6 h-0.5 bg-brand_dark transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-brand_dark transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-brand_dark transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </article>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`md:hidden absolute ${
            withBanner ? "top-36" : "top-28"
          } left-4 right-4 bg-white/95 backdrop-blur-lg border border-brand_pale rounded-2xl shadow-lg p-6 flex flex-col gap-4`}
        >
          {navLinks.map((link) => {
            const active =
              location.pathname === link.to ||
              location.pathname.startsWith(`${link.to}/`)
            return (
              <Link key={link.to} to={link.to}>
                <p
                  className={`relative inline-block font-satoshi font-medium text-lg py-2 hover:text-brand_blue transition-colors ${
                    active ? "text-brand_blue" : "text-brand_dark"
                  }`}
                >
                  {link.label}
                  {active && <ActiveUnderline />}
                </p>
              </Link>
            )
          })}
          <CtaButton cta={cta} className="mt-2" />
        </div>
      )}
    </section>
  )
}
