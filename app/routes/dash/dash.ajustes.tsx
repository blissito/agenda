import { type ReactNode, useMemo, useState } from "react"
import { FaCheck } from "react-icons/fa6"
import { FaInstagram, FaFacebookF, FaTiktok, FaYoutube, FaLinkedinIn } from "react-icons/fa6"
import { Trash } from "~/components/icons/trash"
import { Form, useFetcher, useLoaderData, useSearchParams } from "react-router"
import { twMerge } from "tailwind-merge"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Switch } from "~/components/common/Switch"
import { BasicInput } from "~/components/forms/BasicInput"
import { InputFile } from "~/components/forms/InputFile"
import { TimesForm } from "~/components/forms/TimesForm"
import { MagnifyingGlass } from "~/components/icons/MagnifyingGlass"
import { TabButton } from "~/components/loyalty/loyaltyStep"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import SelectStylized, { type Choice } from "~/components/ui/select"
import type { WeekSchema } from "~/utils/zod_schemas"
import { weekDaysOrgSchema } from "~/utils/zod_schemas"
import { ClientAvatar } from "~/components/common/ClientAvatar"
import {
  COUNTRIES,
  TIMEZONES,
  PERIOD,
  RANGES,
  RESCHEDULE_RANGES,
  CANCELLATION_RANGES,
  TIMES,
  ROLE_LABELS,
} from "./dash.ajustes.constants"

export { loader, action } from "./dash.ajustes.server"
import type { loader } from "./dash.ajustes.server"

const TABS = ["general", "horarios", "configuracion", "integraciones", "colaboradores"] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  general: "Info General",
  horarios: "Horarios",
  configuracion: "Configuración",
  integraciones: "Integraciones",
  colaboradores: "Colaboradores",
}

export default function Ajustes() {
  const { countries, timeZones, collaborators, org, logoAction } =
    useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawTab = searchParams.get("tab")
  const activeTab: Tab = TABS.includes(rawTab as Tab)
    ? (rawTab as Tab)
    : "general"

  const changeTab = (tab: Tab) => {
    const next = new URLSearchParams(searchParams)
    if (tab === "general") {
      next.delete("tab")
    } else {
      next.set("tab", tab)
    }
    setSearchParams(next)
  }

  return (
    <main className=" max-w-8xl mx-auto">
      <RouteTitle className="text-xl md:text-3xl">Ajustes</RouteTitle>

      <div className="flex items-center gap-6 mb-4 md:mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <TabButton
            key={tab}
            label={TAB_LABELS[tab]}
            active={activeTab === tab}
            onClick={() => changeTab(tab)}
          />
        ))}
      </div>

      {activeTab === "general" && <InfoGeneralTab org={org} logoAction={logoAction} />}
      {activeTab === "horarios" && <HorariosTab org={org} />}
      {activeTab === "configuracion" && (
        <ConfiguracionTab countries={countries} timeZones={timeZones} org={org} />
      )}
      {activeTab === "integraciones" && <IntegracionesTab org={org} />}
      {activeTab === "colaboradores" && (
        <ColaboradoresTab collaborators={collaborators} ownerId={org.ownerId} />
      )}
    </main>
  )
}

/* ==================== Info General Tab ==================== */

const DESC_MAX = 300

