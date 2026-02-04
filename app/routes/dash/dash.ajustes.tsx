import { type ReactNode } from "react"
import { FaCheck } from "react-icons/fa6"
import { useLoaderData } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Switch } from "~/components/common/Switch"
import { BasicInput } from "~/components/forms/BasicInput"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import SelectStylized, { type Choice } from "~/components/ui/select"
import { SUPPORTED_TIMEZONES } from "~/utils/timezone"

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

export const loader = async () => {
  return {
    countries: COUNTRIES,
    timeZones: TIMEZONES,
    period: PERIOD,
    ranges: RANGES,
    times: TIMES,
  }
}

export default function Clients() {
  const { countries, timeZones } = useLoaderData<typeof loader>()
  return (
    <main className=" pb-10">
      <RouteTitle>Ajustes</RouteTitle>
      <section className=" bg-white rounded-2xl max-w-4xl pb-10 overflow-hidden">
        <div className="p-6 ">
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
            <p className=" text-brand_dark font-satoshi">
              {" "}
              <strong>Política de cancelación</strong>
            </p>
            <p className=" text-brand_gray font-satoshi text-sm">
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
          <p className=" text-brand_dark font-satoshi mt-4 mb-4">
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
          <p className=" text-brand_dark font-satoshi mt-6 mb-4">
            {" "}
            <strong className="font-satoMiddle">Videollamadas</strong>
          </p>
          <div className="grid  grid-cols-1 md:grid-cols-5 gap-6">
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
    </main>
  )
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
    <section className=" col-span-1 md:col-span-2 border-[1px] border-brand_stroke flex gap-3 w-auto rounded-2xl p-4 relative cursor-pointer group">
      <img className="w-6 h-6 rounded-full" src={icon} alt="social media" />
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-brand_dark">{tool}</h3>
          <div className=" bg-[#F1FCF7] h-4  rounded-full px-1 flex gap-1 justify-start items-center ">
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
    <section className="grid grid-cols-8 gap-6 my-6 ">
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
