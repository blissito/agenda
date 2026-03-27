import { type ReactNode, useMemo, useState } from "react"
import { FaCheck } from "react-icons/fa6"
import { FaTrash } from "react-icons/fa6"
import { Form, useLoaderData, useSearchParams } from "react-router"
import { twMerge } from "tailwind-merge"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Switch } from "~/components/common/Switch"
import { BasicInput } from "~/components/forms/BasicInput"
import { MagnifyingGlass } from "~/components/icons/MagnifyingGlass"
import { TabButton } from "~/components/loyalty/loyaltyStep"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import SelectStylized, { type Choice } from "~/components/ui/select"
import { SUPPORTED_TIMEZONES } from "~/utils/timezone"
import { db } from "~/utils/db.server"
import { ClientAvatar } from "./dash.clientes"

const COUNTRIES: Choice[] = [
  { value: "MX", label: "🇲🇽 México" },
  { value: "AR", label: "🇦🇷 Argentina" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "ES", label: "🇪🇸 España" },
  { value: "PE", label: "🇵🇪 Perú" },
]

const TIMEZONES: Choice[] = SUPPORTED_TIMEZONES.map((tz) => ({
  value: tz.value,
  label: tz.label,
}))

const PERIOD: Choice[] = [
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1y", label: "1 año" },
]

const RANGES: Choice[] = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "1440", label: "24 horas" },
]

const TIMES: Choice[] = [
  { value: "1", label: "1 vez" },
  { value: "2", label: "2 veces" },
  { value: "3", label: "3 veces" },
  { value: "unlimited", label: "Ilimitadas" },
]

export const loader = async ({ request }: { request: Request }) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })
  const collaborators = await db.user.findMany({
    where: { orgId: org.id },
  })
  return {
    countries: COUNTRIES,
    timeZones: TIMEZONES,
    period: PERIOD,
    ranges: RANGES,
    times: TIMES,
    collaborators,
    orgName: org.name,
  }
}

export const action = async ({ request }: { request: Request }) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "delete") {
    const userId = formData.get("userId") as string
    if (!userId) return { error: "userId requerido" }
    await db.user.update({
      where: { id: userId, orgId: org.id },
      data: { orgId: null },
    })
    return { ok: true }
  }

  if (intent === "invite") {
    const email = (formData.get("email") as string)?.trim()
    const displayName = (formData.get("displayName") as string)?.trim()
    if (!email) return { error: "Email requerido" }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      if (existing.orgId === org.id) {
        return { error: "Este colaborador ya pertenece a tu organización" }
      }
      await db.user.update({
        where: { id: existing.id },
        data: { orgId: org.id },
      })
    } else {
      await db.user.create({
        data: {
          email,
          emailVerified: false,
          displayName: displayName || null,
          orgId: org.id,
        },
      })
    }
    return { ok: true }
  }

  return { error: "Intent no reconocido" }
}

export default function Ajustes() {
  const { countries, timeZones, collaborators } =
    useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get("tab") === "colaboradores"
    ? "colaboradores"
    : "general"

  const changeTab = (tab: "general" | "colaboradores") => {
    const next = new URLSearchParams(searchParams)
    if (tab === "general") {
      next.delete("tab")
    } else {
      next.set("tab", tab)
    }
    setSearchParams(next)
  }

  return (
    <main className="pb-10">
      <RouteTitle>Ajustes</RouteTitle>

      <div className="flex items-center gap-6 mb-6">
        <TabButton
          label="General"
          active={activeTab === "general"}
          onClick={() => changeTab("general")}
        />
        <TabButton
          label="Colaboradores"
          active={activeTab === "colaboradores"}
          onClick={() => changeTab("colaboradores")}
        />
      </div>

      {activeTab === "general" && (
        <GeneralTab countries={countries} timeZones={timeZones} />
      )}
      {activeTab === "colaboradores" && (
        <ColaboradoresTab collaborators={collaborators} />
      )}
    </main>
  )
}

