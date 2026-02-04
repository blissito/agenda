import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import type { FieldError } from "react-hook-form"
import { FaArrowLeftLong } from "react-icons/fa6"
import { IoClose } from "react-icons/io5"
import { Link, useFetcher } from "react-router"
import type { ZodError } from "zod"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import {
  ServiceConfigForm,
  serviceConfigFormSchema,
} from "~/components/forms/services_model/ServiceConfigForm"
import {
  generalFormSchema,
  ServiceGeneralForm,
} from "~/components/forms/services_model/ServiceGeneralForm"
import {
  ServicePhotoForm,
  servicePhotoFormSchema,
} from "~/components/forms/services_model/ServicePhotoForm"
import {
  ServiceTimesForm,
  serviceTimesSchema,
} from "~/components/forms/services_model/ServiceTimesForm"
import { cn } from "~/utils/cn"
import { db } from "~/utils/db.server"
import type { WeekSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/new"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  let service
  const { org } = await getUserAndOrgOrRedirect(request)
  if (id && org) {
    service = await db.service.findUnique({
      where: {
        id,
        orgId: org.id,
      },
    })
  }
  return { id, service }
}

const formatErrors = (zodError: ZodError): Record<string, FieldError> => {
  return zodError.issues.reduce(
    (acc, err) => {
      const key = String(err.path[0])
      acc[key] = { type: err.code, message: err.message }
      return acc
    },
    {} as Record<string, FieldError>,
  )
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { id, service } = loaderData
  const [errors, setErrors] = useState<Record<string, FieldError>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const [index, setIndex] = useState(id ? 1 : 0)
  const [times, setTimes] = useState<WeekSchema>({})
  const [serviceId, setServiceId] = useState<string | null>(id)
  const fetcher = useFetcher()
  const intent = useMemo(() => {
    switch (index) {
      case 3:
        return "config_form"
      case 2:
        return "times_form"
      case 1:
        return "photo_form"
      default:
        return "general_form"
    }
  }, [index])

  const parse = (form: any) => {
    if (intent === "config_form") {
      const config = {
        confirmation: form.confirmation,
        remiinder: form.remiinder,
        survey: form.survey,
      }
      form.config = config // important!
      return serviceConfigFormSchema.safeParse(form)
    }
    if (intent === "times_form") {
      form.weekDays = times // important!
      return serviceTimesSchema.safeParse(form)
    }
    if (intent === "photo_form") {
      return servicePhotoFormSchema.safeParse(form)
    } else {
      return generalFormSchema.safeParse(form)
    }
  }

  const detonateSubmit = () => {
    let err = {}
    const fd = new FormData(formRef.current!)
    const form = Object.fromEntries(fd)
    const { success, error, data } = parse(form)
    if (success) {
      fetcher.submit(
        { data: JSON.stringify({ ...data, id: serviceId }), intent },
        { method: "post", action: "/api/services" },
      )
      setErrors(err)
      return
    }
    err = formatErrors(error)
    setErrors(err)
  }

  useEffect(() => {
    if (fetcher.data?.id) {
      setServiceId(fetcher.data.id)
    }
    if (fetcher.data?.nextIndex) {
      setIndex(fetcher.data.nextIndex)
    }
  }, [fetcher.data])

  return (
    <article className="h-screen bg-white fixed inset-0 pt-10 overflow-y-auto">
      <Link
        to="/dash/servicios"
        className="top-10 right-10 absolute bg-gray-100 p-1 rounded-full hover:bg-gray-200"
      >
        <IoClose />
      </Link>
      {index !== 4 && (
        <section className="max-w-xl mx-auto h-full flex flex-col">
          <h1 className="text-center text-2xl">
            ¡Empecemos! Describe tu servicio
          </h1>
          <Steper currentIndex={index} />
          {index === 0 && (
            <ServiceGeneralForm errors={errors} formRef={formRef} />
          )}
          {index === 1 && (
            <ServicePhotoForm
              defaultValues={{
                place: "ONLINE",
                isActive: true,
                allowMultiple: false,
              }}
              formRef={formRef}
            />
          )}
          {index === 2 && (
            <ServiceTimesForm
              onTimesChange={setTimes}
              defaultValues={{ duration: 30, weekDays: null }}
              formRef={formRef as React.RefObject<HTMLFormElement>}
            />
          )}
          {index === 3 && (
            <ServiceConfigForm
              formRef={formRef as React.RefObject<HTMLFormElement>}
            />
          )}
          <ServiceFormFooter onClick={detonateSubmit} />
        </section>
      )}
      {index === 4 && (
        <section className="flex flex-col justify-center gap-2 place-items-center h-full">
          <img src="/steper/pencil_paper.svg" />
          <h1 className="text-2xl">¡Tu servicio ha sido agregado!</h1>
          <p className="max-w-xl text-center text-lg">
            Tu servicio “{service?.name}” ya se ha creado. Edítalo desde la
            sección «Servicios».
          </p>
          <Link
            to="/dash/servicios"
            className="bg-gray-200 rounded-full shadow py-1 px-4"
          >
            {" "}
            Ver mis servicios
          </Link>
        </section>
      )}
    </article>
  )
}

const Steper = ({ currentIndex }: { currentIndex: number }) => {
  return (
    <nav className="flex items-center py-10 justify-center">
      <Number isActive={currentIndex === 0}>1</Number>
      <Dots />
      <Number isActive={currentIndex === 1}>2</Number>
      <Dots />
      <Number isActive={currentIndex === 2}>3</Number>
      <Dots />
      <Number isActive={currentIndex === 3}>4</Number>
    </nav>
  )
}

const Dots = () => {
  return (
    <hr className="w-20 border-b-0 border-[10px] border-gray-300 border-dotted" />
  )
}

const Number = ({
  isActive,
  children,
}: {
  isActive: boolean
  children: ReactNode
}) => {
  return (
    <p
      className={cn(
        "w-7 h-7 grid place-items-center bg-gray-300 text-gray-400 rounded-full mx-2",
        {
          "bg-brand_blue text-white": isActive,
        },
      )}
    >
      {children}
    </p>
  )
}

export const ServiceFormFooter = ({
  isDisabled,
  onClick,
  isLoading,
  backButtonLink = "/dash/servicios",
}: {
  onClick?: () => void
  backButtonLink?: string
  isLoading?: boolean
  isDisabled?: boolean
}) => (
  <footer className="items-center pb-4 px-4 w-full max-w-xl justify-between flex mt-auto">
    <PrimaryButton
      type="button"
      className="bg-transparent text-brand_dark font-satoMiddle flex gap-2 items-center group transition-all"
      as="Link"
      to={backButtonLink}
    >
      <FaArrowLeftLong />
      <span className="group-hover:ml-1 transition-all">Volver</span>
    </PrimaryButton>
    <PrimaryButton
      onClick={onClick}
      isDisabled={isDisabled}
      isLoading={isLoading}
      type="submit"
    >
      Continuar
    </PrimaryButton>
  </footer>
)
