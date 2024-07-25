import { Form } from "@remix-run/react";
import { FieldValues, useForm } from "react-hook-form";
import { REQUIRED_MESSAGE, SLUGS } from "~/routes/signup.$stepSlug";
import { BasicInput } from "./BasicInput";
import { MultipleOptions } from "./MultipleOptions";
import { PrimaryButton } from "../common/primaryButton";
import { twMerge } from "tailwind-merge";
import { useFetcher } from "react-router-dom";

const OPTIONS = ["Solo yo", "2", "3 a 5", "6 a 14", "15 o más"];

export const AboutYourCompanyForm = () => {
  const fetcher = useFetcher();
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    // watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      shopKeeper: "",
      numberOfEmployees: "",
      address: "",
    },
  });

  const onSubmit = (values: FieldValues) => {
    fetcher.submit(
      // about-your-company
      { intent: SLUGS[0], data: JSON.stringify(values) },
      { method: "post" }
    );
  };

  const isDisabled = !isValid;

  return (
    <>
      <Form
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        className={twMerge(
          "relative",
          "flex flex-col mx-auto max-w-xl h-full justify-center px-2"
        )}
      >
        <BasicInput
          label="¿Cómo se llama tu negocio?"
          name="name"
          error={errors["name"]}
          register={register}
          registerOptions={{ required: REQUIRED_MESSAGE }}
        />
        <BasicInput
          name="shopKeeper"
          register={register}
          registerOptions={{ required: REQUIRED_MESSAGE }}
          label="Tu nombre o del profesional que atiende tu negocio"
          error={errors["shopKeeper"]}
        />
        <BasicInput
          name="address"
          registerOptions={{ required: false }}
          label="Dirección de tu negocio (opcional)"
          error={errors["address"]}
          register={register}
        />
        <MultipleOptions
          className="grid grid-cols-3 gap-4 "
          defaultValue={null}
          error={errors["numberOfEmployees"]}
          label="¿Cuantas personas trabajan en tu negocio?"
          name="numberOfEmployees"
          options={OPTIONS}
          register={register}
        />
        <AbsoluteCentered className="px-2 pb-8">
          <PrimaryButton
            isDisabled={isDisabled}
            isLoading={fetcher.state !== "idle"}
            type="submit"
          >
            Continuar
          </PrimaryButton>
        </AbsoluteCentered>
      </Form>
    </>
  );
};

export const AbsoluteCentered = ({
  className,
  ...props
}: {
  className?: string;
  [props: string]: unknown;
}) => (
  <div
    className={twMerge(
      "absolute bottom-0 w-full left-0 flex flex-col",
      className
    )}
    {...props}
  />
);
