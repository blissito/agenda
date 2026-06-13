import { type User as PrismaUser } from "@prisma/client"
import { AnimatePresence, motion, type Transition } from "motion/react"
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { Form, Link, useFetcher, useLocation } from "react-router"
import { twMerge } from "tailwind-merge"
import { getPublicImageUrl } from "~/utils/urls"
import { useOutsideClick } from "../hooks/useOutsideClick"

// Tracks whether the user has finished onboarding. La verdad la calcula
// `dash_layout` en el servidor: celebrado O (visitó sitio + compartió link +
// ≥1 servicio), todo en DB (no localStorage), y se pasa como prop.
// Escuchamos también el evento `onboarding:celebrated` para reaccionar de
// inmediato en la misma pestaña que terminó el flujo (antes de revalidate).
const useOnboardingCelebrated = (initial: boolean) => {
  const [celebrated, setCelebrated] = useState(initial)
  useEffect(() => {
    if (initial) {
      setCelebrated(true)
      return
    }
    const handler = () => setCelebrated(true)
    window.addEventListener("onboarding:celebrated", handler)
    return () => window.removeEventListener("onboarding:celebrated", handler)
  }, [initial])
  return celebrated
}

// Chevron animado con dos líneas que rotan desde el vértice
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => {
  const transition: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 20,
  }

  return (
    <motion.svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      animate={{ scaleX: isOpen ? 1 : -1 }}
      transition={transition}
    >
      {/* Línea superior: del vértice (10,12) hacia arriba-derecha */}
      <motion.line
        x1="10"
        y1="12"
        x2="15"
        y2="7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Línea inferior: del vértice (10,12) hacia abajo-derecha */}
      <motion.line
        x1="10"
        y1="12"
        x2="15"
        y2="17"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </motion.svg>
  )
}

import { Dashboard } from "~/components/icons/dashboard"
import { PrimaryButton } from "../common/primaryButton"
import { useSidebarState } from "../hooks/useSidebarState"
import { Denik } from "../icons/denik"
import { Agenda } from "../icons/menu/agenda"
import { Asistente } from "../icons/menu/asistente"
import { Chatbot } from "../icons/menu/chatbot"
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

export type OrgLite = {
  id: string
  name: string | null
  logo: string | null
  slug?: string | null
}

export type BranchLite = {
  id: string
  name: string
  slug: string
  isActive: boolean
  isDefault: boolean
}

// Estado colapsado del sidebar (rail de iconos). Lo consumen MenuButton, Title,
// Header, Footer y las cards inferiores para alternar entre layout completo y
// rail sin tener que prop-drillear en cada call-site.
const CollapsedContext = createContext(false)
const useCollapsed = () => useContext(CollapsedContext)

// Sucursales de la org activa + sede activa. Lo consume OrgSwitcher (que se
// renderiza en Header y en MobileBottomNav) sin prop-drilling.
const BranchesContext = createContext<{
  branches: BranchLite[]
  activeBranchId: string | null
}>({ branches: [], activeBranchId: null })
const useBranches = () => useContext(BranchesContext)

