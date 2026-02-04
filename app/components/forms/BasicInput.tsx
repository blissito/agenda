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
  icon?: ReactNode
  onFocus?: () => void
  onBlur?: () => void
  onChange?: (evt: ChangeEvent<HTMLInputElement>) => void
  defaultValue?: string | number
}
export const BasicInput = ({
  defaultValue,
  icon = null,
  isDisabled,
  placeholder,
  className,
  containerClassName,
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
    <div className={twMerge("grid w-full relative", containerClassName)}>
      <span className="absolute bottom-[42%] left-3 text-gray-500">{icon}</span>
      <label
        className={twMerge(" text-brand_gray font-satoMedium", className)}
        htmlFor={name}
      >
        {label}
      </label>
      {/* {icon && <div className="absolute top-[33%] left-4">{icon}</div>} */}

      {as === "textarea" ? (
        <textarea
          defaultValue={defaultValue}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
          name={name}
          disabled={isDisabled}
          placeholder={placeholder}
          className={twMerge(
            "min-h-20 text-dark",
            "placeholder:text-brand_iron font-satoMedium placeholder:font-satoshi",
            "focus:border-brand_blue",
            "rounded-xl border-gray-200 h-12 w-full mt-1",
            "disabled:bg-brand_stroke disabled:cursor-not-allowed",
            !!error && "border-red-500",
          )}
          {...props}
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
            "placeholder:text-brand_iron text-brand_dark font-satoMedium",
            "focus:border-brand_blue",
            "rounded-xl border-gray-200 h-12 w-full mt-1 ",
            "disabled:bg-brand_stroke disabled:cursor-not-allowed",
            !!error && "border-red-500",
            icon && "pl-12", // @TODO: does textarea needs this?
            // className
          )}
          {...props}
          {...register?.(name, registerOptions)}
          // onChange={onChange}
        />
      )}

      <p className="text-xs text-red-500 h-1 pl-1">{error?.message}</p>
    </div>
  )
}

BasicInput.displayName = "BasicInput"