/* ==================== General Tab ==================== */

function GeneralTab({
  countries,
  timeZones,
}: {
  countries: Choice[]
  timeZones: Choice[]
}) {
  return (
    <section className="bg-white rounded-2xl max-w-4xl pb-10 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-bold">General</h3>
        <OptionBox
          title="Ubicación de tu negocio"
          description="Selecciona el país en donde se encuentra tu negocio"
        >
          <SelectStylized
            choices={countries}
            placeholder="Selecciona un país"
          />
        </OptionBox>
        <OptionBox
          title="Zona horaria de tu calendario"
          description="Selecciona la zona horaria que quieres utilizar"
        >
          <SelectStylized
            choices={timeZones}
            placeholder="Elige una zona horaria"
          />
        </OptionBox>
        <OptionBox
          title="Disponibilidad de calendario"
          description="Cuánto tiempo está disponible tu calendario"
        >
          <SelectStylized
            choices={PERIOD}
            placeholder="Selecciona una opción"
          />
        </OptionBox>
        <OptionBox
          title="Disponibilidad de servicios"
          description="¿Tus servicios pueden agendarse al mismo tiempo? Recomendado si eres un centro deportivo que tiene los espacios disponibles de forma simultánea."
        >
          <Switch name="simultaneous_services" className="h-10" />
        </OptionBox>
        <hr className="bg-brand_stroke my-6" />

        <h3 className="text-lg font-bold">
          Política de agendamiento y cancelación
        </h3>
        <OptionBox
          title="Ventana de agendamiento"
          description="¿Con cuánto tiempo de anticipación mínimo pueden agendar una cita los clientes?"
        >
          <SelectStylized
            choices={RANGES}
            placeholder="Selecciona una opción"
          />
        </OptionBox>
        <OptionBox
          title="Política de reagendamiento"
          description="¿Con cuánto tiempo de anticipación tus clientes pueden reagendar?"
        >
          <SelectStylized
            choices={RANGES}
            placeholder="Selecciona una opción"
          />
        </OptionBox>
        <OptionBox
          title="Política de reagendamiento"
          description="¿Cuántas veces pueden reagendar una cita?"
        >
          <SelectStylized
            choices={TIMES}
            placeholder="Selecciona una opción"
          />
        </OptionBox>
        <OptionBox
          title="Política de cancelación"
          description="¿Con cuánto tiempo de anticipación tus clientes pueden cancelar una cita?"
        >
          <SelectStylized
            choices={RANGES}
            placeholder="Selecciona una opción"
          />
        </OptionBox>
        <hr className="bg-brand_stroke my-6" />
        <h3 className="text-lg font-bold">Términos y condiciones</h3>
        <div className="mt-6">
          <p className="text-brand_dark font-satoshi">
            {" "}
            <strong>Política de cancelación</strong>
          </p>
          <p className="text-brand_gray font-satoshi text-sm">
            ¿Tiene condiciones que deben ser aceptadas antes de reservar?
            Añádelos a continuación.
          </p>
          <BasicInput
            name="terms"
            as="textarea"
            className="mt-4"
            placeholder="Pega aquí los términos y condiciones de tus servicios"
          />
        </div>
        <hr className="bg-brand_stroke my-6" />
        <h3 className="text-lg font-bold">Integraciones</h3>
        <p className="text-brand_dark font-satoshi mt-4 mb-4">
          {" "}
          <strong className="font-satoMiddle">Mensajería</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <IntegrationCardComingSoon
            icon="/images/whatsapp.svg"
            tool="WhatsApp Business"
            description="Envía recordatorios y confirmaciones por WhatsApp."
          />
        </div>
        <p className="text-brand_dark font-satoshi mt-6 mb-4">
          {" "}
          <strong className="font-satoMiddle">Videollamadas</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <IntegrationCard
            icon="/images/zoom.svg"
            tool="Zoom"
            description="Añade enlaces de zoom para tus servicios en línea."
          />
          <IntegrationCard
            icon="/images/google-meet.svg"
            tool="Google Meet"
            description="Usa Google Meet para generar citas en línea."
          />
        </div>
        <p className="col-span-3 text-brand_dark font-satoshi mt-6 mb-4">
          {" "}
          <strong className="font-satoMiddle">Redes sociales</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <IntegrationCard
            icon="/images/face.svg"
            tool="Facebook"
            description="Permite que tus clientes agenden citas desde tu fan page."
          />
          <IntegrationCard
            icon="/images/insta.svg"
            tool="Instagram"
            description="Acepta citas en cualquier momento desde tu cuenta de instragram."
          />
        </div>
      </div>
      <div className="fixed right-4 bottom-4 py-10 px-4 rounded-xl backdrop-blur-sm">
        <PrimaryButton
          type="submit"
          className="hover:-translate-y-1 hover:shadow-md transition-all active:translate-y-0"
        >
          Guardar
        </PrimaryButton>
      </div>
    </section>
  )
}

