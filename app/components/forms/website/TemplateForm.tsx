import type { Org } from "@prisma/client"
import { useState } from "react"
import { useFetcher } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { ColorInput } from "./ColorInput"
import { CustomDomainSection } from "./CustomDomainSection"
import { Plantilla } from "./Plantilla"
import { UsernameInput } from "./UserNameInput"

type OrgWithDomain = Org & {
  customDomain?: string | null
  customDomainStatus?: string | null
  customDomainDns?: unknown
}

export const TemplateForm = ({
  org,
  onClose,
}: {
  onClose?: () => void
  org: OrgWithDomain
}) => {
  const [template, setTemplate] = useState<string>(
    org.websiteConfig?.template ?? "defaultTemplate",
  )
  const [color, setColor] = useState<string>(
    org.websiteConfig?.color ?? "#705fe0",
  )
  const fetcher = useFetcher()

  const handleSubmit = () => {
    fetcher.submit(
      {
        data: JSON.stringify({
          id: org.id,
          websiteConfig: { template, color },
        }),
        intent: "org_update",
      },
      { method: "POST", action: "/api/org" },
    )
    onClose?.()
  }

  return (
    <article className="grid">
      <h2 className=" font-satoMiddle text-brand_dark text-2xl mb-8 ">
        Sitio web
      </h2>
      <UsernameInput org={org} />
      <hr className="bg-brand_stroke h-[1px] border-none my-6" />
      <Plantilla value={template} onChange={setTemplate} />
      <ColorInput value={color} onChange={setColor} />
      <hr className="bg-brand_stroke h-[1px] border-none my-6" />
      <CustomDomainSection org={org} />
      <nav className="flex mt-16 mb-6 justify-end gap-6">
        <SecondaryButton className="w-[120px]" onClick={onClose}>
          Cancelar
        </SecondaryButton>
        <PrimaryButton
          className="w-[120px]"
          onClick={handleSubmit}
          isLoading={fetcher.state !== "idle"}
        >
          Actualizar
        </PrimaryButton>
      </nav>
    </article>
  )
}
