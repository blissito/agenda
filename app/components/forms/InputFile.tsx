import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";
import { FaPlus } from "react-icons/fa6";
import { AddImage } from "../icons/addImage";
import { ReactNode } from "react";

type Props = {
  name: string;
  children: ReactNode;
  title?: string;
  register?: UseFormRegister<FieldValues> | any;
  description?: string;
  error?: FieldError;
  className?: string;
  registerOptions?: { required: string | boolean };
  // onChange?: (arg0: ChangeEvent<HTMLInputElement>) => void;
};
export const InputFile = ({
  title,
  children,
  className,
  description,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  name,
  register,
  ...props
}: Props) => {
  return (
    <div className="mb-8">
      <p className="text-brand_dark font-satoMiddle">{title}</p>
      <p className="text-brand_gray text-sm">{description}</p>

      <div className="bg-transparent flex justify-center text-center items-center border-[1px] border-[#CFCFCF] border-dashed rounded-2xl mt-6 h-[160px] text-red-500">
        <input
          type="file"
          name={name}
          id={name}
          className="inputfile inputfile-3"
          data-multiple-caption="{count} archivos seleccionados"
          multiple
        />
        <label htmlFor={name}>{children}</label>
        {<p className="mb-6 text-xs text-red-500 h-1 pl-1">{error?.message}</p>}
      </div>
    </div>
  );
};
