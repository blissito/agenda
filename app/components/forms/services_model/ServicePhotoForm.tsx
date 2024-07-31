import { FieldValues, useForm, UseFormRegister } from "react-hook-form";
import { InputFile } from "../InputFile";
import { AddImage } from "~/components/icons/addImage";
import { Option, SelectInput } from "../SelectInput";
import { Switch } from "../Switch";
import { ServiceFormFooter } from "./ServiceGeneralForm";
import { isValid, z } from "zod";
import { Form, useFetcher } from "@remix-run/react";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";

export const servicePhotoFormSchema = z.object({
  photoURL: z.string().optional(),
  place: z.string(),
  allowMultiple: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  // seats: z.coerce.number(), // @TODO update in other place?
});

type ServicePhotoFormFields = z.infer<typeof ServicePhotoFormFields>;

const OPTIONS: Option[] = [
  {
    value: "INPLACE",
    title: "En el negocio",
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

const initialPhotoValues = {
  place: "",
  seats: 0,
  isActive: true,
  allowMultiple: false,
  photoURL: "",
};
export const ServicePhotoForm = ({
  action,
  defaultValues = initialPhotoValues,
  backButtonLink,
}: {
  action?: string;
  backButtonLink?: string;
  defaultValues?: ServicePhotoFormFields;
}) => {
  const fetcher = useFetcher();
  const {
    // getValues,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: { ...defaultValues, photoURL: action.readUrl },
  });

  const onSubmit = (values: ServicePhotoFormFields) => {
    fetcher.submit(
      {
        ...values,
        intent: "update_service",
      },
      { method: "post" }
    );
  };

  // console.log("Defaults: ", defaultValues);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mt-14 ">
      <InputFile // @TODO: this should contain an input with string value coming from upload
        action={action}
        name="photoURL"
        title="Foto de portada"
        description="  Carga 1 imagen de tu servicio. Te recomendamos que tenga un aspect ratio 16:9 y un peso máximo de 1MB."
        register={register}
        registerOptions={{ required: false }}
      >
        <AddImage className="mx-auto mb-3" />
        <span className="font-satoshi">
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
        defaultChecked={defaultValues.isActive}
        register={register}
        registerOptions={{ required: false }}
        name="isActive"
        title="Permitir que este servicio se agende en línea"
      />
      <SwitchOption
        defaultChecked={defaultValues.allowMultiple}
        registerOptions={{ required: false }}
        register={register}
        name="allowMultiple"
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
        isLoading={fetcher.state !== "idle"}
      />
    </Form>
  );
};

// @TODO: Swith props pending
export const SwitchOption = ({
  title,
  defaultChecked,
  description,
  register,
  name,
  registerOptions = { required: REQUIRED_MESSAGE },
}: {
  defaultChecked?: boolean;
  name: string;
  register: UseFormRegister<FieldValues> | any;
  title: string;
  description?: string;
  registerOptions?: { required: string | false };
}) => {
  return (
    <article className="flex justify-between items-center w-full mb-6">
      <div className="flex flex-col justify-center">
        <p className="text-brand_dark font-satoMiddle">{title}</p>
        <p>{description}</p>
      </div>
      <Switch
        defaultChecked={defaultChecked}
        name={name}
        register={register}
        registerOptions={registerOptions}
      />
    </article>
  );
};
