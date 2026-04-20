import { type RefObject, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Form } from "react-router"
import { z } from "zod"
import { SwitchOption } from "./ServicePhotoForm"
import { RadioButton } from "./ServiceTimesForm"

export const corceBooleanSchema = z
  .enum(["true", "false", "on"])
  .optional()
  .transform((value) => value === "true" || value === "on")

const configSchema = z.object({
  confirmation: corceBooleanSchema,
  reminder: corceBooleanSchema,
  survey: corceBooleanSchema,
})
export const serviceConfigFormSchema = z.object({
  payment: z.string().transform((value) => value === "true"),
  config: configSchema,
})
export const ServerServiceConfigFormSchema = z.object({
  payment: z.boolean(),
  config: z.object({
    confirmation: z.boolean(),
    reminder: z.boolean(),
    survey: z.boolean(),
  }),
})

type ServiceConfigFormFields = z.infer<typeof serviceConfigFormSchema>
export const ServiceConfigForm = ({
  formRef,
  errors,
  defaultValues = {
    payment: true,
    config: { confirmation: false, reminder: false, survey: false },
  },
  onPaymentSelected,
}: {
  errors?: Record<string, { message?: string }>
  formRef?: RefObject<HTMLFormElement>
  defaultValues?: ServiceConfigFormFields
  onPaymentSelected?: (selected: boolean) => void
}) => {
  const { register, watch } = useForm({
    defaultValues: {
      ...defaultValues,
      payment: undefined as unknown as string,
    },
  })

  const paymentValue = watch("payment")

  useEffect(() => {
    onPaymentSelected?.(paymentValue !== undefined && paymentValue !== null)
  }, [paymentValue])

  return (
    <Form ref={formRef}>
      <div className="text-brand_gray">
        <p className="text-brand_dark font-satoMiddle">
          ¿En que horario ofrecerás este servicio?
        </p>
        <RadioButton
          register={register}
          name="payment"
          value="true"
          label="Al agendar (tu cliente paga para poder reservar la sesión)"
        />
        <RadioButton
          register={register}
          name="payment"
          value="false"
          label="  Después de agendar (tu cliente no necesita pagar para reservar, podrás cobrarle en el establecimiento)"
        />
        <p className="text-red-500 text-xs">{errors?.payment?.message}</p>
        <p className="mt-6 md:mt-8 mb-2 text-brand_dark font-satoMiddle">
          ¿Qué notificaciones quieres que enviemos a tus clientes?
        </p>
        {errors?.config && <p className="text-xs text-red-500">Enciende una</p>}
        <div className="flex flex-col gap-4">
          <SwitchOption
            defaultChecked={defaultValues?.config.confirmation}
            register={register}
            name="confirmation"
            title="Mail de recordatorio"
            description="Lo enviaremos 12 hrs antes de la sesión"
            registerOptions={{ required: false }}
          />
          <SwitchOption
            defaultChecked={defaultValues?.config.reminder}
            register={register}
            name="reminder"
            title="Whats app de recordatorio"
            description="Lo enviaremos 4hrs antes de la sesión"
            registerOptions={{ required: false }}
          />
          <SwitchOption
            defaultChecked={defaultValues?.config.survey}
            register={register}
            name="survey"
            title="  Mail de evaluación"
            description="Lo enviaremos 10 min después de terminar la sesión"
            registerOptions={{ required: false }}
          />
        </div>
      </div>
    </Form>
  )
}
