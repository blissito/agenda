import type { User } from "@prisma/client"
import { type RefObject, useEffect } from "react"
import {
  type FieldError,
  type FieldValues,
  type UseFormRegister,
  useForm,
} from "react-hook-form"
import { Form, useFetcher } from "react-router"
import { z } from "zod"
import { BasicInput } from "../BasicInput"
import { SelectInput } from "../SelectInput"
import { TextAreaInput } from "../TextAreaInput"

// Type stuff
export const generalFormSchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio" })
    .min(1, "El nombre es obligatorio"),
  price: z.coerce
    .number({ error: "Ingresa un precio válido" })
    .min(0, "El precio debe ser mayor o igual a 0"),
  points: z.coerce.number().optional(),
  employeeName: z.string().optional(),
  description: z
    .string({ error: "La descripción es obligatoria" })
    .min(5, "La descripción debe tener al menos 5 caracteres"),
})
export type GeneralFormFields = z.infer<typeof generalFormSchema>
const initialValues: GeneralFormFields = {
  name: "",
  price: Infinity,
  points: 10,
  description: "",
}
/**
 * I'm experimenting again with declarative patterns (not using fetcher)
 * @submitButton Footer is required because this form has no submit button.
 * @abstract El prop footer es requerido ya que este formulario no cuenta con botón submit
 */
export const ServiceGeneralForm = ({
  defaultValues = initialValues,
  onSubmit,
  formRef,
  errors = {},
  loyaltyEnabled = false,
}: {
  errors?: Record<string, FieldError>
  formRef?: RefObject<HTMLFormElement | null>
  onSubmit?: (values: GeneralFormFields) => void
  defaultValues?: GeneralFormFields
  loyaltyEnabled?: boolean
}) => {
  const { handleSubmit, register } = useForm({
    defaultValues,
  })

  // Si la org tiene más de un colaborador, dejamos elegir el encargado del servicio
  const employeesFetcher = useFetcher<{ employees?: User[] }>()
  useEffect(() => {
    employeesFetcher.load("/api/employees")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const employees = employeesFetcher.data?.employees ?? []
  const showEmployeeSelect = employees.length > 1
  const submit = (values: GeneralFormFields) => {
    const parsedVals = generalFormSchema.parse(values) as GeneralFormFields // revisit
    // fetcher.submit({ ...values, intent: "general_form" }, { method: "post" });
    onSubmit?.(parsedVals)
  }

  return (
    <Form
      ref={formRef}
      onSubmit={handleSubmit(submit)}
      method="post"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <BasicInput
          error={errors.name}
          register={register}
          label="Nombre del servicio"
          name="name"
        />
        <BasicInput // @TODO_BRENDI: improve to a Money input
          error={errors.price}
          register={register}
          placeholder="$0.00"
          label="Precio"
          name="price"
          type="number"
        />
      </div>
      {showEmployeeSelect && (
        <SelectInput
          name="employeeName"
          register={register}
          registerOptions={{ required: false }}
          label="Encargado del servicio (opcional)"
          placeholder="Sin encargado asignado"
          options={employees.map((e) => {
            const label = e.displayName || e.email || ""
            return { value: label, title: label }
          })}
        />
      )}
      {loyaltyEnabled && (
        <BasicInput
          error={errors.points}
          registerOptions={{ required: false }}
          register={register}
          placeholder="100"
          label="¿A cuántos puntos de lealtad equivale el servicio?"
          name="points"
        />
      )}
      <TextAreaInput
        error={errors.description}
        register={register as unknown as UseFormRegister<FieldValues>}
        placeholder="Cuéntale a tus clientes sobre tu servicio"
        label="Descripción"
        name="description"
      />
    </Form>
  )
}
