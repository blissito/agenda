import type { Org } from "@prisma/client"
import { useState } from "react"
import { FiCheck, FiCopy, FiEdit2, FiGlobe } from "react-icons/fi"
import { IoQrCodeOutline } from "react-icons/io5"
import { twMerge } from "tailwind-merge"
import { PlantillaSelect } from "~/components/forms/website/Plantilla"
import { TemplateFormModal } from "~/components/ui/dialog"

export const Template = ({
  url,
  qr,
  org,
}: {
  org: Org
  qr: string
  url: string
}) => {
  return (
    <section className="col-span-6 xl:col-span-2 ">
      <div className="bg-white rounded-2xl overflow-hidden sticky top-8">
        <div className="bg-schedule w-full h-20 flex items-center justify-center px-6 text-white text-xl font-satoMiddle">
          Tu agenda esta lista... ¡Compártela!
        </div>
        <DomainCard org={org} url={url} qr={qr} />
        <hr className="bg-brand_stroke h-[1px] w-[94%] mx-auto border-none " />
        <div className="px-4 mt-4 pb-6">
          <p className="text-base text-brand_dark font-satoMiddle mb-3">
            Plantilla
          </p>
          <PlantillaSelect org={org} readOnly />
        </div>
      </div>
    </section>
  )
}

type OrgWithDomain = Org & {
  customDomain?: string | null
  customDomainStatus?: string | null
  customDomainDns?: unknown
}

const DomainCard = ({
  org,
  url,
  qr,
}: {
  org: OrgWithDomain
  url: string
  qr: string
}) => {
  const [copied, setCopied] = useState(false)
  const hasCustomDomain = !!org.customDomain
  const isActive = org.customDomainStatus === "active"

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <div className="px-4 py-4 relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-base text-brand_dark font-satoMiddle">
          Link de tu agenda
        </p>
        <div className="flex gap-3">
          <button onClick={handleCopy}>
            {copied ? (
              <FiCheck className="text-green-500" size={18} />
            ) : (
              <FiCopy
                className="text-brand_gray hover:text-brand_blue cursor-pointer"
                size={18}
              />
            )}
          </button>
          <a download="código_qr" href={qr} target="_blank" rel="noreferrer">
            <IoQrCodeOutline
              className="text-brand_gray hover:text-brand_blue cursor-pointer"
              size={18}
            />
          </a>
          <TemplateFormModal
            org={org}
            trigger={
              <FiEdit2
                size={18}
                className="text-brand_gray hover:text-brand_blue cursor-pointer"
                title="Configurar sitio web"
              />
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        {/* Dominio gratuito */}
        <div className="flex items-center gap-2 text-sm">
          <FiCheck className="text-green-500 flex-shrink-0" size={16} />
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-brand_blue hover:underline"
          >
            {org.slug}.denik.me
          </a>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            gratis
          </span>
        </div>

        {/* Dominio custom si existe */}
        {hasCustomDomain && (
          <div className="flex items-center gap-2 text-sm">
            {isActive ? (
              <FiCheck className="text-green-500" size={16} />
            ) : (
              <FiGlobe className="text-yellow-500" size={16} />
            )}
            <span className="text-brand_gray">{org.customDomain}</span>
            <span
              className={twMerge(
                "text-xs px-2 py-0.5 rounded-full",
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700",
              )}
            >
              {isActive ? "activo" : "pendiente"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
