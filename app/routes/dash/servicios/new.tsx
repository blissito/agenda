import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import type { FieldError } from "react-hook-form"
import { FaArrowLeftLong } from "react-icons/fa6"
import { IoClose } from "react-icons/io5"
import { Link, useFetcher } from "react-router"
import type { ZodError } from "zod"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { EmojiConfetti } from "~/components/common/EmojiConfetti"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import {
  ServiceConfigForm,
  serviceConfigFormSchema,
} from "~/components/forms/services_model/ServiceConfigForm"
import {
  generalFormSchema,
  ServiceGeneralForm,
} from "~/components/forms/services_model/ServiceGeneralForm"
import {
  type PhotoAction,
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
  const levelsCount = org
    ? await db.loyaltyLevel.count({ where: { orgId: org.id } })
    : 0
  return {
    id,
    service,
    orgAddress: org?.address ?? null,
    loyaltyEnabled: !!org?.loyaltyEnabled && levelsCount > 0,
  }
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
  const { id, service, orgAddress, loyaltyEnabled } = loaderData
  const [errors, setErrors] = useState<Record<string, FieldError>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const [index, setIndex] = useState(id ? 1 : 0)
  const [times, setTimes] = useState<WeekSchema>({})
  const [serviceId, setServiceId] = useState<string | null>(id)
  const [serviceName, setServiceName] = useState<string>(service?.name || "")
  const [photoAction, setPhotoAction] = useState<PhotoAction | undefined>()
  const [addressWarning, setAddressWarning] = useState(false)
  const [paymentSelected, setPaymentSelected] = useState(false)
  const fetcher = useFetcher()
  const photoUrlsFetcher = useFetcher<{ photoAction?: PhotoAction }>()
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
        reminder: form.reminder,
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
      if (intent === "general_form" && typeof (data as any).name === "string") {
        setServiceName((data as any).name)
      }
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

  // Fetch photo upload URLs when we have serviceId and move to step 1
  useEffect(() => {
    if (serviceId && index === 1 && !photoAction) {
      photoUrlsFetcher.load(
        `/api/services?intent=get_photo_urls&serviceId=${serviceId}`,
      )
    }
  }, [serviceId, index, photoAction])

  // Update photoAction when fetcher returns data
  useEffect(() => {
    if (photoUrlsFetcher.data?.photoAction) {
      setPhotoAction(photoUrlsFetcher.data.photoAction)
    }
  }, [photoUrlsFetcher.data])

  return (
    <article className="h-screen bg-white fixed inset-0 pt-14 md:pt-10 overflow-y-auto z-[600]">
      <Link
        to="/dash/servicios"
        aria-label="Cerrar"
        className="absolute right-4 top-4 md:right-10 md:top-10 text-brand_gray rounded-full border border-ash h-8 w-8 flex items-center justify-center transition-all active:scale-95"
      >
        <IoClose className="text-2xl" />
      </Link>
      {index !== 4 && (
        <section className="max-w-xl mx-auto h-full flex flex-col px-4 md:px-0">
          <h1 className="text-center text-xl md:text-2xl">
            ¡Empecemos! Describe tu servicio
          </h1>
          <Steper currentIndex={index} />
          {index === 0 && (
            <ServiceGeneralForm
              errors={errors}
              formRef={formRef}
              loyaltyEnabled={loyaltyEnabled}
            />
          )}
          {index === 1 && (
            <ServicePhotoForm
              photoAction={photoAction}
              orgAddress={orgAddress}
              defaultValues={{
                place: service?.place || "ONLINE",
                isActive: service?.isActive ?? true,
                allowMultiple: false,
                gallery: service?.gallery?.[0] || "",
              }}
              formRef={formRef}
              onAddressWarningChange={setAddressWarning}
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
              onPaymentSelected={setPaymentSelected}
            />
          )}
          <ServiceFormFooter
            onClick={detonateSubmit}
            isDisabled={addressWarning || (index === 3 && !paymentSelected)}
            onBack={index > 0 ? () => setIndex(index - 1) : undefined}
          />
        </section>
      )}
      {index === 4 && (
        <section className="flex flex-col justify-center gap-2 place-items-center h-full px-4 text-center">
          <EmojiConfetti />
          <img src="/steper/pencil_paper.svg" className="w-[200px] md:w-auto" />
          <h1 className="text-xl md:text-2xl font-satoBold">
            ¡Tu servicio ha sido agregado!
          </h1>
          <p className="max-w-xl text-base md:text-lg text-brand_gray">
            Tu servicio{" "}
            <span className="font-satoBold">
              “{serviceName || service?.name}”
            </span>{" "}
            está listo para recibir clientes.
          </p>
          <SecondaryButton
            as="Link"
            to="/dash/servicios"
            className="mt-8 md:mt-12"
          >
            Ir a mis servicios
          </SecondaryButton>
        </section>
      )}
    </article>
  )
}

const Steper = ({ currentIndex }: { currentIndex: number }) => {
  return (
    <nav className="flex items-center py-6 md:py-10 justify-center">
      <StepNumber isActive={currentIndex >= 0}>1</StepNumber>
      <Dots isActive={currentIndex >= 1} />
      <StepNumber isActive={currentIndex >= 1}>2</StepNumber>
      <Dots isActive={currentIndex >= 2} />
      <StepNumber isActive={currentIndex >= 2}>3</StepNumber>
      <Dots isActive={currentIndex >= 3} />
      <StepNumber isActive={currentIndex >= 3}>4</StepNumber>
    </nav>
  )
}

const Dots = ({ isActive }: { isActive?: boolean }) => {
  return (
    <hr
      className={`w-8 md:w-20 border-0 border-t-[8px] md:border-t-[10px] border-dotted ${
        isActive ? "border-brand_blue" : "border-gray-300"
      }`}
    />
  )
}

const StepNumber = ({
  isActive,
  children,
}: {
  isActive: boolean
  children: ReactNode
}) => {
  return (
    <p
      className={cn(
        "w-7 h-7 grid place-items-center bg-gray-300 text-gray-400 rounded-full mx-1 md:mx-2 shrink-0 text-sm",
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
  onBack,
  backButtonLink = "/dash/servicios",
}: {
  onClick?: () => void
  onBack?: () => void
  backButtonLink?: string
  isLoading?: boolean
  isDisabled?: boolean
}) => (
  <footer className="items-center pb-4 pt-4 px-0 md:px-4 w-full max-w-xl justify-between flex mt-auto gap-2">
    {onBack ? (
      <PrimaryButton
        type="button"
        className="bg-transparent text-brand_dark font-satoMiddle flex gap-2 items-center group transition-all"
        onClick={onBack}
      >
        <FaArrowLeftLong />
        <span className="group-hover:ml-1 transition-all">Volver</span>
      </PrimaryButton>
    ) : (
      <PrimaryButton
        type="button"
        className="bg-transparent text-brand_dark font-satoMiddle flex gap-2 items-center group transition-all"
        as="Link"
        to={backButtonLink}
      >
        <FaArrowLeftLong />
        <span className="group-hover:ml-1 transition-all">Volver</span>
      </PrimaryButton>
    )}
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
