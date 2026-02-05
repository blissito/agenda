import type { Org } from "@prisma/client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Form, useFetcher } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { AddressAutocomplete } from "../AddressAutocomplete"
import { BasicInput } from "../BasicInput"
import { InputFile } from "../InputFile"

type LogoAction = {
  putUrl: string
  removeUrl: string
  readUrl: string
  logoKey: string
}

export const GeneralForm = ({
  onClose,
  defaultValues,
  logoAction,
}: {
  onClose?: () => void
  defaultValues?: Org
  logoAction?: LogoAction
}) => {
  const fetcher = useFetcher()
  const {
    register,
    formState: { isDirty, isValid },
    handleSubmit,
  } = useForm({ defaultValues, mode: "onChange" })

  const [addressData, setAddressData] = useState<{
    address: string
    lat: number | null
    lng: number | null
    hasChanged: boolean
  }>({
    address: defaultValues?.address ?? "",
    lat: defaultValues?.lat ?? null,
    lng: defaultValues?.lng ?? null,
    hasChanged: false,
  })

  const [logoKey, setLogoKey] = useState<string | null>(
    defaultValues?.logo ?? null,
  )
  const [logoChanged, setLogoChanged] = useState(false)

  const isDisabled = !isDirty && !addressData.hasChanged && !logoChanged
  const isLoading = fetcher.state !== "idle"

  const submit = (values: Record<string, unknown>) => {
    const dataToSend = {
      ...values,
      id: defaultValues?.id,
      address: addressData.address || values.address,
      lat: addressData.lat,
      lng: addressData.lng,
      logo: logoKey,
    }
    fetcher.submit(
      {
        intent: "org_update",
        data: JSON.stringify(dataToSend),
      },
      { method: "post", action: "/api/org" },
    )
    onClose?.()
  }

  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className="bg-white rounded-2xl w-3xl"
    >
      <h2
        className="font-satoMiddle mb-8 text-xl
        "
      >
        Información General
      </h2>
      <input type="hidden" name="id" value={defaultValues?.id} />
      <input type="hidden" name="redirectURL" value={`/dash/website`} />
      <InputFile
        name="logo"
        className="w-[220px]"
        action={logoAction}
        onUploadComplete={(key) => {
          setLogoKey(key)
          setLogoChanged(true)
        }}
        onDelete={() => {
          setLogoKey(null)
          setLogoChanged(true)
        }}
      >
        <p className="hover:scale-105 transition-all"> Arrastra tu logo</p>
      </InputFile>
      <BasicInput
        placeholder="Estudio Westeros"
        label="Nombre de tu negocio"
        name="name"
        register={register}
      />
      <BasicInput
        placeholder="Estudio Westeros"
        label="Tu nombre o del profesional que atiende tu negocio"
        name="shopKeeper"
        register={register}
        registerOptions={{ required: false }}
      />
      <AddressAutocomplete
        name="address"
        placeholder="Av. Camps Elisés"
        label="Dirección de tu negocio (opcional)"
        defaultValue={defaultValues?.address ?? ""}
        defaultLat={defaultValues?.lat}
        defaultLng={defaultValues?.lng}
        onSelect={(result) => {
          setAddressData({
            address: result.address,
            lat: result.lat,
            lng: result.lng,
            hasChanged: true,
          })
        }}
      />
      <BasicInput
        as="textarea"
        name="description"
        placeholder="Cuéntale a tus clientes sobre tu negocio"
        label="Descripción"
        register={register}
        registerOptions={{ required: false }}
      />
      <div className="flex mt-16 justify-center gap-6 sticky bottom-0 bg-white py-4">
        <SecondaryButton className="w-[120px]" onClick={onClose}>
          Cancelar
        </SecondaryButton>
        <PrimaryButton
          name="intent"
          value="org_update"
          type="submit"
          isDisabled={isDisabled}
          isLoading={isLoading}
        >
          Guardar
        </PrimaryButton>
      </div>
    </Form>
  )
}
