import { Form, useFetcher } from "react-router";
import { SwitchOption } from "./ServicePhotoForm";
import { RadioButton } from "./ServiceTimesForm";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import type { RefObject } from "react";

export const corceBooleanSchema = z
  .enum(["true", "false", "on"])
  .optional()
  .transform((value) => value === "true" || value === "on");

const configSchema = z.object({
  confirmation: corceBooleanSchema,
  reminder: corceBooleanSchema,
  survey: corceBooleanSchema,
});
export const serviceConfigFormSchema = z.object({
  payment: z.string().transform((value) => value === "true"),
  config: configSchema,
});
export const ServerServiceConfigFormSchema = z.object({
  payment: z.boolean(),
  config: z.object({
    confirmation: z.boolean(),
    reminder: z.boolean(),
    survey: z.boolean(),
  }),
});

type ServiceConfigFormFields = z.infer<typeof serviceConfigFormSchema>;
export const ServiceConfigForm = ({
  formRef,
  errors,
  defaultValues = { payment: true, config: {} },
}: {
  errors?: Record<string, ZodError>;
  formRef?: RefObject<HTMLFormElement>;
  defaultValues?: ServiceConfigFormFields;
}) => {
  const { register } = useForm({
    defaultValues,
  });

  return (
    <Form ref={formRef} className="mt-14">
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
        <p className="mt-8 mb-2 text-brand_dark font-satoMiddle">
          ¿Qué notificaciones quieres que enviemos a tus clientes?
        </p>
        {errors?.config && <p className="text-xs text-red-500">Enciende una</p>}
        <SwitchOption
          defaultChecked={defaultValues?.config.confirmation}
          register={register}
          registerOptions={{ required: false }}
          name="confirmation"
          title="Mail de confirmación"
          description="Lo enviaremos en cuanto se complete la reservación"
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
    </Form>
  );
};