export function SideBar({
  user,
  orgs = [],
  activeOrg = null,
  branches = [],
  activeBranchId = null,
  canManage = true,
  onboardingCelebrated = false,
  sidebarOpen = true,
  hideMobileNav = false,
  fullBleedMobile = false,
  children,
  ...props
}: {
  children?: ReactNode
  user: PrismaUser
  orgs?: OrgLite[]
  activeOrg?: OrgLite | null
  branches?: BranchLite[]
  activeBranchId?: string | null
  canManage?: boolean
  onboardingCelebrated?: boolean
  sidebarOpen?: boolean
  hideMobileNav?: boolean
  fullBleedMobile?: boolean
  props?: unknown
}) {
  const sidebar = useSidebarState(sidebarOpen)
  const { collapsed, config } = sidebar
  const transition = config.spring

  return (
    <BranchesContext.Provider value={{ branches, activeBranchId }}>
      <CollapsedContext.Provider value={collapsed}>
        <article
          className="bg-brand_light_gray flex h-auto min-h-screen relative z-500 "
          {...props}
        >
          <motion.aside
            id="sidebar-nav"
            role="navigation"
            aria-label="Navegación principal"
            initial={false}
            animate={{
              width: collapsed ? config.width.rail : config.width.open,
            }}
            transition={transition}
            className="hidden md:flex bg-white fixed rounded-e-3xl flex-col justify-end h-screen overflow-hidden"
          >
            <Header user={user} org={activeOrg} orgs={orgs} />
            <MainMenu className="mb-auto" canManage={canManage} />
            <SidebarBottomCards onboardingCelebrated={onboardingCelebrated} />
            <Footer />
          </motion.aside>
          {/* Botón toggle fuera del aside para evitar overflow-hidden */}
          <motion.button
            onClick={sidebar.toggle}
            aria-expanded={sidebar.isOpen}
            aria-controls="sidebar-nav"
            aria-label={sidebar.isOpen ? "Colapsar menú" : "Expandir menú"}
            initial={false}
            animate={{
              left: (collapsed ? config.width.rail : config.width.open) - 25,
            }}
            transition={transition}
            className="hidden md:flex h-10 w-10 rounded-full bg-white items-center justify-center
            hover:bg-gray-50 transition-colors fixed top-1/2 -translate-y-1/2 z-50
            shadow-md border border-gray-200 cursor-pointer group"
          >
            <span className="text-gray-500 group-hover:text-brand_blue transition-colors">
              <ChevronIcon isOpen={sidebar.isOpen} />
            </span>
            {/* Tooltip */}
            <span
              className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded
              opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
            >
              {sidebar.isOpen ? "Colapsar menú" : "Expandir menú"}
              <kbd className="ml-1 px-1 bg-gray-700 rounded text-[10px]">
                ⌘B
              </kbd>
            </span>
          </motion.button>
          <motion.section
            initial={false}
            animate={{
              paddingLeft: collapsed
                ? config.content.rail
                : config.content.open,
            }}
            transition={transition}
            className={`dash-content md:pr-6 lg:pr-10 md:pt-6 lg:pt-10 md:pb-6 lg:pb-10 w-full min-h-screen h-auto box-border ${
              fullBleedMobile
                ? // Chat full screen: sin padding en mobile (pl con ! para ganarle
                  // al paddingLeft inline animado del offset del sidebar).
                  "max-md:!pl-0 max-md:!pr-0 max-md:!pt-0 max-md:!pb-0"
                : hideMobileNav
                  ? // Sin bottom bar pero con padding normal de página en mobile.
                    "max-md:!pl-4 max-md:pr-4 max-md:pt-6 max-md:pb-6"
                  : // Default: reserva espacio (88px) para la bottom bar.
                    "max-md:!pl-4 max-md:pr-4 max-md:pt-6 max-md:pb-[88px]"
            }`}
          >
            {children}
          </motion.section>
          {!hideMobileNav && !fullBleedMobile && (
            <MobileBottomNav
              user={user}
              org={activeOrg}
              orgs={orgs}
              canManage={canManage}
              onboardingCelebrated={onboardingCelebrated}
            />
          )}
        </article>
      </CollapsedContext.Provider>
    </BranchesContext.Provider>
  )
}

const Header = ({
  className,
  user,
  org,
  orgs = [],
}: {
  className?: string
  user: Partial<PrismaUser>
  org?: OrgLite | null
  orgs?: OrgLite[]
}) => {
  const collapsed = useCollapsed()

  if (collapsed) {
    return (
      <header className="relative flex flex-col items-center gap-3 pt-6 pb-1">
        <img src="/images/isotipo.svg" alt="Denik" className="w-9 h-9" />
        {org ? (
          <OrgSwitcher org={org} orgs={orgs} />
        ) : (
          user && <OrgLogoFallbackAvatar user={user} />
        )}
        <hr className="w-8 my-1" />
      </header>
    )
  }

  return (
    <header className={twMerge("relative pl-6", className)}>
      <Denik className="mb-6 mt-6" />
      {org ? (
        <OrgSwitcher org={org} orgs={orgs} />
      ) : (
        user && <UserAvatar user={user} />
      )}
      <hr className="my-4 max-w-[80%]" />
    </header>
  )
}

