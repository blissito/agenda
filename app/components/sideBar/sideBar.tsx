import { type User as PrismaUser } from "@prisma/client"
import { motion } from "motion/react"
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
} from "react"
import { Form, Link, useLocation } from "react-router"
import { twMerge } from "tailwind-merge"
import { Dashboard } from "~/components/icons/dashboard"
import { PrimaryButton } from "../common/primaryButton"
import { useSidebarState } from "../hooks/useSidebarState"
import { Denik } from "../icons/denik"
import { Agenda } from "../icons/menu/agenda"
import { Clients } from "../icons/menu/clients"
import { Financial } from "../icons/menu/financial"
import { Help } from "../icons/menu/help"
import { Loyalty } from "../icons/menu/loyalty"
import { Out } from "../icons/menu/out"
import { Profile } from "../icons/menu/profile"
import { Rank } from "../icons/menu/rank"
import { Services } from "../icons/menu/services"
import { Settings } from "../icons/menu/settings"
import { Website } from "../icons/menu/webiste"

export function SideBar({
  user,
  children,
  ...props
}: {
  children?: ReactNode
  user: PrismaUser
  props?: unknown
}) {
  const sidebar = useSidebarState()

  return (
    <article
      className="bg-brand_light_gray flex h-auto min-h-screen relative z-500 "
      {...props}
    >
      <motion.aside
        id="sidebar-nav"
        role="navigation"
        aria-label="Navegación principal"
        dragElastic={0.5}
        whileTap={{ cursor: "grabbing" }}
        ref={sidebar.scope}
        onDragEnd={sidebar.onDragEnd}
        dragSnapToOrigin
        drag="x"
        dragConstraints={{ right: 0, left: sidebar.config.closedX }}
        style={{ x: sidebar.x }}
        className="w-[320px] bg-white fixed rounded-e-3xl flex flex-col justify-end h-screen overflow-hidden"
      >
        <Header user={user} className="pl-6" />
        <MainMenu className="mb-auto" />
        <OnboardingBanner />
        <Footer />
      </motion.aside>
      {/* Botón toggle fuera del aside para evitar overflow-hidden */}
      <motion.button
        onClick={sidebar.toggle}
        aria-expanded={sidebar.isOpen}
        aria-controls="sidebar-nav"
        aria-label={sidebar.isOpen ? "Cerrar menú" : "Abrir menú"}
        style={{ x: sidebar.x }}
        className="h-10 w-10 rounded-full bg-white flex items-center justify-center
          hover:bg-gray-50 transition-colors fixed left-[295px] top-1/2 -translate-y-1/2 z-50
          shadow-md border border-gray-200 cursor-pointer group"
      >
        <svg
          className={twMerge(
            "w-5 h-5 text-gray-500 transition-transform duration-200 group-hover:text-brand_blue",
            sidebar.isOpen ? "rotate-180" : "rotate-0",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </motion.button>
      <motion.section
        style={{ paddingLeft: sidebar.contentPadding }}
        className="pl-[360px] lg:pr-10 pr-6 py-6 lg:py-10 w-full min-h-screen h-auto box-border "
      >
        {children}
      </motion.section>
    </article>
  )
}

const Header = ({
  className,
  user,
}: {
  className?: string
  user: Partial<PrismaUser>
}) => {
  return (
    <header className={twMerge("relative", className)}>
      <Denik className="mb-6 mt-6" />
      {user && <UserAvatar user={user} />}
      <hr className="my-4 max-w-[80%]" />
    </header>
  )
}

const Footer = () => {
  const location = useLocation()
  const match = (string: string) => location.pathname.includes(string)
  return (
    <div className="">
      <h3 className="pl-10 uppercase text-xs text-gray-300">Ajustes</h3>
      <MenuButton to="/dash/perfil" isActive={match("profile")}>
        <MenuButton.Icon isActive={match("profile")}>
          <Profile />
        </MenuButton.Icon>
        <MenuButton.Title isActive={match("profile")}>Perfil</MenuButton.Title>
      </MenuButton>
      <MenuButton>
        <MenuButton.Icon>
          <Help />
        </MenuButton.Icon>
        <MenuButton.Title>Ayuda</MenuButton.Title>
      </MenuButton>
      <Form action="/signin">
        <button
          type="submit"
          name="intent"
          value="logout"
          className="flex pl-6 gap-3 text-base pb-3 hover:text-gray-700  h-12 items-center"
        >
          <Out />
          Cerrar sesión
        </button>
      </Form>
    </div>
  )
}

const MenuButton = ({
  isActive = false,
  className,
  children,
  to = "",
  prefetch,
}: {
  to?: string
  className?: string
  isActive?: boolean
  children?: ReactNode
  prefetch?: "intent" | "render" | "none" | "viewport"
}) => {
  const sharedClassName = twMerge(
    isActive && "text-brand_blue",
    className,
    "relative h-12 flex items-center gap-3 cursor-pointer",
  )
  const content = (
    <>
      <span
        className={twMerge(
          "mr-2 w-1 h-11",
          isActive && "bg-brand_blue rounded-e-lg font-satoshi",
        )}
      />
      {children}
    </>
  )

  if (to) {
    return (
      <Link prefetch={prefetch ?? "intent"} to={to} className={sharedClassName}>
        {content}
      </Link>
    )
  }

  return <button className={sharedClassName}>{content}</button>
}

const Icon = ({
  children,
  isActive,
  ...props
}: {
  isActive?: boolean
  children?: ReactNode
}) => (
  <i {...props}>
    {isActive
      ? Children.map(children, (c) =>
          isValidElement(c)
            ? cloneElement(c as ReactElement<{ fill?: string }>, {
                fill: "#5158F6",
              })
            : c,
        )
      : children}
  </i>
)
const Title = ({
  children,
  isActive,
  ...props
}: {
  isActive?: boolean
  children?: ReactNode
}) => (
  <h3
    className={twMerge(
      "hover:opacity-70 capitalize",
      "text-base text-brand_dark",
      isActive && "text-brand_blue",
    )}
    {...props}
  >
    {children}
  </h3>
)
MenuButton.Icon = Icon
MenuButton.Title = Title

const MainMenu = ({ className }: { className?: string }) => {
  const location = useLocation()
  const match = (string: string) => location.pathname.includes(string)
  const matchIndex = (string: string = location.pathname) =>
    /^\/dash$/.test(string)

  return (
    <div className={twMerge("overflow-auto mb-auto h-full", className)}>
      <h3 className="pl-6 pb-0 uppercase text-xs text-gray-300">Tu negocio</h3>
      <section className="gri ">
        <MenuButton isActive={matchIndex()} to="/dash">
          <MenuButton.Icon isActive={matchIndex()}>
            <Dashboard />
          </MenuButton.Icon>
          <MenuButton.Title isActive={matchIndex()}>Dashboard</MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/agenda" isActive={match("agenda")}>
          <MenuButton.Icon isActive={match("agenda")}>
            <Agenda />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("agenda")}>Agenda</MenuButton.Title>
        </MenuButton>
        <MenuButton
          to="/dash/website"
          isActive={match("website")}
          prefetch="render" // @todo is this necessary?
        >
          <MenuButton.Icon isActive={match("website")}>
            <Website />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("website")}>
            Sitio web
          </MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/servicios" isActive={match("servicios")}>
          <MenuButton.Icon isActive={match("servicios")}>
            <Services />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("servicios")}>
            Servicios
          </MenuButton.Title>
        </MenuButton>
        <NavButton pathname="pagos" icon={<Financial />} />
        <NavButton pathname="clientes" />
        <MenuButton to="/dash/lealtad" isActive={match("lealtad")}>
          <MenuButton.Icon isActive={match("lealtad")}>
            <Loyalty />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("lealtad")}>
            Lealtad
          </MenuButton.Title>
        </MenuButton>
        <NavButton pathname="evaluaciones" icon={<Rank />} />
        <NavButton pathname="ajustes" icon={<Settings />} />
      </section>
    </div>
  )
}

