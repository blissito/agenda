import { FieldValues, useForm, UseFormRegister } from "react-hook-form";
import { InputFile } from "../InputFile";
import { AddImage } from "~/components/icons/addImage";
import { Option, SelectInput } from "../SelectInput";
import { BasicInput } from "../BasicInput";
import { Switch } from "../Switch";
import { ServiceFormFooter } from "./ServiceGeneralForm";
import { isValid } from "zod";
import { Form } from "@remix-run/react";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";

const OPTIONS: Option[] = [
  {
    value: "INPLACE",
    title: "En local comercial",
  },
  {
    value: "ONLINE",
    title: "En linea",
  },
  {
    value: "ATHOME",
    title: "A domicilio",
  },
];

type ServicePhotoFormFields = { place: string; seats: string };
const initialPhotoValues = { place: "", seats: "" };
export const ServicePhotoForm = ({
  defaultValues = initialPhotoValues,
  backButtonLink,
}: {
  backButtonLink?: string;
  defaultValues?: ServicePhotoFormFields;
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ defaultValues });

  const onSubmit = (values: ServicePhotoFormFields) => {
    console.log("submitting? ", values);
  };

  // console.log("Defaults: ", defaultValues);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mt-14 ">
      <InputFile
        name="photos"
        title="Foto de portada"
        description="  Carga 1 imagen de tu servicio. Te recomendamos que tenga un tamaño
        mínimo de 200x200px y un peso máximo de 1MB."
      >
        <AddImage className="mx-auto mb-3 " />
        <span className=" font-satoshi">
          Arrastra o selecciona tu foto de portada
        </span>
      </InputFile>

      <SelectInput
        error={errors.place}
        register={register}
        className="mt-8"
        options={OPTIONS}
        name="place"
        placeholder="Selecciona una opción"
        label="¿En donde se realiza el servicio?"
      />
      <SwitchOption
        register={register}
        name="isActive"
        error={errors.isActive}
        title="Permitir que este servicio se agende en línea"
      />
      <SwitchOption
        name="allowMultiple"
        error={errors.moreThanOneAllowed}
        title="  Permitir que 2 o más clientes agenden al mismo tiempo"
      />
      {/* <BasicInput
        placeholder="2"
        label="¿Hasta cuantas sesiones se pueden agendar por hora?"
        name="seats"
        type="number"
      /> */}
      <ServiceFormFooter
        backButtonLink={backButtonLink}
        isDisabled={!isValid}
      />
    </Form>
  );
};

// @TODO: Swith props pending
export const SwitchOption = ({
  title,
  description,
  register,
  name,
  registerOptions = { required: REQUIRED_MESSAGE },
}: {
  name: string;
  register: UseFormRegister<FieldValues>;
  title: string;
  description?: string;
  registerOptions?: { required: string };
}) => {
  return (
    <article className="flex justify-between items-center w-full mb-6">
      <div className="flex flex-col justify-center">
        <p className="text-brand_dark font-satoMiddle">{title}</p>
        <p>{description}</p>
      </div>
      <Switch
        name="isActive"
        register={register}
        registerOptions={registerOptions}
      />
    </article>
  );
};
