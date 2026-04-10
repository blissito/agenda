// app/components/forms/BasicInput.tsx (o donde tengas este archivo)
import type { ChangeEvent, ReactNode } from "react"
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form"
import { twMerge } from "tailwind-merge"
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug"

type Props = {
  name: string
  register?: UseFormRegister<FieldValues> | any
  error?: FieldError
  label?: ReactNode
  className?: string
  registerOptions?: { required: string | boolean }
  placeholder?: string
  as?: "textarea"
  type?: "text" | "number" | "email" | "date" | "search"
  isDisabled?: boolean
  containerClassName?: string
  inputClassName?: string
  icon?: ReactNode
  onFocus?: () => void
  onBlur?: () => void
  onChange?: (evt: ChangeEvent<HTMLInputElement>) => void
  defaultValue?: string | number
  value?: string | number
  required?: boolean
  min?: number | string
  max?: number | string
  inputMode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"
}

export const BasicInput = ({
  defaultValue,
  icon = null,
  isDisabled,
  placeholder,
  className,
  containerClassName,
  inputClassName,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  name,
  register,
  as,
  type,
  onFocus,
  onBlur,
  onChange,
  ...props
}: Props) => {
  return (
    <div className={twMerge("w-full relative", containerClassName)}>
      {label ? (
        <label
          className={twMerge("text-brand_dark font-satoMedium", className)}
          htmlFor={name}
        >
          {label}
        </label>
      ) : null}

      <div className="relative mt-1">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </span>
        ) : null}

        {as === "textarea" ? (
          <textarea
            defaultValue={defaultValue}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange as any}
            name={name}
            disabled={isDisabled}
            placeholder={placeholder}
            className={twMerge(
              "min-h-40 text-brand_gray",
              "placeholder:text-brand_iron font-satoshi",
              "focus:border-brand_blue focus:outline-none focus:ring-0",
              "rounded-2xl border-gray-200 w-full h-12",
              "disabled:bg-brand_stroke disabled:cursor-not-allowed",
              !!error && "border-red-500",
              icon && "pl-12",
              inputClassName,
            )}
            {...(props as any)}
            {...register?.(name, registerOptions)}
          />
        ) : (
          <input
            defaultValue={defaultValue}
            onBlur={onBlur}
            onFocus={onFocus}
            onChange={onChange}
            name={name}
            disabled={isDisabled}
            type={type}
            placeholder={placeholder}
            className={twMerge(
              "text-brand_gray font-satoshi placeholder:text-brand_iron placeholder:font-satoshi",
              "focus:border-brand_blue focus:outline-none focus:ring-0",
              "rounded-2xl border-gray-200 w-full h-12",
              "disabled:bg-brand_stroke disabled:cursor-not-allowed",
              !!error && "border-red-full",
              icon && "pl-12",
              inputClassName,
            )}
            {...(props as any)}
            {...register?.(name, registerOptions)}
          />
        )}
      </div>

      <p className="text-xs text-red-500 h-1 pl-1">{error?.message}</p>
    </div>
  )
}

BasicInput.displayName = "BasicInput"
