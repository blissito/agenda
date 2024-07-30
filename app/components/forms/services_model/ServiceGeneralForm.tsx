import { Form, useFetcher } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BasicInput } from "../BasicInput";
import { TextAreaInput } from "../TextAreaInput";
import { PrimaryButton } from "~/components/common/primaryButton";
import { FaArrowLeftLong } from "react-icons/fa6";

// Type stuff
export const generalFormSchema = z.object({
  name: z.string(),
  price: z.coerce.number(),
  points: z.coerce.number().optional(),
  description: z.string(),
});
type GeneralFormFields = z.infer<typeof generalFormSchema>;
const initialValues: GeneralFormFields = {
  name: "",
  price: 0,
  points: 0,
  description: "",
};
/**
 * I'm experimenting again with declarative patterns (not using fetcher)
 * @submitButton Footer is required because this form has no submit button.
 * @abstract El prop footer es requerido ya que este formulario no cuenta con botón submit
 */
export const ServiceGeneralForm = ({
  defaultValues = initialValues,
}: {
  defaultValues?: GeneralFormFields;
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm({
    defaultValues,
  });
  const fetcher = useFetcher();

  const onSubmit = (values: GeneralFormFields) => {
    generalFormSchema.parse(values);
    fetcher.submit({ ...values, intent: "general_form" }, { method: "post" });
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      className="flex flex-col mx-auto max-w-xl  mt-14"
    >
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
        register={register}
        placeholder="Cuéntale a tus clientes sobre tu servicio"
        label="Descripción"
        name="description"
      />
      <ServiceFormFooter
        isLoading={fetcher.state !== "idle"}
        isDisabled={!isValid}
      />
    </Form>
  );
};

export const ServiceFormFooter = ({
  isDisabled,
  isLoading,
  backButtonLink = "/dash/servicios",
}: {
  backButtonLink?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}) => (
  <div className="items-center px-4 w-full max-w-[36rem] flex justify-between fixed bottom-8">
    <PrimaryButton
      type="button"
      className="bg-transparent text-brand_dark font-satoMiddle flex gap-2 items-center group transition-all"
      as="Link"
      to={backButtonLink}
    >
      <FaArrowLeftLong />
      <span className="group-hover:ml-1 transition-all">Volver</span>
    </PrimaryButton>
    <PrimaryButton isDisabled={isDisabled} isLoading={isLoading} type="submit">
      Continuar
    </PrimaryButton>
  </div>
);
