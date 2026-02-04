import type { Org } from "@prisma/client"
import { useForm } from "react-hook-form"
import { Form, useFetcher } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { BasicInput } from "../BasicInput"
import { InputFile } from "../InputFile"

export const GeneralForm = ({
  onClose,
  defaultValues,
}: {
  onClose?: () => void
  defaultValues?: Org
}) => {
  const fetcher = useFetcher()
  const {
    register,
    formState: { isDirty, isValid },
    handleSubmit,
  } = useForm({ defaultValues, mode: "onChange" })

  const isDisabled = !isDirty || !isValid
  const isLoading = fetcher.state !== "idle"

  const submit = (values: Record<string, unknown>) => {
    fetcher.submit(
      {
        intent: "org_update",
        data: JSON.stringify({ ...values, id: defaultValues?.id }),
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
      <InputFile name="logo" className="w-[220px]">
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
      />
      <BasicInput
        name="address"
        placeholder="Av. Camps Elisés"
        label="Dirección de tu negocio (opcional)"
        register={register}
        registerOptions={{ required: false }}
      />
      <BasicInput
        as="textarea"
        name="description"
        placeholder="Cuéntale a tus clientes sobre tu negocio"
        label="Descripción"
        register={register}
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
