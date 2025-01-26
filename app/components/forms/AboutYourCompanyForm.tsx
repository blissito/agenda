import { Form } from "react-router";
import { type FieldValues, useForm } from "react-hook-form";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";
import { BasicInput } from "./BasicInput";
import { MultipleOptions } from "./MultipleOptions";
import { PrimaryButton } from "../common/primaryButton";
import { twMerge } from "tailwind-merge";
import { useFetcher } from "react-router";
import { type Org } from "@prisma/client";

const OPTIONS = ["Solo yo", "2", "3 a 5", "6 a 14", "15 o más"];

export const AboutYourCompanyForm = ({ org }: { org: Org | null }) => {
  const fetcher = useFetcher();
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    // watch,
  } = useForm({
    mode: "onChange",
    defaultValues: org || {
      name: "",
      shopKeeper: "",
      numberOfEmployees: "",
      address: "",
    },
  });

  const onSubmit = (values: FieldValues) => {
    fetcher.submit(
      // about-your-company
      { intent: "update_org", data: JSON.stringify(values), next: "/signup/2" },
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
          "flex flex-col mx-auto max-w-xl h-full justify-start md:justify-center px-[5%] md:px-2 pt-12 md:pt-0 overflow-hidden"
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
          className="grid grid-cols-3 gap-4"
          defaultValue={org?.numberOfEmployees}
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