function InfoGeneralTab({
  org,
  logoAction,
}: {
  org: any
  logoAction: { putUrl: string; removeUrl: string; readUrl: string; logoKey: string }
}) {
  const fetcher = useFetcher()
  const [name, setName] = useState(org.name || "")
  const [shopKeeper, setShopKeeper] = useState(org.shopKeeper || "")
  const [email, setEmail] = useState(org.email || "")
  const [tel, setTel] = useState(org.tel || "")
  const [description, setDescription] = useState(org.description || "")
  const [address, setAddress] = useState(org.address || "")
  const [logoKey, setLogoKey] = useState<string | null>(org.logo || null)

  const social = (org.social || {}) as Record<string, string>
  const [instagram, setInstagram] = useState(social.instagram || "")
  const [facebook, setFacebook] = useState(social.facebook || "")
  const [tiktok, setTiktok] = useState(social.tiktok || "")
  const [youtube, setYoutube] = useState(social.youtube || "")
  const [linkedin, setLinkedin] = useState(social.linkedin || "")

  const isLoading = fetcher.state !== "idle"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetcher.submit(
      {
        intent: "org_update",
        data: JSON.stringify({
          id: org.id,
          name,
          shopKeeper: shopKeeper || null,
          email: email || null,
          tel: tel || null,
          description: description || null,
          address: address || null,
          logo: logoKey,
          social: {
            instagram: instagram || "",
            facebook: facebook || "",
            tiktok: tiktok || "",
            youtube: youtube || "",
            linkedin: linkedin || "",
            x: social.x || "",
            website: social.website || "",
          },
        }),
      },
      { method: "post", action: "/api/org" },
    )
  }

  return (
    <section className="bg-white rounded-2xl max-w-4xl overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-satoBold">
          Información general{" "}
        </h3>

        {/* Logo + Name fields row */}
        <div className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-6 mt-4 md:mt-6">
          <div className="[&>div]:mb-0 md:[&>div]:h-full">
            <InputFile
              name="logo"
              className="w-full h-[140px] md:w-[160px] md:h-full mt-0"
              action={logoAction}
              onUploadComplete={(key) => setLogoKey(key)}
              onDelete={() => setLogoKey(null)}
            >
              <p className="text-brand_gray text-sm hover:scale-105 transition-all">
                Arrastra o<br />selecciona tu logo
              </p>
            </InputFile>
          </div>
          <div className="flex-1 space-y-4">
            <BasicInput
              name="name"
              label="Nombre de tu negocio"
              placeholder="Estudio Milan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <BasicInput
              name="shopKeeper"
              label="Tu nombre o del profesional que atiende tu negocio"
              placeholder="Brenda Ortega"
              value={shopKeeper}
              onChange={(e) => setShopKeeper(e.target.value)}
            />
          </div>
        </div>

        {/* Correo + Teléfono row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <BasicInput
            name="email"
            label="Correo"
            type="email"
            placeholder="hola@estudiodemilan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <BasicInput
            name="tel"
            label="Teléfono"
            placeholder="55 653 66 33"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
        </div>

        {/* Ubicación */}
        <div className="mt-4">
          <BasicInput
            name="address"
            label="Ubicación de tu negocio"
            placeholder="Av. Lopez Mateos 116, col. centro, CDMX, MEX"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Descripción con counter */}
        <div className="mt-4 relative">
          <BasicInput
            name="description"
            as="textarea"
            label="Descripción"
            placeholder="Cuéntale a tus clientes sobre tu negocio"
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= DESC_MAX) setDescription(e.target.value)
            }}
          />
          <span className="absolute bottom-2 right-3 text-xs text-brand_gray">
            {description.length}/{DESC_MAX}
          </span>
        </div>

        {/* Redes sociales */}
        <hr className="bg-brand_stroke my-6" />
        <h3 className="text-lg font-bold mb-4">Redes sociales</h3>

        <div className="space-y-4">
          <BasicInput
            name="instagram"
            label="Instagram"
            placeholder="https://www.instagram.com/tunegocio/"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            icon={<FaInstagram />}
          />
          <BasicInput
            name="facebook"
            label="Facebook"
            placeholder="https://www.facebook.com/tunegocio/"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            icon={<FaFacebookF />}
          />
          <BasicInput
            name="tiktok"
            label="Tiktok"
            placeholder="https://www.tiktok.com/@tunegocio"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            icon={<FaTiktok />}
          />
          <BasicInput
            name="youtube"
            label="Youtube"
            placeholder="https://www.youtube.com/@tunegocio"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            icon={<FaYoutube />}
          />
          <BasicInput
            name="linkedin"
            label="Linkedin"
            placeholder="https://www.linkedin.com/company/tunegocio"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            icon={<FaLinkedinIn />}
          />
        </div>

        <div className="flex justify-end mt-12">
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            className="hover:-translate-y-1 hover:shadow-md transition-all active:translate-y-0"
          >
            Guardar
          </PrimaryButton>
        </div>
      </form>
    </section>
  )
}

