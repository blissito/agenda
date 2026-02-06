import type { Org, Service } from "@prisma/client"
import { PrimaryButton } from "~/components/common/primaryButton"
import { ServiceList } from "~/components/forms/agenda/DateAndTimePicker"
import type { SupportedTimezone } from "~/utils/timezone"
import { getPublicImageUrl } from "~/utils/urls"

const example =
  "https://img.freepik.com/vector-gratis/vector-degradado-logotipo-colorido-pajaro_343694-1365.jpg?size=338&ext=jpg"

// Partial org type for components that don't need full Prisma type
type OrgLike = Pick<Org, "name"> & { logo?: string | null; [key: string]: unknown }
type ServiceLike = Pick<Service, "name"> & { [key: string]: unknown }

export const Header = ({ org }: { org: OrgLike }) => {
  return (
    <div className="flex gap-3 items-center justify-center py-12">
      <img
        className="w-10 h-10 rounded-full object-cover"
        alt="org logo"
        src={getPublicImageUrl(org?.logo) || example}
      />
      <h1 className="font-bold text-2xl text-brand_dark">{org?.name}</h1>
    </div>
  )
}

export const InfoShower = ({
  org,
  service,
  date,
  timezone,
}: {
  org: OrgLike
  service: ServiceLike
  date?: Date
  timezone?: SupportedTimezone
}) => {
  return (
    <>
      <div className="w-full min-w-[260px] max-w-[260px]">
        <span className="text-brand_gray text-sm font-medium">{org?.name}</span>
        <h2 className="text-2xl font-satoMiddle mb-5 text-brand_dark">
          {service?.name}
        </h2>
        <ServiceList
          org={org}
          service={service}
          date={date}
          timezone={timezone}
        />
      </div>
      <hr className="border-l-brand_gray/10 md:my-0 md:h-96 md:w-1 w-full my-4 mx-10 border-l md:mr-8 " />
    </>
  )
}

type FooterProps = {
  errors?: Record<string, { message?: string }>
  isLoading: boolean
  onSubmit: () => void
  isValid?: boolean
}

export const Footer = ({
  errors = {},
  isLoading,
  onSubmit,
  isValid = false,
}: FooterProps) => {
  return (
    <>
      <p className="text-red-500 ml-auto text-xs pr-8 text-right h-1">
        {errors?.time?.message}
        {errors.date?.message}
      </p>
      <PrimaryButton
        isLoading={isLoading}
        isDisabled={!isValid}
        onClick={onSubmit}
        className="ml-auto mr-6 mb-6 mt-14"
      >
        Continuar
      </PrimaryButton>
      <img
        alt="denik markwater"
        className="absolute right-0 bottom-0 z-0 hidden md:block lg:w-[30%] xl:w-auto pointer-events-none"
        src="/images/denik-markwater.png"
      />
    </>
  )
}
