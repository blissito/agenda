import {
  type FieldValues,
  useForm,
  type UseFormRegister,
} from "react-hook-form";
import { InputFile } from "../InputFile";
import { AddImage } from "~/components/icons/addImage";
import { type Option, SelectInput } from "../SelectInput";
import { z, ZodError } from "zod";
import { Form, useFetcher } from "react-router";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";
import { Switch } from "~/components/common/Switch";
import { cn } from "~/utils/cn";
import type { RefObject } from "react";

export const serverServicePhotoFormSchema = z.object({
  photoURL: z.string().optional(),
  place: z.string(),
  allowMultiple: z.boolean().optional(),
  isActive: z.boolean().optional(),
  // seats: z.coerce.number(), // @TODO update in other place?
});

export const servicePhotoFormSchema = z.object({
  photoURL: z.string().optional(),
  place: z.string(),
  allowMultiple: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  // seats: z.coerce.number(), // @TODO update in other place?
});

type ServicePhotoFormFields = z.infer<typeof servicePhotoFormSchema>;

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
  formRef,
  defaultValues = initialPhotoValues,
  errors = {},
}: {
  formRef?: RefObject<HTMLFormElement | null>;
  action?: string;
  errors?: ZodError[];
  defaultValues?: ServicePhotoFormFields;
}) => {
  const fetcher = useFetcher();
  const {
    handleSubmit,
    register,
    // formState: { errors },
    setValue,
  } = useForm({
    defaultValues: { ...defaultValues, photoURL: action?.readUrl },
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

  console.log("ERRORS: ", errors);

  return (
    <Form ref={formRef}>
      <InputFile // @TODO: this should contain an input with string value coming from upload
        action={action}
        name="photoURL"
        title="Foto de portada"
        description="  Carga 1 imagen de tu servicio. Te recomendamos que tenga un aspect ratio 16:9 y un peso máximo de 1MB."
        register={register}
        registerOptions={{ required: false }}
        accept="image/*"
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
        setValue={setValue}
        register={register}
        registerOptions={{ required: false }}
        name="isActive"
        title="Permitir que este servicio se agende en línea"
      />
      <SwitchOption
        isDisabled // @todo implent two or more
        setValue={setValue}
        defaultChecked={defaultValues.allowMultiple}
        registerOptions={{ required: false }}
        register={register}
        name="allowMultiple"
        title="Permitir que 2 o más clientes agenden al mismo tiempo"
      />
      {/* <BasicInput
        placeholder="2"
        label="¿Hasta cuantas sesiones se pueden agendar por hora?"
        name="seats"
        type="number"
      /> */}
    </Form>
  );
};

// @TODO: Swith props pending
export const SwitchOption = ({
  title,
  isDisabled,
  description,
  register,
  name,
  registerOptions = { required: REQUIRED_MESSAGE },
  setValue,
  defaultChecked,
}: {
  isDisabled?: boolean;
  defaultChecked?: boolean;
  setValue?: () => void; // @todo: fix
  name: string;
  register: UseFormRegister<FieldValues> | any;
  title: string;
  description?: string;
  registerOptions?: { required: string | false };
}) => {
  return (
    <article className="flex justify-between items-center w-full mb-6">
      <div className="flex flex-col justify-center">
        <p
          className={cn("text-brand_dark font-satoMiddle", {
            "text-gray-300": isDisabled,
          })}
        >
          {title}
        </p>
        <p>{description}</p>
      </div>
      <Switch
        containerClassName={isDisabled ? "pointer-events-none" : ""}
        defaultChecked={defaultChecked}
        setValue={setValue}
        name={name}
        {...register?.(name, registerOptions)}
      />
    </article>
  );
};
