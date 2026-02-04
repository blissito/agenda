import type { RefObject } from "react"
import {
  type FieldError,
  type FieldValues,
  type UseFormRegister,
  useForm,
} from "react-hook-form"
import { Form } from "react-router"
import { z } from "zod"
import { BasicInput } from "../BasicInput"
import { TextAreaInput } from "../TextAreaInput"

// Type stuff
export const generalFormSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  points: z.coerce.number().optional(),
  description: z.string().min(5),
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
}: {
  errors?: Record<string, FieldError>
  formRef?: RefObject<HTMLFormElement | null>
  onSubmit?: (values: GeneralFormFields) => {}
  defaultValues?: GeneralFormFields
}) => {
  const {
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm({
    defaultValues,
  })
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
      className="flex flex-col gap-4"
    >
      <div className="flex gap-6">
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
      {/* <SelectInput
        label="Categoría"
        options={OPTIONS.map((o) => ({ value: o, title: o }))}
      /> */}
      <BasicInput
        error={errors.points}
        registerOptions={{ required: false }}
        register={register}
        placeholder="100"
        label="¿A cuántos puntos de recompensas equivale el servicio?"
        name="points"
      />
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
