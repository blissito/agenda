import { useState } from "react"
import { Link, useLocation } from "react-router"
import { useEffect } from "react"
import { ArrowRight } from "../icons/arrowRight"
import { Denik } from "../icons/denik"
import { PrimaryButton } from "./primaryButton"

const NAV_LINKS = [
  { to: "/funcionalidades", label: "Funcionalidades" },
  { to: "/negocios", label: "Negocios" },
  { to: "/planes", label: "Planes" },
]

export const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <section className="fixed flex justify-center w-full z-50 px-4 md:px-8">
      <article className="border bg-white/40 backdrop-blur-xl backdrop-saturate-150 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex items-center h-20 max-w-6xl w-full rounded-full mx-auto mt-4 md:mt-8 pl-4 md:pl-8 pr-4 justify-between relative">
        <Link to="/">
          <Denik className="w-[96px]" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-brand_dark">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              <p className="font-satoshi font-medium hover:text-brand_blue transition-colors">
                {link.label}
              </p>
            </Link>
          ))}
          <PrimaryButton as="Link" to="/signin">
            Únete <ArrowRight />
          </PrimaryButton>
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
        <div className="md:hidden absolute top-24 left-4 right-4 bg-white/95 backdrop-blur-lg border border-brand_pale rounded-2xl shadow-lg p-6 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              <p className="font-satoshi font-medium text-brand_dark text-lg py-2 hover:text-brand_blue transition-colors">
                {link.label}
              </p>
            </Link>
          ))}
          <PrimaryButton as="Link" to="/signin" className="mt-2">
            Únete <ArrowRight />
          </PrimaryButton>
        </div>
      )}
    </section>
  )
}