/* ==================== Horarios Tab ==================== */

function HorariosTab({ org }: { org: any }) {
  const fetcher = useFetcher()

  const handleSubmit = (weekDays: WeekSchema) => {
    weekDaysOrgSchema.parse({ weekDays })
    fetcher.submit(
      {
        data: JSON.stringify({ weekDays }),
        intent: "update_weekdays",
      },
      { method: "POST" },
    )
  }

  return (
    <section className="bg-white rounded-2xl max-w-4xl overflow-hidden">
      <div className="p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-satoBold mb-2">Horario: Actualiza los días y horarios en los que ofreces servicio</h3>
        <div className="mt-6 [&>form]:mx-0 [&>form]:px-0 [&>form]:pt-0 [&>form]:max-w-none">
          <TimesForm org={org} onSubmit={handleSubmit}>
            <div className="flex justify-end mt-12">
              <PrimaryButton
                type="submit"
                isLoading={fetcher.state !== "idle"}
                className="hover:-translate-y-1 hover:shadow-md transition-all active:translate-y-0"
              >
                Guardar
              </PrimaryButton>
            </div>
          </TimesForm>
        </div>
      </div>
    </section>
  )
}

/* ==================== Configuración Tab ==================== */

function ConfiguracionTab({
  countries,
  timeZones,
  org,
}: {
  countries: Choice[]
  timeZones: Choice[]
  org: any
}) {
  const fetcher = useFetcher()
  const existingConfig = (org.config || {}) as Record<string, any>

  const [country, setCountry] = useState<string>(existingConfig.country || "")
  const [timezone, setTimezone] = useState<string>(org.timezone || "")
  const [calendarAvailability, setCalendarAvailability] = useState<string>(existingConfig.calendarAvailability || "")
  const [simultaneousServices, setSimultaneousServices] = useState<boolean>(existingConfig.simultaneousServices || false)
  const [minBookingAdvance, setMinBookingAdvance] = useState<string>(existingConfig.minBookingAdvance || "")
  const [rescheduleWindow, setRescheduleWindow] = useState<string>(existingConfig.rescheduleWindow || "")
  const [maxReschedules, setMaxReschedules] = useState<string>(existingConfig.maxReschedules || "")
  const [cancellationWindow, setCancellationWindow] = useState<string>(existingConfig.cancellationWindow || "")
  const [termsAndConditions, setTermsAndConditions] = useState<string>(existingConfig.termsAndConditions || "")
  const [surveyEnabled, setSurveyEnabled] = useState<boolean>(existingConfig.surveyEnabled ?? true)

  const isLoading = fetcher.state !== "idle"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetcher.submit(
      {
        intent: "org_update",
        data: JSON.stringify({
          id: org.id,
          timezone: timezone || null,
          config: {
            country: country || null,
            calendarAvailability: calendarAvailability || null,
            simultaneousServices,
            minBookingAdvance: minBookingAdvance || null,
            rescheduleWindow: rescheduleWindow || null,
            maxReschedules: maxReschedules || null,
            cancellationWindow: cancellationWindow || null,
            termsAndConditions: termsAndConditions || null,
            surveyEnabled,
          },
        }),
      },
      { method: "post", action: "/api/org" },
    )
  }

  return (
    <section className="bg-white rounded-2xl max-w-4xl overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-satoBold">General</h3>
        <OptionBox
          title="Ubicación de tu negocio"
          description="Selecciona el país en donde se encuentra tu negocio"
        >
          <SelectStylized
            choices={countries}
            placeholder="Selecciona un país"
            value={country}
            onChange={setCountry}
          />
        </OptionBox>
        <OptionBox
          title="Zona horaria de tu calendario"
          description="Selecciona la zona horaria que quieres utilizar"
        >
          <SelectStylized
            choices={timeZones}
            placeholder="Elige una zona horaria"
            value={timezone}
            onChange={setTimezone}
          />
        </OptionBox>
        <OptionBox
          title="Disponibilidad de calendario"
          description="Cuánto tiempo está disponible tu calendario"
        >
          <SelectStylized
            choices={PERIOD}
            placeholder="Selecciona una opción"
            value={calendarAvailability}
            onChange={setCalendarAvailability}
          />
        </OptionBox>
        <OptionBox
          title="Disponibilidad de servicios"
          description="¿Tus servicios pueden agendarse al mismo tiempo? Recomendado si eres un centro deportivo que tiene los espacios disponibles de forma simultánea."
        >
          <Switch
            name="simultaneous_services"
            className="h-10"
            defaultChecked={simultaneousServices}
            onChange={setSimultaneousServices}
          />
        </OptionBox>
        <hr className="bg-brand_stroke my-4 md:my-6" />

        <h3 className="text-lg font-satoBold">
          Política de agendamiento y cancelación
        </h3>
        <OptionBox
          title="Ventana de agendamiento"
          description="¿Con cuánto tiempo de anticipación mínimo pueden agendar una cita los clientes?"
        >
          <SelectStylized
            choices={RANGES}
            placeholder="Selecciona una opción"
            value={minBookingAdvance}
            onChange={setMinBookingAdvance}
          />
        </OptionBox>
        <OptionBox
          title="Política de reagendamiento"
          description="¿Con cuánto tiempo de anticipación tus clientes pueden reagendar?"
        >
          <SelectStylized
            choices={RESCHEDULE_RANGES}
            placeholder="Selecciona una opción"
            value={rescheduleWindow}
            onChange={setRescheduleWindow}
          />
        </OptionBox>
        <OptionBox
          title="Política de reagendamiento"
          description="¿Cuántas veces pueden reagendar una cita?"
        >
          <SelectStylized
            choices={TIMES}
            placeholder="Selecciona una opción"
            value={maxReschedules}
            onChange={setMaxReschedules}
          />
        </OptionBox>
        <OptionBox
          title="Política de cancelación"
          description="¿Con cuánto tiempo de anticipación tus clientes pueden cancelar una cita?"
        >
          <SelectStylized
            choices={CANCELLATION_RANGES}
            placeholder="Selecciona una opción"
            value={cancellationWindow}
            onChange={setCancellationWindow}
          />
        </OptionBox>
        <hr className="bg-brand_stroke my-4 md:my-6" />
        <h3 className="text-lg font-satoBold">Términos y condiciones</h3>
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
            className="mt-1"
            placeholder="Pega aquí los términos y condiciones de tus servicios"
            value={termsAndConditions}
            onChange={(e: any) => setTermsAndConditions(e.target.value)}
          />
        </div>
        <hr className="bg-brand_stroke my-4 md:my-6" />
        <h3 className="text-lg font-satoBold">Encuestas</h3>
        <OptionBox
          title="Encuesta de satisfacción"
          description="Enviar encuesta de satisfacción después de cada cita"
        >
          <Switch
            name="survey_enabled"
            className="h-10"
            defaultChecked={surveyEnabled}
            onChange={setSurveyEnabled}
          />
        </OptionBox>
        <div className="flex justify-end mt-12">
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            className="hover:-translate-y-1 hover:shadow-md transition-all active:translate-y-0"
          >
            Guardar
          </PrimaryButton>
        </div>
      </form>
    </section>
  )
}