/* ==================== Colaboradores Tab ==================== */

function ColaboradoresTab({
  collaborators,
}: {
  collaborators: Array<{
    id: string
    displayName: string | null
    email: string | null
    photoURL: string | null
    role: string | null
  }>
}) {
  const [search, setSearch] = useState("")
  const [showInvite, setShowInvite] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return collaborators
    return collaborators.filter(
      (c) =>
        c.displayName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q),
    )
  }, [collaborators, search])

  return (
    <>
      {/* Stats */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 flex items-center justify-between">
        <div>
          <p className="text-brand_blue text-2xl font-satoMedium">
            {collaborators.length}{" "}
            {collaborators.length === 1 ? "colaborador" : "colaboradores"}
          </p>
          <p className="text-brand_gray text-sm mt-1">Miembros de tu equipo</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="bg-brand_blue text-white px-4 py-2 rounded-full text-sm font-satoMedium hover:opacity-90 transition-opacity"
        >
          + Invitar
        </button>
      </section>

      {/* Invite form */}
      {showInvite && (
        <Form
          method="post"
          className="bg-white rounded-2xl p-4 sm:p-6 mt-4 flex flex-col sm:flex-row gap-3"
          onSubmit={() => setShowInvite(false)}
        >
          <input type="hidden" name="intent" value="invite" />
          <BasicInput
            name="displayName"
            placeholder="Nombre"
            containerClassName="flex-1"
          />
          <BasicInput
            name="email"
            type="email"
            placeholder="Email"
            required
            containerClassName="flex-1"
          />
          <button
            type="submit"
            className="bg-brand_blue text-white px-6 py-2 rounded-full text-sm font-satoMedium hover:opacity-90 transition-opacity self-end"
          >
            Agregar
          </button>
        </Form>
      )}

      {/* Search */}
      {collaborators.length > 0 && (
        <div className="relative w-full sm:max-w-80 my-4">
          <BasicInput
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Busca por nombre o email"
            containerClassName="w-full"
            inputClassName="!rounded-full pr-12 border-white"
          />
          <MagnifyingGlass className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brand_iron" />
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 px-4 py-3 text-[12px] font-satoMedium uppercase tracking-wide text-slate-600 border-b border-slate-200">
            <span className="col-span-5 pl-2">Colaborador</span>
            <span className="col-span-3 hidden sm:block text-center">
              Email
            </span>
            <span className="col-span-2 hidden sm:block text-center">Rol</span>
            <span className="col-span-2 text-center">Acciones</span>
          </div>
          {/* Rows */}
          {filtered.map((c, i) => {
            const initials = getInitials(c.displayName, c.email)
            return (
              <div
                key={c.id}
                className={twMerge(
                  "grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-50 transition-colors",
                  i < filtered.length - 1 && "border-b border-slate-100",
                )}
              >
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <ClientAvatar
                    photoUrl={c.photoURL}
                    initials={initials}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-brand_dark text-sm truncate">
                      {c.displayName || "—"}
                    </p>
                    <p className="text-xs text-brand_gray truncate sm:hidden">
                      {c.email}
                    </p>
                  </div>
                </div>
                <p className="col-span-3 hidden sm:block text-sm text-center text-brand_gray truncate">
                  {c.email}
                </p>
                <p className="col-span-2 hidden sm:block text-sm text-center text-brand_gray capitalize">
                  {c.role || "miembro"}
                </p>
                <div className="col-span-2 flex justify-center">
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="userId" value={c.id} />
                    <button
                      type="submit"
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Remover del equipo"
                    >
                      <FaTrash size={14} />
                    </button>
                  </Form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {collaborators.length === 0 && !showInvite && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-satoBold text-xl">Aún no tienes colaboradores</p>
          <p className="mt-2 text-brand_gray">
            Invita a tu equipo para gestionar la agenda juntos
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="mt-6 bg-brand_blue text-white px-6 py-2 rounded-full text-sm font-satoMedium hover:opacity-90 transition-opacity"
          >
            + Invitar colaborador
          </button>
        </div>
      )}

      {filtered.length === 0 && search && (
        <div className="bg-white py-16 flex flex-col items-center gap-3 text-center">
          <MagnifyingGlass className="w-12 h-12 text-brand_gray" />
          <p className="font-satoMedium text-lg">
            Sin resultados para &quot;{search}&quot;
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-2 text-brand_blue text-sm underline underline-offset-2"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}
    </>
  )
}

/* ==================== Shared Components ==================== */

function getInitials(displayName: string | null, email: string | null) {
  const name = (displayName || "").trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  }
  return ((email || "").slice(0, 2) || "CO").toUpperCase()
}

export const IntegrationCard = ({
  icon,
  tool,
  description,
}: {
  icon: string
  tool: string
  description: string
}) => {
  return (
    <section className="col-span-1 md:col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4 relative cursor-pointer group">
      <img className="w-6 h-6 rounded-full" src={icon} alt="social media" />
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-brand_dark">{tool}</h3>
          <div className="bg-[#F1FCF7] h-4 rounded-full px-1 flex gap-1 justify-start items-center">
            <FaCheck className="text-[10px]" fill="#3D7E5A" />{" "}
            <span className="text-[10px] items-center gap-1 text-[#3D7E5A] group-hover:block transition-all hidden">
              Conectado
            </span>
          </div>
        </div>
        <p className="text-brand_gray text-sm mt-1">{description}</p>
      </div>
    </section>
  )
}

export const IntegrationCardComingSoon = ({
  icon,
  tool,
  description,
}: {
  icon: string
  tool: string
  description: string
}) => {
  return (
    <section className="col-span-1 md:col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4 relative opacity-60 cursor-not-allowed">
      <img
        className="w-6 h-6 rounded-full grayscale"
        src={icon}
        alt="integration"
      />
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-brand_dark">{tool}</h3>
          <div className="bg-[#FEF3C7] h-4 rounded-full px-2 flex gap-1 justify-start items-center">
            <span className="text-[10px] items-center gap-1 text-[#92400E]">
              Próximamente
            </span>
          </div>
        </div>
        <p className="text-brand_gray text-sm mt-1">{description}</p>
      </div>
    </section>
  )
}

export const OptionBox = ({
  title,
  description,
  children,
}: {
  title: string
  children?: ReactNode
  description?: string
}) => {
  return (
    <section className="grid grid-cols-8 gap-6 my-6">
      <div className="col-span-5">
        <p className="col-span-3 text-brand_dark font-satoshi">
          {" "}
          <strong>{title}</strong>
        </p>
        <p className="col-span-5 md:col-span-3 text-brand_gray font-satoshi text-sm">
          {description}
        </p>
      </div>
      <div className="col-span-3 flex items-center justify-end">{children}</div>
    </section>
  )
}
