import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { FaRegTrashCan } from "react-icons/fa6";
import { ChangeEvent, DragEvent, ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
// @TODO: scale and optimize images
type Props = {
  action?: string;
  name: string;
  children: ReactNode;
  title?: string;
  register?: UseFormRegister<FieldValues> | any;
  description?: string;
  error?: FieldError;
  className?: string;
  registerOptions?: { required: string | boolean };
  multiple?: boolean;
  // onChange?: (arg0: ChangeEvent<HTMLInputElement>) => void;
};
// const morras =
//   "https://media.licdn.com/dms/image/C561BAQE8cwNr6BMj_Q/company-background_10000/0/1612306118493/cover_corp_cover?e=2147483647&v=beta&t=2-D8AuQQLqxb8ML7eEs3AtJbC7jspwH47Z8Ta-B4MpA";
export const InputFile = ({
  title,
  action,
  children,
  description,
  register,
  registerOptions = { required: "campo requerido" },
  error,
  name,
  multiple,
  className,
  ...props
}: Props) => {
  const [isOver, setIsOver] = useState(false);
  const [preview, setPreview] = useState<string>(action.readUrl);
  const handleOnDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(true);
  };
  // @TODO: prohibe more than 1mb
  const handleDragEnd = async (event) => {
    event.preventDefault();
    setPreview("");
    setIsOver(false);
    await putFile(event.dataTransfer.files[0]);
    setPreview(action.readUrl);
  };
  const handleDelete = async () => {
    setPreview(null);
    await fetch(action.removeUrl, {
      method: "delete",
    }).catch((e) => console.error(e));
  };
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const url = URL.createObjectURL(event.target.files[0]);
    setPreview(url);
    await putFile(event.target.files[0]);
  };

  const putFile = async (file: File) => {
    if (!action) return;

    // do not use formData ⚠
    await fetch(action.putUrl, {
      method: "put",
      body: file,
      headers: {
        "Content-Length": file.size,
        "Content-Type": file.type,
      },
    }).catch((e) => console.error(e));
  };

  return (
    <div className="mb-8">
      <p className="text-brand_dark font-satoMiddle">{title}</p>
      <p className="text-brand_gray text-sm">{description}</p>

      <div
        // id="drop_zone"
        onDrop={handleDragEnd}
        onDragOver={handleOnDragOver}
        className={twMerge(
          "bg-transparent flex justify-center text-center items-center border-[1px] border-[#CFCFCF] border-dashed rounded-2xl mt-6 h-[160px] text-red-500 transition-all",
          "hover:border-brand_blue relative overflow-hidden",
          isOver && "border-brand_blue scale-105 bg-brand_blue/10",
          className
        )}
      >
        {preview && (
          <div className="absolute inset-0">
            <img
              onError={() => {
                setPreview("");
              }}
              alt="preview"
              className="w-full h-full object-cover"
              src={preview}
              // src={"/api/images?key=66a96106fbaa2ba8588df323"}
            />
            <button
              type="button"
              onClick={handleDelete}
              className="absolute text-white font-bold z-10 right-1 top-1 transition-all hover:bg-black h-8 w-8 flex justify-center items-center rounded-full shadow active:scale-95"
            >
              <FaRegTrashCan />
            </button>
          </div>
        )}
        <input type="hidden" name={name} {...register(name, registerOptions)} />
        <input
          onChange={handleChange}
          type="file"
          id={name}
          className="inputfile inputfile-3"
          data-multiple-caption="{count} archivos seleccionados"
          multiple={multiple}
          {...props}
        />
        <label htmlFor={name}>{children}</label>
        {<p className="mb-6 text-xs text-red-500 h-1 pl-1">{error?.message}</p>}
      </div>
    </div>
  );
};