/* ==================== Integraciones Tab ==================== */

function IntegracionesTab({ org }: { org: any }) {
  const fetcher = useFetcher()
  const isGoogleMeetConnected = Boolean(org.googleCalendarToken)
  const isZoomConnected = Boolean(org.zoomToken)
  return (
    <section className="bg-white rounded-2xl max-w-4xl pb-4 md:pb-10 overflow-hidden">
      <div className="p-4 md:p-6">
        <h3 className="text-lg font-bold">Integraciones</h3>
        <p className="text-brand_dark font-satoshi mt-4 mb-4">
          {" "}
          <strong className="font-satoMiddle">Mensajería</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <IntegrationCardDisabled
            icon={<WhatsAppIcon />}
            tool="WhatsApp Business"
            description="Envía recordatorios y confirmaciones por WhatsApp."
          />
        </div>
        <p className="text-brand_dark font-satoshi mt-6 mb-4">
          {" "}
          <strong className="font-satoMiddle">Inteligencia artificial</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <IntegrationCard
            icon="https://www.easybits.cloud/logo-purple.svg"
            tool="Easybits"
            description="Genera sitios web profesionales para tu negocio con inteligencia artificial."
          />
          <IntegrationCard
            icon="https://www.formmy.app/dash/logo-full.svg"
            tool="Formmy"
            description="Chatbot inteligente para atender a tus clientes de forma automática."
          />
        </div>
        <p className="text-brand_dark font-satoshi mt-6 mb-4">
          {" "}
          <strong className="font-satoMiddle">Videollamadas</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {isZoomConnected ? (
            <div className="col-span-1 md:col-span-2">
              <IntegrationCard
                icon="/images/zoom.svg"
                tool="Zoom"
                description="Zoom conectado. Se generarán enlaces automáticamente en tus citas."
                onDisconnect={() => {
                  if (window.confirm("¿Desconectar Zoom?")) {
                    fetcher.submit(
                      { intent: "disconnect_zoom" },
                      { method: "post", action: "/dash/ajustes" },
                    )
                  }
                }}
              />
            </div>
          ) : (
            <a href="/dash/zoom/connect" className="col-span-1 md:col-span-2">
              <IntegrationCardDisconnected
                icon="/images/zoom.svg"
                tool="Zoom"
                description="Añade enlaces de zoom para tus servicios en línea."
              />
            </a>
          )}
          {isGoogleMeetConnected ? (
            <div className="col-span-1 md:col-span-2">
              <IntegrationCard
                icon="/images/google-meet.svg"
                tool="Google Meet"
                description="Usa Google Meet para generar citas en línea."
                onDisconnect={() => {
                  if (window.confirm("¿Desconectar Google Meet?")) {
                    fetcher.submit(
                      { intent: "disconnect_google" },
                      { method: "post", action: "/dash/ajustes" },
                    )
                  }
                }}
              />
            </div>
          ) : (
            <a href="/dash/google-calendar/connect" className="col-span-1 md:col-span-2">
              <IntegrationCardDisconnected
                icon="/images/google-meet.svg"
                tool="Google Meet"
                description="Conecta Google Meet para generar citas en línea."
              />
            </a>
          )}
        </div>
        <p className="col-span-3 text-brand_dark font-satoshi mt-6 mb-4">
          {" "}
          <strong className="font-satoMiddle">Redes sociales</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <IntegrationCardDisconnected
            icon="/images/face.svg"
            tool="Facebook"
            description="Permite que tus clientes agenden citas desde tu fan page."
          />
          <IntegrationCardDisconnected
            icon="/images/insta.svg"
            tool="Instagram"
            description="Acepta citas en cualquier momento desde tu cuenta de instragram."
          />
        </div>
      </div>
    </section>
  )
}

