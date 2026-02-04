import { motion } from "motion/react"
import { type RefObject, useRef, useState } from "react"
import {
  type FieldValues,
  type UseFormRegister,
  useForm,
} from "react-hook-form"
import { Form, useFetcher } from "react-router"
import { z } from "zod"
import { AddImage } from "~/components/icons/addImage"
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug"
import { cn } from "~/utils/cn"
import { InputFile } from "../InputFile"
import { type Option, SelectInput } from "../SelectInput"

export const serverServicePhotoFormSchema = z.object({
  photoURL: z.string().optional(),
  place: z.string(),
  allowMultiple: z.boolean().optional(),
  isActive: z.boolean().optional(),
  // seats: z.coerce.number(), // @TODO update in other place?
})

export const servicePhotoFormSchema = z.object({
  photoURL: z.string().optional(),
  place: z.string(),
  allowMultiple: z
    .enum(["true", "false", "on"])
    .optional()
    .transform((value) => value === "true" || value === "on"),
  isActive: z
    .enum(["true", "false", "on"])
    .optional()
    .transform((value) => value === "true" || value === "on"),
  // seats: z.coerce.number(), // @TODO update in other place?
})

type ServicePhotoFormFields = z.infer<typeof servicePhotoFormSchema>

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
]

const initialPhotoValues = {
  place: "",
  seats: 0,
  isActive: true,
  allowMultiple: false,
  photoURL: "",
}
export const ServicePhotoForm = ({
  action,
  formRef,
  defaultValues = initialPhotoValues,
  errors = {} as Record<string, { message?: string }>,
}: {
  formRef?: RefObject<HTMLFormElement | null>
  action?: string
  errors?: Record<string, { message?: string }>
  defaultValues?: ServicePhotoFormFields
}) => {
  const fetcher = useFetcher()
  const {
    handleSubmit,
    register,
    // formState: { errors },
    setValue,
  } = useForm({
    defaultValues: { ...defaultValues, photoURL: defaultValues?.photoURL },
  })

  const _onSubmit = (values: ServicePhotoFormFields) => {
    fetcher.submit(
      {
        ...values,
        intent: "update_service",
      },
      { method: "post" },
    )
  }

  return (
    <Form ref={formRef} method="post">
      <InputFile // @TODO: this should contain an input with string value coming from upload
        // action={action}
        name="photoURL"
        title="Foto de portada"
        description="  Carga 1 imagen de tu servicio. Te recomendamos que tenga un aspect ratio 16:9 y un peso máximo de 1MB."
        register={register as unknown as UseFormRegister<FieldValues>}
        registerOptions={{ required: false }}
      >
        <AddImage className="mx-auto mb-3" />
        <span className="font-satoshi">
          Arrastra o selecciona tu foto de portada
        </span>
      </InputFile>

      <SelectInput
        error={errors.place as import("react-hook-form").FieldError | undefined}
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
        isDisabled // @todo implent two or more
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
  )
}

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
  isDisabled?: boolean
  defaultChecked?: boolean
  setValue?: () => void // @todo: fix
  name: string
  register: UseFormRegister<FieldValues> | any
  title: string
  description?: string
  registerOptions?: { required: string | false }
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOn, setOn] = useState(false)

  const onClick = () => {
    setOn((o) => {
      inputRef.current!.checked = !o
      return !o
    })
  }

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      className="flex justify-between items-center w-full mb-6"
    >
      <div className="text-left">
        <p
          className={cn("text-brand_dark font-satoMiddle", {
            "text-gray-300": isDisabled,
          })}
        >
          {title}
        </p>
        <p>{description}</p>
      </div>
      <div
        className={cn(
          "flex bg-gray-100 w-7 p-1 rounded-full",

          {
            "justify-end bg-brand_blue/30 shadow": isOn,
          },
        )}
      >
        <motion.div
          transition={{ type: "spring" }}
          layout
          className={cn("bg-gray-300 h-3 w-3 rounded-full", {
            "bg-brand_blue ": isOn,
          })}
        ></motion.div>
      </div>
      <input
        name={name}
        ref={inputRef}
        className="hidden"
        disabled={isDisabled}
        type="checkbox"
        // {...register?.(name, registerOptions)}
      />
    </button>
  )
}
