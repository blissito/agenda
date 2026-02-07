import type { Org, Service } from "@prisma/client"
import { formatRange } from "~/components/common/FormatRange"
import { DAY_LABELS, WEEK_DAYS } from "~/utils/weekDays"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { Facebook } from "~/components/icons/facebook"
import { Instagram } from "~/components/icons/insta"
import { Anchor } from "~/components/icons/link"
import { Linkedin } from "~/components/icons/linkedin"
import { Tiktok } from "~/components/icons/tiktok"
import { Twitter } from "~/components/icons/twitter"
import { Youtube } from "~/components/icons/youtube"
import { GeneralFormModal } from "~/components/ui/modals/GeneralFormModal"
import { ServicesFormModal } from "~/components/ui/modals/ServicesFormModal"
import { SocialDataFormModal } from "~/components/ui/modals/SocialDataFormModal"
import { TimesFormModal } from "~/components/ui/modals/TimesFormModal"
import { getServicePublicUrl } from "~/utils/urls"
import { InfoBox } from "./InfoBox"
import { InfoService } from "./InfoService"
import { MediaBox } from "./MediaBox"

type PartialService = Pick<
  Service,
  "id" | "name" | "photoURL" | "slug" | "isActive"
>

type LogoAction = {
  putUrl: string
  removeUrl: string
  readUrl?: string
  logoKey: string
}

export const CompanyInfo = ({
  services = [],
  isPublic,
  org,
  logoAction,
}: {
  isPublic?: boolean
  services?: PartialService[]
  org: Org
  logoAction?: LogoAction
}) => {
  const weekDays = org.weekDays
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 col-span-6 xl:col-span-4 order-last xl:order-first">
      <div className="flex justify-between items-center">
        {" "}
        <h2 className="text-2xl font-bold">{org?.name} </h2>
        {!isPublic && (
          <GeneralFormModal org={org} logoAction={logoAction}>
            <SecondaryButton as="span" className="h-10">
              Editar
            </SecondaryButton>
          </GeneralFormModal>
        )}
      </div>

      <InfoBox title="Encargad@" value={org?.shopKeeper} />
      <InfoBox title="Teléfono" value="55 662 66 66" />
      <InfoBox title="Dirección" value={org?.address} />
      <InfoBox title="Descripción" value={org?.description} />
      <hr className="bg-brand_stroke my-6" />

      <div className="flex justify-between items-center">
        {" "}
        <h3 className="text-lg font-bold">Horario</h3>
        {!isPublic && (
          <TimesFormModal org={org}>
            <SecondaryButton as="span" className="h-10">
              Editar
            </SecondaryButton>
          </TimesFormModal>
        )}
      </div>
      {/* times */}
      {WEEK_DAYS.map((day) => (
        <InfoBox
          key={day}
          title={DAY_LABELS[day]}
          value={formatRange((weekDays as any)?.[day] as [string, string][])}
        />
      ))}
      <hr className="bg-brand_stroke my-6" />

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Servicios</h3>
        {!isPublic && (
          <ServicesFormModal services={services as Service[]}>
            <SecondaryButton as="span" className="h-10">
              Editar
            </SecondaryButton>
          </ServicesFormModal>
        )}
      </div>
      <div className="flex gap-x-6 flex-wrap pr-[10%]">
        {services.map((s) => (
          <InfoService
            title={s.name ?? "untitled"}
            link={
              s.isActive ? getServicePublicUrl(org.slug, s.slug) : undefined
            }
            image={s.photoURL ?? undefined}
            key={s.id}
            isActive={s.isActive}
          />
        ))}
      </div>
      <hr className="bg-brand_stroke my-6" />
      <div className="flex justify-between items-center">
        {" "}
        <h3 className="text-lg font-bold">Redes sociales</h3>
        {!isPublic && (
          <SocialDataFormModal org={org}>
            <SecondaryButton as="span" className="h-10">
              Editar
            </SecondaryButton>
          </SocialDataFormModal>
        )}
      </div>

      <MediaBox icon={<Facebook />} link={org?.social?.facebook} />

      <MediaBox icon={<Instagram />} link={org?.social?.instagram} />
      <MediaBox icon={<Twitter />} link={org?.social?.x} />

      <MediaBox icon={<Tiktok />} link={org?.social?.tiktok} />
      <MediaBox icon={<Youtube />} link={org?.social?.youtube} />
      <MediaBox icon={<Linkedin />} link={org?.social?.linkedin} />

      <MediaBox icon={<Anchor />} link={org?.social?.website} />
    </div>
  )
}