/* ==================== Colaboradores Tab ==================== */

function ColaboradoresTab({
  collaborators,
  ownerId,
}: {
  collaborators: Array<{
    id: string
    displayName: string | null
    email: string | null
    photoURL: string | null
    role: string | null
  }>
  ownerId: string
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
      <ConfirmModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onConfirm={() => {}}
        title="El equipo empieza a crecer"
        description="Agrega un nuevo miembro a tu equipo"
        emoji="👩‍💼"
        hideButtons
      >
        <Form
          method="post"
          className="flex flex-col gap-4 w-full mt-6"
          onSubmit={() => setShowInvite(false)}
        >
          <input type="hidden" name="intent" value="invite" />
          <BasicInput
            name="displayName"
            label="Nombre"
            placeholder="Nombre del colaborador"
          />
          <BasicInput
            name="email"
            type="email"
            label="Email"
            placeholder="correo@ejemplo.com"
            required
          />
          <div className="flex justify-center mt-4">
            <PrimaryButton type="submit" className="w-[160px] h-10">
              Invitar
            </PrimaryButton>
          </div>
        </Form>
      </ConfirmModal>

      {/* Search + Invite */}
      <div className="flex items-center justify-between gap-3 my-4">
        <div className="relative w-full sm:max-w-80">
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
        <PrimaryButton onClick={() => setShowInvite(!showInvite)}>
          + Invitar
        </PrimaryButton>
      </div>

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 px-4 py-3 text-[12px] font-satoMedium uppercase tracking-wide text-slate-600 border-b border-brand_stroke">
            <span className="col-span-10 sm:col-span-5 pl-2">Colaborador</span>
            <span className="col-span-3 hidden sm:block text-left">
              Email
            </span>
            <span className="col-span-2 hidden sm:block text-left">Rol</span>
            <span className="col-span-2 text-right sm:text-center pr-2">Acciones</span>
          </div>
          {/* Rows */}
          {filtered.map((c, i) => {
            const initials = getInitials(c.displayName, c.email)
            return (
              <div
                key={c.id}
                className={twMerge(
                  "grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-50 transition-colors",
                  i < filtered.length - 1 && "border-b border-brand_stroke",
                )}
              >
                <div className="col-span-10 sm:col-span-5 flex items-center gap-3 min-w-0">
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
                <p className="col-span-3 hidden sm:block text-sm text-left text-brand_gray truncate">
                  {c.email}
                </p>
                <p className="col-span-2 hidden sm:block text-sm text-left text-brand_gray capitalize">
                  {ROLE_LABELS[c.role || "GUEST"] || c.role}
                </p>
                <div className="col-span-2 flex justify-end sm:justify-center">
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="userId" value={c.id} />
                    <button
                      type="submit"
                      disabled={c.id === ownerId}
                      className="text-red-400 hover:text-red-600 p-2.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      title={c.id === ownerId ? "No puedes remover al owner" : "Remover del equipo"}
                    >
                      <Trash className="w-8 h-8" />
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
  onDisconnect,
}: {
  icon: string
  tool: string
  description: string
  onDisconnect?: () => void
}) => {
  return (
    <section className="col-span-1 md:col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4 relative cursor-pointer group">
      <img className="w-6 h-6 rounded-full" src={icon} alt="social media" />
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-brand_dark">{tool}</h3>
          <div className="bg-[#F1FCF7] h-4 rounded-full px-1 flex gap-1 justify-start items-center">
            <FaCheck className="text-[10px]" fill="#3D7E5A" />{" "}
            <span className="text-[10px] items-center gap-1 text-[#3D7E5A]">
              Conectado
            </span>
          </div>
          {onDisconnect && (
            <button
              type="button"
              onClick={onDisconnect}
              aria-label="Desconectar"
              title="Desconectar"
              className="[&_path]:fill-red-500 hover:[&_path]:fill-red-600 transition-colors"
            >
              <DisconnectedIcon />
            </button>
          )}
        </div>
        <p className="text-brand_gray text-sm mt-1">{description}</p>
      </div>
    </section>
  )
}

const DisconnectedIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M18.7756 1.39839C19.0196 1.6327 19.0196 2.01261 18.7756 2.24692L17.1089 3.84692C16.8648 4.08123 16.4691 4.08123 16.2251 3.84692C15.981 3.61261 15.981 3.2327 16.2251 2.99839L17.8917 1.39839C18.1358 1.16408 18.5315 1.16408 18.7756 1.39839Z" fill="#141B34"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M15.8057 4.25034C14.3794 2.88113 12.067 2.88113 10.6407 4.25034L10.0358 4.83103C9.83307 5.02568 9.79049 5.18043 9.79199 5.28204C9.79357 5.38765 9.84457 5.54096 10.0358 5.72456L14.27 9.78935C14.4727 9.98399 14.6339 10.0249 14.7398 10.0234C14.8498 10.0219 15.0095 9.97296 15.2007 9.78935L15.8057 9.20872C17.2319 7.83947 17.2319 5.61955 15.8057 4.25034ZM9.75682 3.40181C11.6712 1.56398 14.7751 1.56398 16.6895 3.40181C18.6039 5.23965 18.6039 8.21935 16.6895 10.0572L16.0847 10.6379C15.7247 10.9834 15.2705 11.2162 14.7577 11.2233C14.2407 11.2304 13.7702 11.0066 13.3861 10.6379L9.15191 6.57309C8.79199 6.22752 8.54949 5.79149 8.54216 5.2992C8.53474 4.80292 8.76782 4.35124 9.15191 3.9825L9.75682 3.40181ZM3.7756 15.7992C4.01967 16.0335 4.01967 16.4134 3.7756 16.6477L2.10893 18.2477C1.86486 18.482 1.46912 18.482 1.22505 18.2477C0.980973 18.0134 0.980973 17.6335 1.22505 17.3992L2.89172 15.7992C3.13579 15.5649 3.53152 15.5649 3.7756 15.7992Z" fill="#141B34"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5.28726 8.4236C5.80006 8.43064 6.25426 8.66344 6.61422 9.00896L10.8484 13.0738C11.2325 13.4426 11.4656 13.8942 11.4582 14.3905C11.4508 14.8828 11.2083 15.3188 10.8484 15.6644L10.2435 16.245C8.3291 18.0829 5.22522 18.0829 3.31081 16.245C1.3964 14.4072 1.3964 11.4275 3.31081 9.58968L3.91569 9.00896C4.29979 8.64024 4.7703 8.41648 5.28726 8.4236ZM5.26938 9.62344C5.16353 9.62199 5.00233 9.66288 4.79957 9.85752L4.19469 10.4382C2.76843 11.8074 2.76843 14.0274 4.19469 15.3966C5.62095 16.7658 7.93337 16.7658 9.35966 15.3966L9.9645 14.8158C10.1557 14.6322 10.2067 14.479 10.2083 14.3734C10.2098 14.2717 10.1672 14.117 9.9645 13.9223L5.73034 9.85752C5.53908 9.67392 5.37939 9.62495 5.26938 9.62344ZM10.4419 6.19917C10.686 6.43348 10.686 6.81339 10.4419 7.0477L9.19191 8.24768C8.94783 8.482 8.55216 8.482 8.30806 8.24768C8.06398 8.01336 8.06398 7.63348 8.30806 7.39917L9.55808 6.19917C9.80216 5.96486 10.1978 5.96486 10.4419 6.19917ZM13.7752 9.3992C14.0193 9.63352 14.0193 10.0134 13.7752 10.2477L12.5252 11.4477C12.2812 11.682 11.8855 11.682 11.6414 11.4477C11.3973 11.2134 11.3973 10.8335 11.6414 10.5992L12.8914 9.3992C13.1355 9.16488 13.5312 9.16488 13.7752 9.3992Z" fill="#141B34"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_whatsapp)">
      <path d="M32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16Z" fill="#0DC143"/>
      <path d="M23.1676 8.80636C21.4523 7.04056 19.0812 6.08203 16.6595 6.08203C11.5136 6.08203 7.37664 10.2694 7.42711 15.3649C7.42711 16.9793 7.88117 18.5433 8.63791 19.9559L7.32617 24.7487L12.2199 23.4874C13.582 24.2442 15.0956 24.5974 16.609 24.5974C21.7046 24.5974 25.8415 20.41 25.8415 15.3144C25.8415 12.8424 24.883 10.5217 23.1676 8.80636ZM16.6595 23.0334C15.2974 23.0334 13.9352 22.6802 12.7748 21.9739L12.4721 21.8226L9.54604 22.5793L10.3028 19.7036L10.101 19.401C7.88117 15.819 8.94057 11.0766 12.573 8.85683C16.2054 6.63698 20.8974 7.69643 23.1172 11.3289C25.337 14.9613 24.2776 19.6532 20.6451 21.873C19.4848 22.6298 18.0721 23.0334 16.6595 23.0334ZM21.0992 17.4334L20.5442 17.1811C20.5442 17.1811 19.737 16.828 19.2325 16.5757C19.182 16.5757 19.1316 16.5253 19.0812 16.5253C18.9298 16.5253 18.8289 16.5757 18.728 16.6262C18.728 16.6262 18.6776 16.6766 17.9712 17.4838C17.9208 17.5848 17.8199 17.6352 17.719 17.6352H17.6685C17.6181 17.6352 17.5172 17.5848 17.4667 17.5343L17.2145 17.4334C16.6595 17.1811 16.155 16.8784 15.7514 16.4748C15.6505 16.3739 15.4992 16.273 15.3982 16.1721C15.0451 15.819 14.692 15.4154 14.4397 14.9613L14.3892 14.8604C14.3388 14.81 14.3388 14.7595 14.2884 14.6586C14.2884 14.5577 14.2884 14.4568 14.3388 14.4064C14.3388 14.4064 14.5406 14.1541 14.692 14.0028C14.7928 13.9018 14.8433 13.7505 14.9442 13.6496C15.0451 13.4982 15.0956 13.2964 15.0451 13.1451C14.9946 12.8928 14.3892 11.5307 14.2379 11.228C14.137 11.0766 14.0361 11.0262 13.8848 10.9757H13.7334C13.6325 10.9757 13.4812 10.9757 13.3298 10.9757C13.2289 10.9757 13.128 11.0262 13.0271 11.0262L12.9766 11.0766C12.8757 11.1271 12.7748 11.228 12.6739 11.2784C12.573 11.3793 12.5226 11.4802 12.4217 11.5811C12.0685 12.0352 11.8667 12.5902 11.8667 13.1451C11.8667 13.5487 11.9676 13.9523 12.119 14.3054L12.1694 14.4568C12.6235 15.4154 13.2289 16.273 14.0361 17.0298L14.2379 17.2316C14.3892 17.383 14.5406 17.4838 14.6415 17.6352C15.701 18.5433 16.9118 19.1992 18.2739 19.5523C18.4253 19.6028 18.6271 19.6028 18.7784 19.6532C18.9298 19.6532 19.1316 19.6532 19.283 19.6532C19.5352 19.6532 19.8379 19.5523 20.0397 19.4514C20.191 19.3505 20.292 19.3505 20.3928 19.2496L20.4938 19.1487C20.5946 19.0478 20.6956 18.9974 20.7964 18.8964C20.8974 18.7956 20.9982 18.6946 21.0487 18.5938C21.1496 18.392 21.2 18.1397 21.2505 17.8874C21.2505 17.7866 21.2505 17.6352 21.2505 17.5343C21.2505 17.5343 21.2 17.4838 21.0992 17.4334Z" fill="white"/>
    </g>
    <defs>
      <clipPath id="clip0_whatsapp">
        <rect width="32" height="32" fill="white"/>
      </clipPath>
    </defs>
  </svg>
)

export const IntegrationCardDisconnected = ({
  icon,
  tool,
  description,
}: {
  icon: ReactNode
  tool: string
  description: string
}) => {
  return (
    <section className="col-span-1 md:col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4 relative cursor-pointer">
      <div className="w-6 h-6 shrink-0">
        {typeof icon === "string" ? (
          <img className="w-6 h-6 rounded-full" src={icon} alt="integration" />
        ) : (
          icon
        )}
      </div>
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-brand_dark">{tool}</h3>
          <DisconnectedIcon />
        </div>
        <p className="text-brand_gray text-sm mt-1">{description}</p>
      </div>
    </section>
  )
}

export const IntegrationCardDisabled = ({
  icon,
  tool,
  description,
}: {
  icon: ReactNode
  tool: string
  description: string
}) => {
  return (
    <section className="col-span-1 md:col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4 relative opacity-60 cursor-not-allowed">
      <div className="w-6 h-6 shrink-0">
        {typeof icon === "string" ? (
          <img className="w-6 h-6 rounded-full grayscale" src={icon} alt="integration" />
        ) : (
          icon
        )}
      </div>
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
    <section className="grid grid-cols-8 gap-6 my-4 md:my-6">
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
