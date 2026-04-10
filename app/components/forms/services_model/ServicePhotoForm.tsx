import { AnimatePresence, motion } from "motion/react"
import { type RefObject, useEffect, useRef, useState } from "react"
import {
  type FieldValues,
  type UseFormRegister,
  useForm,
} from "react-hook-form"
import { Form, Link, useFetcher } from "react-router"
import { z } from "zod"
import { AddImage } from "~/components/icons/addImage"
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug"
import { cn } from "~/utils/cn"
import { InputFile } from "../InputFile"
import { type Option, SelectInput } from "../SelectInput"

export type PhotoAction = {
  putUrl?: string
  readUrl?: string
  removeUrl?: string
  logoKey?: string // Key used for upload (reusing InputFile's expected prop name)
}

export const serverServicePhotoFormSchema = z.object({
  gallery: z.string().optional(), // Single new photo key to add to gallery
  place: z.string(),
  allowMultiple: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const servicePhotoFormSchema = z.object({
  gallery: z.string().optional(), // Single new photo key to add to gallery
  place: z.string(),
  allowMultiple: z
    .enum(["true", "false", "on"])
    .optional()
    .transform((value) => value === "true" || value === "on"),
  isActive: z
    .enum(["true", "false", "on"])
    .optional()
    .transform((value) => value === "true" || value === "on"),
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
  isActive: true,
  allowMultiple: false,
  gallery: "",
}
export const ServicePhotoForm = ({
  photoAction,
  formRef,
  defaultValues = initialPhotoValues,
  errors = {} as Record<string, { message?: string }>,
  orgAddress,
  onAddressWarningChange,
}: {
  formRef?: RefObject<HTMLFormElement | null>
  photoAction?: PhotoAction
  errors?: Record<string, { message?: string }>
  defaultValues?: ServicePhotoFormFields
  orgAddress?: string | null
  onAddressWarningChange?: (hasWarning: boolean) => void
}) => {
  const _fetcher = useFetcher()
  const [newPhoto, setNewPhoto] = useState(defaultValues?.gallery || "")
  const { register, setValue, watch } = useForm({
    defaultValues,
  })

  const placeValue = watch("place")
  const showAddressWarning =
    placeValue === "INPLACE" && !orgAddress?.trim()

  useEffect(() => {
    onAddressWarningChange?.(showAddressWarning)
  }, [showAddressWarning])

  const handleUploadComplete = (key: string) => {
    setNewPhoto(key)
    setValue("gallery", key)
  }

  const handlePhotoDelete = () => {
    setNewPhoto("")
    setValue("gallery", "")
  }

  const isUploadReady = Boolean(photoAction?.putUrl)

  return (
    <Form ref={formRef} method="post">
      {/* Hidden input for the new photo key to add to gallery */}
      <input type="hidden" name="gallery" value={newPhoto} />
      <InputFile
        action={photoAction}
        name="gallery_file"
        title="Foto de portada"
        description={
          isUploadReady
            ? "Carga 1 imagen de tu servicio. Te recomendamos que tenga un aspect ratio 16:9 y un peso máximo de 1MB."
            : "Cargando configuración de subida..."
        }
        onUploadComplete={handleUploadComplete}
        onDelete={handlePhotoDelete}
      >
        <div className="text-brand_gray group-hover:text-brand_blue transition-colors">
          <AddImage className="mx-auto mb-3" />
          <span className="font-satoshi">
            {isUploadReady
              ? "Arrastra o selecciona tu foto de portada"
              : "Espera un momento..."}
          </span>
        </div>
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
      {showAddressWarning && (
        <p className="mt-2 text-xs text-red-500 font-satoshi">
          Aún no tienes una dirección registrada.{" "}
          <Link
            to="/dash/ajustes"
            className="underline text-red-500 hover:text-red-600"
          >
            Agrega tu dirección
          </Link>{" "}
          para poder ofrecer este servicio en el negocio.
        </p>
      )}
      <div className="mt-8">
        <SwitchOption
          defaultChecked={defaultValues.isActive}
          register={register}
          registerOptions={{ required: false }}
          name="isActive"
          title="Permitir que este servicio se agende en línea"
        />
      </div>
      <SwitchOption
        defaultChecked={defaultValues.allowMultiple}
        registerOptions={{ required: false }}
        register={register}
        setValue={setValue}
        name="allowMultiple"
        title="Permitir que 2 o más clientes agenden al mismo tiempo"
      />
      <AnimatePresence>
        {watch("allowMultiple") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden -mt-6 mb-6"
          >
            <div className="pt-6">
              <label className="text-brand_dark font-satoMiddle" htmlFor="seats">
                ¿Cuántas personas pueden agendar al mismo tiempo?
              </label>
              <input
                type="number"
                min={2}
                placeholder="2"
                defaultValue={2}
                className="rounded-2xl border-gray-200 h-12 w-full mt-1 text-brand_gray focus:border-brand_blue focus:outline-none focus:ring-0"
                {...register("seats", { required: false, valueAsNumber: true })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  setValue?: (name: string, value: boolean) => void
  name: string
  register: UseFormRegister<FieldValues> | any
  title: string
  description?: string
  registerOptions?: { required: string | false }
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOn, setOn] = useState(defaultChecked ?? false)

  const onClick = () => {
    setOn((o) => {
      const next = !o
      inputRef.current!.checked = next
      setValue?.(name, next)
      return next
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
