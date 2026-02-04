import { useForm } from "react-hook-form";
import { Form, useFetcher } from "react-router";
import { BasicInput } from "../BasicInput";
import { PrimaryButton } from "~/components/common/primaryButton";
import type { Customer } from "@prisma/client";

export const ClientForm = ({ onFetch }: { onFetch?: () => void }) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      displayName: "",
      email: "",
      tel: "",
      comments: "",
    },
  });
  const fetcher = useFetcher();
  const onSubmit = async (values: Partial<Customer>) => {
    // @todo validate
    await fetcher.submit(
      {
        data: JSON.stringify(values),
      },
      {
        method: "post",
        action: "/api/customers?intent=new",
      }
    );
    onFetch?.();
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col grow">
      <h3 className="text-lg font-bold mb-6 text-brand_dark">Cuéntanos sobre ti</h3>
      <BasicInput
        name="displayName"
        label="Nombre"
        placeholder="Nombre completo"
        register={register}
        error={errors["displayName"]}
      />
      <div className="flex justify-between gap-4 flex-col md:flex-row">
        <BasicInput
          name="email"
          label="Email"
          type="email"
          placeholder="ejemplo@ejemplo.com"
          register={register}
        />
        <BasicInput
          label="Teléfono"
          name="tel"
          placeholder="555 555 55 66"
          register={register}
          registerOptions={{ required: false }}
        />
      </div>
      <BasicInput
        register={register}
        name="comments"
        label="Notas o comentarios"
        as="textarea"
        placeholder="Cualquier cosa que ayude a prepararnos para nuestra cita."
        registerOptions={{ required: false }}
      />
      <PrimaryButton
        isLoading={fetcher.state !== "idle"}
        isDisabled={!isValid}
        type="submit"
        className="ml-auto mr-6 mb-6 mt-14 hover:shadow-md"
      >
        Guardar
      </PrimaryButton>
    </Form>
  );
};
