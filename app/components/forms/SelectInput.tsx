import { ChangeEvent } from "react";
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: string;
  className?: string;
  registerOptions?: { required: string | boolean };
  placeholder?: string;
  // onChange?: (arg0: ChangeEvent<HTMLInputElement>) => void;
};
export const SelectInput = ({
  placeholder,
  className,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  name,
  register,
  ...props
}: Props) => {
  return (
    <>
      <label className={twMerge(" text-neutral-950", className)} htmlFor={name}>
        {label}
      </label>
      <select name="pets" id="pet-select">
        <option value="">{placeholder}</option>
        <option value="dog">dog</option>
        <option value="cat">Cat</option>
        <option value="hamster">Hamster</option>
        <option value="parrot">Parrot</option>
        <option value="spider">Spider</option>
        <option value="goldfish">Goldfish</option>
      </select>

      {<p className="mb-6 text-xs text-red-500 h-1 pl-1">{error?.message}</p>}
    </>
  );
};
