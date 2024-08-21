import { Form, useFetcher } from "@remix-run/react";
import { SwitchOption } from "./ServicePhotoForm";
import { RadioButton } from "./ServiceTimesForm";
import { ServiceFormFooter } from "./ServiceGeneralForm";
import { useForm } from "react-hook-form";
import { isValid, z } from "zod";

const configSchema = z.object({
  confirmation: z.boolean().default(true),
  reminder: z.boolean().default(true),
  survey: z.boolean().default(true),
});
export const serviceConfigFormSchema = z.object({
  payment: z.string().transform((value) => value === "true"),
  config: configSchema,
});

type ServiceConfigFormFields = z.infer<typeof serviceConfigFormSchema>;
const initialConfigValues = {
  payment: "false",
  config: {
    confirmation: true,
    reminder: true,
    survey: true,
  },
};
export const ServiceConfigForm = ({
  backButtonLink,
  defaultValues = initialConfigValues,
}: {
  backButtonLink?: string;
  defaultValues?: ServiceConfigFormFields;
}) => {
  const fetcher = useFetcher();
  const {
    // getValues,
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      ...defaultValues,
      payment: defaultValues.payment === true ? "true" : "false", // @TODO: improve
    },
  });
  // console.log("Default", defaultValues);
  const onSubmit = (values: ServiceConfigFormFields) => {
    fetcher.submit(
      { data: JSON.stringify(values), intent: "update_service" },
      { method: "post" }
    );
  };
  // @TODO: fix switches
  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mt-14">
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
        <p className="text-red-500 text-xs">{errors.payment}</p>
        <p className="mt-8 mb-3 text-brand_dark font-satoMiddle">
          ¿Qué notificaciones quieres que enviemos a tus clientes?
        </p>
        <SwitchOption
          setValue={setValue}
          defaultChecked={defaultValues.config.confirmation}
          register={register}
          name="config.confirmation"
          title="Mail de confirmación"
          description="Lo enviaremos en cuanto se complete la reservación"
          registerOptions={{ required: false }}
        />
        <SwitchOption
          setValue={setValue}
          defaultChecked={defaultValues.config.reminder}
          register={register}
          name="config.reminder"
          title="Whats app de recordatorio"
          description="Lo enviaremos 4hrs antes de la sesión"
          registerOptions={{ required: false }}
        />

        <SwitchOption
          setValue={setValue}
          defaultChecked={defaultValues.config.survey}
          register={register}
          name="config.survey"
          title="  Mail de evaluación"
          description="Lo enviaremos 10 min después de terminar la sesión"
          registerOptions={{ required: false }}
        />
      </div>
      <ServiceFormFooter
        isLoading={fetcher.state !== "idle"}
        isDisabled={!isValid}
        backButtonLink={backButtonLink}
      />
    </Form>
  );
};