const NavButton = ({
  pathname,
  icon,
}: {
  icon?: ReactNode
  pathname: string
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const match = (string: string) => location.pathname.includes(string)
  useEffect(() => {
    if (match(pathname) && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [match, pathname])
  return (
    <div ref={ref}>
      <MenuButton to={`/dash/${pathname}`} isActive={match(pathname)}>
        <MenuButton.Icon isActive={match(pathname)}>
          {icon || <Clients />}
        </MenuButton.Icon>
        <MenuButton.Title isActive={match(pathname)}>
          {pathname}
        </MenuButton.Title>
      </MenuButton>
    </div>
  )
}

const UserAvatar = ({ user }: { user: Partial<PrismaUser> }) => (
  <div className="flex  text-brand_dark">
    <img
      className={twMerge(
        "w-12 h-12 object-cover border-2 border-brand_blue rounded-full mr-2",
      )}
      alt="avatar"
      src={user.photoURL ?? "https://loremflickr.com/640/480?lock=1234"}
      onError={(e) => {
        ;(e.target as HTMLImageElement).src =
          "https://loremflickr.com/640/480?lock=1234"
      }}
    />
    <div className="grid">
      <p className="text-lg font-satoMiddle mb-0">{user.displayName}</p>
      <p className="text-gray-400 font-thin -mt-1">{user.email}</p>
    </div>
  </div>
)

const OnboardingBanner = () => {
  return (
    <section className="bg-onboarding  pb-4 rounded-2xl bg-cover mx-6 mb-4 relative">
      <div className="mt-12 px-4 text-white">
        <h3 className="text-sm">
          ¡Ya casi terminas de <br /> configurar tu agenda!
        </h3>
        <PrimaryButton
          className="min-w-[80px] max-w-[80px] text-sm h-8 px-3  mt-4 bg-white text-brand_dark"
          as="Link"
          to={"/dash/onboarding"}
          prefetch="render"
        >
          Continuar
        </PrimaryButton>
      </div>
    </section>
  )
}