// Avatar compacto (solo imagen, sin nombre/email) para el header del rail
const OrgLogoFallbackAvatar = ({ user }: { user: Partial<PrismaUser> }) => (
  <img
    className="w-9 h-9 object-cover rounded-full"
    alt="avatar"
    src={user.photoURL ?? "https://loremflickr.com/640/480?lock=1234"}
    onError={(e) => {
      ;(e.target as HTMLImageElement).src =
        "https://loremflickr.com/640/480?lock=1234"
    }}
  />
)

const Footer = () => {
  const location = useLocation()
  const match = (string: string) => location.pathname.includes(string)
  const collapsed = useCollapsed()
  return (
    <div className="">
      {!collapsed && (
        <h3 className="pl-10 uppercase text-xs text-gray-300">Ajustes</h3>
      )}
      <MenuButton to="/dash/perfil" isActive={match("profile")}>
        <MenuButton.Icon isActive={match("profile")}>
          <Profile />
        </MenuButton.Icon>
        <MenuButton.Title isActive={match("profile")}>Perfil</MenuButton.Title>
      </MenuButton>
      <a
        href="/blog"
        target="_blank"
        rel="noopener noreferrer"
        title="Ayuda"
        className={twMerge(
          "relative h-12 flex items-center gap-3 cursor-pointer",
          collapsed && "justify-center",
        )}
      >
        <span className={twMerge("mr-2 w-1 h-11", collapsed && "hidden")} />
        <MenuButton.Icon>
          <Help />
        </MenuButton.Icon>
        <MenuButton.Title>Ayuda</MenuButton.Title>
      </a>
      <Form action="/signin">
        <button
          type="submit"
          name="intent"
          value="logout"
          title="Cerrar sesión"
          className={twMerge(
            "flex gap-3 text-base pb-3 hover:text-gray-700 h-12 items-center",
            collapsed ? "justify-center w-full" : "pl-6",
          )}
        >
          <Out />
          {!collapsed && "Cerrar sesión"}
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
  const collapsed = useCollapsed()
  const sharedClassName = twMerge(
    isActive && "text-brand_blue",
    "relative h-12 flex items-center gap-3 cursor-pointer",
    collapsed && "justify-center",
    className,
  )
  const content = (
    <>
      <span
        className={twMerge(
          "mr-2 w-1 h-11",
          collapsed && "hidden",
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
}) => {
  const collapsed = useCollapsed()
  if (collapsed) return null
  return (
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
}
MenuButton.Icon = Icon
MenuButton.Title = Title

const MainMenu = ({
  className,
  canManage = true,
}: {
  className?: string
  canManage?: boolean
}) => {
  const location = useLocation()
  const match = (string: string) => location.pathname.includes(string)
  const matchIndex = (string: string = location.pathname) =>
    /^\/dash$/.test(string)
  const collapsed = useCollapsed()
  const { branches } = useBranches()
  // Con >1 sucursal mostramos los labels Sede/Negocio (misma lista, sin ocultar
  // nada). Con una sola sede el menú queda como siempre ("Tu negocio").
  const grouped = branches.length > 1

  const GroupLabel = ({
    children,
    className: cn,
  }: {
    children: ReactNode
    className?: string
  }) =>
    collapsed ? null : (
      <h3
        className={twMerge(
          "pl-6 pb-0 uppercase text-xs text-gray-300",
          cn,
        )}
      >
        {children}
      </h3>
    )

  return (
    <div className={twMerge("overflow-auto mb-auto h-full", className)}>
      <section className="gri ">
        <GroupLabel>{grouped ? "Sede" : "Tu negocio"}</GroupLabel>
        {/* En agrupado, Asistente IA vive en "Negocio"; en plano va primero. */}
        {!grouped && canManage && (
          <MenuButton to="/dash/asistente" isActive={match("asistente")}>
            <MenuButton.Icon isActive={match("asistente")}>
              <Asistente />
            </MenuButton.Icon>
            <MenuButton.Title isActive={match("asistente")}>
              Asistente IA
            </MenuButton.Title>
          </MenuButton>
        )}
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
        {/* Web/Chatbot solo van aquí (entre los items operativos) en modo plano.
            Sitio web es visible para todos (members lo ven en solo-lectura). */}
        {!grouped && (
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
        )}
        {!grouped && (
          <MenuButton to="/dash/chatbot" isActive={match("chatbot")}>
            <MenuButton.Icon isActive={match("chatbot")}>
              <Chatbot />
            </MenuButton.Icon>
            <MenuButton.Title isActive={match("chatbot")}>
              Chatbot IA
            </MenuButton.Title>
          </MenuButton>
        )}
        {canManage && (
          <MenuButton to="/dash/servicios" isActive={match("servicios")}>
            <MenuButton.Icon isActive={match("servicios")}>
              <Services />
            </MenuButton.Icon>
            <MenuButton.Title isActive={match("servicios")}>
              Servicios
            </MenuButton.Title>
          </MenuButton>
        )}
        {canManage && <NavButton pathname="ventas" icon={<Financial />} />}
        <NavButton pathname="clientes" />
        {/* En plano, Lealtad va aquí; en agrupado se mueve a "Negocio". */}
        {!grouped && (
          <MenuButton to="/dash/lealtad" isActive={match("lealtad")}>
            <MenuButton.Icon isActive={match("lealtad")}>
              <Loyalty />
            </MenuButton.Icon>
            <MenuButton.Title isActive={match("lealtad")}>
              Lealtad
            </MenuButton.Title>
          </MenuButton>
        )}
        <NavButton pathname="evaluaciones" icon={<Rank />} />

        {/* ===== Sección Negocio (solo en agrupado) ===== */}
        {grouped && (
          <>
            <GroupLabel className="pt-4">Negocio</GroupLabel>
            {canManage && (
              <MenuButton to="/dash/asistente" isActive={match("asistente")}>
                <MenuButton.Icon isActive={match("asistente")}>
                  <Asistente />
                </MenuButton.Icon>
                <MenuButton.Title isActive={match("asistente")}>
                  Asistente IA
                </MenuButton.Title>
              </MenuButton>
            )}
            <MenuButton
              to="/dash/website"
              isActive={match("website")}
              prefetch="render"
            >
              <MenuButton.Icon isActive={match("website")}>
                <Website />
              </MenuButton.Icon>
              <MenuButton.Title isActive={match("website")}>
                Sitio web
              </MenuButton.Title>
            </MenuButton>
            <MenuButton to="/dash/chatbot" isActive={match("chatbot")}>
              <MenuButton.Icon isActive={match("chatbot")}>
                <Chatbot />
              </MenuButton.Icon>
              <MenuButton.Title isActive={match("chatbot")}>
                Chatbot IA
              </MenuButton.Title>
            </MenuButton>
            <MenuButton to="/dash/lealtad" isActive={match("lealtad")}>
              <MenuButton.Icon isActive={match("lealtad")}>
                <Loyalty />
              </MenuButton.Icon>
              <MenuButton.Title isActive={match("lealtad")}>
                Lealtad
              </MenuButton.Title>
            </MenuButton>
          </>
        )}

        {canManage && <NavButton pathname="ajustes" icon={<Settings />} />}
      </section>
    </div>
  )
}

const NavButton = ({
  pathname,
  icon,
  label,
}: {
  icon?: ReactNode
  pathname: string
  label?: string
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
          {label || pathname}
        </MenuButton.Title>
      </MenuButton>
    </div>
  )
}

const UserAvatar = ({ user }: { user: Partial<PrismaUser> }) => (
  <div className="flex  text-brand_dark">
    <img
      className={twMerge("w-12 h-12 object-cover rounded-full mr-2")}
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

const ORG_LOGO_FALLBACK = "/images/avatar.svg"

const OrgLogo = ({
  org,
  size = "md",
}: {
  org: OrgLite
  size?: "sm" | "md"
}) => {
  const [error, setError] = useState(false)
  const dim = size === "sm" ? "w-9 h-9" : "w-12 h-12"
  const src = (!error && getPublicImageUrl(org.logo)) || ORG_LOGO_FALLBACK
  return (
    <img
      className={twMerge("object-cover rounded-full shrink-0", dim)}
      alt={org.name ?? "Organización"}
      src={src}
      onError={() => setError(true)}
    />
  )
}

// Dos chevrons (arriba/abajo) tipo selector
const UpDownArrows = ({ className }: { className?: string }) => (
  <svg
    className={twMerge("w-4 h-4 shrink-0 text-gray-400", className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 9l4-4 4 4" />
    <path d="M16 15l-4 4-4-4" />
  </svg>
)

const PinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 21s-6-5.686-6-10a6 6 0 0 1 12 0c0 4.314-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
)

// Bloque de la org activa + popup para cambiar entre las orgs del usuario.
// El popup se renderiza con createPortal a document.body para no ser clippeado
// por el `overflow-hidden` del aside (mismo patrón que DropDownMenu).
const OrgSwitcher = ({
  org,
  orgs,
  forceExpanded = false,
}: {
  org: OrgLite
  orgs: OrgLite[]
  // El bottom sheet de mobile siempre va expandido; ignora el estado colapsado
  // del sidebar de desktop (que viene del CollapsedContext).
  forceExpanded?: boolean
}) => {
  const { branches, activeBranchId } = useBranches()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const fetcher = useFetcher()
  const collapsed = useCollapsed() && !forceExpanded
  const panelRef = useOutsideClick<HTMLDivElement>({
    isActive: open,
    onClickOutside: () => setOpen(false),
    keyboardListener: true,
  })
  const others = orgs.filter((o) => o.id !== org.id)
  const activeBranch = branches.find((b) => b.id === activeBranchId)
  const scopeLabel =
    branches.length > 1
      ? activeBranch
        ? activeBranch.name
        : "Todas las sucursales"
      : null

  useEffect(() => {
    if (!open || !btnRef.current) return
    const update = () => {
      if (!btnRef.current) return
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: r.left, width: r.width })
    }
    update()
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? org.name || "Mi organización" : undefined}
        className={twMerge(
          "flex items-center gap-2 text-left text-brand_dark rounded-xl hover:bg-brand_blue/5 transition-colors py-1",
          collapsed ? "justify-center px-0" : "w-[85%] pr-2",
        )}
      >
        <OrgLogo org={org} size={collapsed ? "sm" : "md"} />
        {!collapsed && (
          <>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="text-lg font-satoMiddle truncate leading-tight">
                {org.name || "Mi organización"}
              </span>
              {scopeLabel && (
                <span className="text-xs text-brand_gray truncate leading-tight">
                  {scopeLabel}
                </span>
              )}
            </span>
            <UpDownArrows />
          </>
        )}
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={panelRef}
                role="menu"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  width: Math.max(pos.width, 240),
                }}
                className="z-[600] bg-white shadow-lg rounded-2xl p-2 flex flex-col gap-1 max-h-[60vh] overflow-auto"
              >
                {others.length > 0 && (
                  <>
                    <p className="px-3 pt-1 pb-0.5 text-[11px] uppercase tracking-wide text-gray-300">
                      Cambiar organización
                    </p>
                    {others.map((o) => (
                      <fetcher.Form
                        method="post"
                        action="/api/switch-org"
                        key={o.id}
                        onSubmit={() => setOpen(false)}
                      >
                        <input type="hidden" name="orgId" value={o.id} />
                        <button
                          type="submit"
                          role="menuitem"
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-brand_blue/5 transition-colors text-left"
                        >
                          <OrgLogo org={o} size="sm" />
                          <span className="text-sm text-brand_dark truncate">
                            {o.name || "Organización"}
                          </span>
                        </button>
                      </fetcher.Form>
                    ))}
                  </>
                )}

                {branches.length > 1 && (
                  <>
                    {others.length > 0 && (
                      <hr className="my-1 border-gray-100" />
                    )}
                    <p className="px-3 pt-1 pb-0.5 text-[11px] uppercase tracking-wide text-gray-300">
                      Sucursales
                    </p>
                    <fetcher.Form
                      method="post"
                      action="/api/switch-branch"
                      onSubmit={() => setOpen(false)}
                    >
                      <input type="hidden" name="branchId" value="all" />
                      <button
                        type="submit"
                        role="menuitemradio"
                        aria-checked={activeBranchId === null}
                        className={twMerge(
                          "w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-brand_blue/5 transition-colors text-left",
                          activeBranchId === null && "bg-brand_blue/5",
                        )}
                      >
                        <OrgLogo org={org} size="sm" />
                        <span className="text-sm text-brand_dark truncate flex-1 min-w-0">
                          {org.name || "Mi organización"}
                        </span>
                        {activeBranchId === null && (
                          <CheckIcon className="w-4 h-4 shrink-0 text-brand_blue" />
                        )}
                      </button>
                    </fetcher.Form>
                    {branches.map((b) => {
                      const isActive = b.id === activeBranchId
                      return (
                        <fetcher.Form
                          method="post"
                          action="/api/switch-branch"
                          key={b.id}
                          onSubmit={() => setOpen(false)}
                        >
                          <input type="hidden" name="branchId" value={b.id} />
                          <button
                            type="submit"
                            role="menuitemradio"
                            aria-checked={isActive}
                            className={twMerge(
                              "w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-brand_blue/5 transition-colors text-left",
                              isActive && "bg-brand_blue/5",
                            )}
                          >
                            <PinIcon className="w-4 h-4 shrink-0 text-brand_gray" />
                            <span className="text-sm text-brand_dark truncate flex-1 min-w-0">
                              {b.name}
                              {!b.isActive && (
                                <span className="text-brand_gray">
                                  {" "}
                                  (inactiva)
                                </span>
                              )}
                            </span>
                            {isActive && (
                              <CheckIcon className="w-4 h-4 shrink-0 text-brand_blue" />
                            )}
                          </button>
                        </fetcher.Form>
                      )
                    })}
                  </>
                )}

                {(others.length > 0 || branches.length > 1) && (
                  <hr className="my-1 border-gray-100" />
                )}
                <Link
                  to="/dash/sucursales/nueva"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-brand_blue/5 transition-colors text-left text-brand_dark"
                >
                  <PlusIcon className="w-4 h-4 shrink-0 text-brand_blue" />
                  <span className="text-sm">Crear sucursal</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

type PendingAttendanceEvent = {
  id: string
  start: string
  customerName: string
  serviceName: string
}

// Wrapper que decide qué card mostrar en la parte baja del sidebar.
// Prioridad: si hay citas pendientes de marcar asistencia → solo esa card.
// Si no hay y el onboarding aún no se completó → banner de onboarding.
// Si no hay nada que hacer → null. Solo una de las dos a la vez (no apiladas).
const SidebarBottomCards = ({
  onboardingCelebrated,
}: {
  onboardingCelebrated: boolean
}) => {
  const listFetcher = useFetcher<{ events: PendingAttendanceEvent[] }>()
  const markFetcher = useFetcher()
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())
  const celebrated = useOnboardingCelebrated(onboardingCelebrated)
  const collapsed = useCollapsed()

  useEffect(() => {
    if (listFetcher.state === "idle" && listFetcher.data === undefined) {
      listFetcher.load("/api/events?intent=pending_attendance")
    }
  }, [listFetcher])

  // Recarga la lista cuando termina un submit de marca de asistencia.
  const lastSubmitState = useRef(markFetcher.state)
  useEffect(() => {
    if (lastSubmitState.current !== "idle" && markFetcher.state === "idle") {
      listFetcher.load("/api/events?intent=pending_attendance")
    }
    lastSubmitState.current = markFetcher.state
  }, [markFetcher.state, listFetcher])

  const events = (listFetcher.data?.events ?? []).filter(
    (e) => !hiddenIds.has(e.id),
  )

  const mark = (eventId: string, attended: boolean) => {
    setHiddenIds((s) => new Set(s).add(eventId))
    const fd = new FormData()
    fd.set("eventId", eventId)
    fd.set("attended", String(attended))
    markFetcher.submit(fd, {
      method: "post",
      action: "/api/events?intent=mark_attendance",
    })
  }

  // En rail no hay ancho para las cards; se ocultan hasta expandir.
  if (collapsed) return null
  if (events.length > 0) {
    return <PendingAttendanceCard events={events} onMark={mark} />
  }
  if (!celebrated) return <OnboardingBanner />
  return null
}

const PendingAttendanceCard = ({
  events,
  onMark,
}: {
  events: PendingAttendanceEvent[]
  onMark: (eventId: string, attended: boolean) => void
}) => {
  const visible = events.slice(0, 3)
  const overflow = events.length - visible.length

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <section className="bg-white border border-brand_stroke rounded-2xl mx-6 mb-4 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-satoBold text-brand_dark">
          Confirma asistencias
        </h3>
        <span className="text-[11px] text-brand_gray bg-brand_stroke rounded-full px-2 py-0.5">
          {events.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map((e) => (
          <li key={e.id} className="text-xs">
            <div className="text-brand_dark font-satoMedium truncate">
              {e.customerName}
            </div>
            <div className="text-brand_gray truncate">
              {e.serviceName} · {formatDate(e.start)}
            </div>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => onMark(e.id, false)}
                className="flex-1 text-[11px] py-1 rounded-full border border-brand_stroke text-brand_gray hover:bg-brand_stroke transition-colors"
              >
                No asistió
              </button>
              <button
                type="button"
                onClick={() => onMark(e.id, true)}
                className="flex-1 text-[11px] py-1 rounded-full bg-brand_lime text-brand_dark hover:opacity-90 transition-opacity"
              >
                Asistió
              </button>
            </div>
          </li>
        ))}
      </ul>
      {overflow > 0 && (
        <Link
          to="/dash/agenda/citas"
          className="block mt-3 text-[11px] text-brand_blue text-center"
        >
          +{overflow} más
        </Link>
      )}
    </section>
  )
}

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

// ==================== MOBILE NAVIGATION ====================

const MobileBottomNav = ({
  user,
  org,
  orgs = [],
  canManage = true,
  onboardingCelebrated: initialCelebrated,
}: {
  user: Partial<PrismaUser>
  org?: OrgLite | null
  orgs?: OrgLite[]
  canManage?: boolean
  onboardingCelebrated: boolean
}) => {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)
  const onboardingCelebrated = useOnboardingCelebrated(initialCelebrated)
  const match = (s: string) => location.pathname.includes(s)
  const matchIndex = () => /^\/dash$/.test(location.pathname)

  // Close bottom sheet on navigation
  useEffect(() => {
    setShowMore(false)
  }, [location.pathname])

  const tabs = [
    { to: "/dash", label: "Inicio", icon: <Dashboard />, active: matchIndex() },
    {
      to: "/dash/agenda",
      label: "Agenda",
      icon: <Agenda />,
      active: match("agenda"),
    },
    ...(canManage
      ? [
          {
            to: "/dash/servicios",
            label: "Servicios",
            icon: <Services />,
            active: match("servicios"),
          },
        ]
      : []),
    {
      to: "/dash/clientes",
      label: "Clientes",
      icon: <Clients />,
      active: match("clientes"),
    },
  ]

  const moreActive =
    match("asistente") ||
    match("website") ||
    match("chatbot") ||
    match("pagos") ||
    match("lealtad") ||
    match("evaluaciones") ||
    match("ajustes") ||
    match("perfil")

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden safe-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const color = tab.active ? "#5158F6" : "#11151A"
            return (
              <Link
                key={tab.to}
                to={tab.to}
                prefetch="intent"
                style={{ color }}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              >
                <MobileIcon active={tab.active}>{tab.icon}</MobileIcon>
                <span style={{ color }} className="text-xs leading-tight">
                  {tab.label}
                </span>
              </Link>
            )
          })}
          {(() => {
            const moreColor = moreActive || showMore ? "#5158F6" : "#11151A"
            return (
              <button
                onClick={() => setShowMore(true)}
                style={{ color: moreColor }}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
                <span
                  style={{ color: moreColor }}
                  className="text-xs leading-tight"
                >
                  Más
                </span>
              </button>
            )
          })()}
        </div>
      </nav>

      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            key="more-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-[60] md:hidden"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) {
                  setShowMore(false)
                }
              }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-auto max-h-[85vh] touch-pan-y"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Org switcher / user info */}
              <div className="px-6 pb-4 border-b border-gray-100">
                {org ? (
                  <OrgSwitcher org={org} orgs={orgs} forceExpanded />
                ) : (
                  <UserAvatar user={user} />
                )}
              </div>

              {/* Menu items */}
              <div className="py-2">
                {canManage && (
                  <MobileMenuItem
                    to="/dash/asistente"
                    icon={<Asistente />}
                    label="Asistente IA"
                    active={match("asistente")}
                  />
                )}
                {canManage && (
                  <MobileMenuItem
                    to="/dash/website"
                    icon={<Website />}
                    label="Sitio web"
                    active={match("website")}
                  />
                )}
                <MobileMenuItem
                  to="/dash/chatbot"
                  icon={<Chatbot />}
                  label="Chatbot IA"
                  active={match("chatbot")}
                />
                {canManage && (
                  <MobileMenuItem
                    to="/dash/ventas"
                    icon={<Financial />}
                    label="Ventas"
                    active={match("ventas")}
                  />
                )}
                <MobileMenuItem
                  to="/dash/lealtad"
                  icon={<Loyalty />}
                  label="Lealtad"
                  active={match("lealtad")}
                />
                <MobileMenuItem
                  to="/dash/evaluaciones"
                  icon={<Rank />}
                  label="Evaluaciones"
                  active={match("evaluaciones")}
                />
                {canManage && (
                  <MobileMenuItem
                    to="/dash/ajustes"
                    icon={<Settings />}
                    label="Ajustes"
                    active={match("ajustes")}
                  />
                )}
              </div>

              <div className="border-t border-gray-100 py-2">
                <MobileMenuItem
                  to="/dash/perfil"
                  icon={<Profile />}
                  label="Perfil"
                  active={match("perfil")}
                />
                {!onboardingCelebrated && (
                  <MobileMenuItem
                    to="/dash/onboarding"
                    icon={null}
                    label="Configurar agenda"
                    active={match("onboarding")}
                  />
                )}
              </div>

              <div className="border-t border-gray-100 py-2 safe-bottom">
                <Form action="/signin">
                  <button
                    type="submit"
                    name="intent"
                    value="logout"
                    className="flex items-center gap-3 px-6 py-3.5 w-full text-left text-brand_dark hover:bg-gray-50"
                  >
                    <Out />
                    <span className="text-sm">Cerrar sesión</span>
                  </button>
                </Form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const MobileIcon = ({
  active,
  children,
}: {
  active: boolean
  children: ReactNode
}) => (
  <i className="[&>svg]:w-6 [&>svg]:h-6">
    {Children.map(children, (c) =>
      isValidElement(c)
        ? cloneElement(c as ReactElement<{ fill?: string }>, {
            fill: active ? "#5158F6" : "#11151A",
          })
        : c,
    )}
  </i>
)

const MobileMenuItem = ({
  to,
  icon,
  label,
  active,
}: {
  to: string
  icon: ReactNode
  label: string
  active: boolean
}) => (
  <Link
    to={to}
    prefetch="intent"
    className={twMerge(
      "flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors",
      active ? "text-brand_blue" : "text-brand_dark",
    )}
  >
    {icon && <MobileIcon active={active}>{icon}</MobileIcon>}
    <span className="text-sm">{label}</span>
  </Link>
)
