import {
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form"
import { FaRegTrashCan } from "react-icons/fa6"
import { BsThreeDotsVertical } from "react-icons/bs"
import { twMerge } from "tailwind-merge"

type Props = {
  action?: {
    readUrl?: string
    removeUrl?: string
    putUrl?: string
    logoKey?: string
  }
  name: string
  children: ReactNode
  title?: string
  register?: UseFormRegister<FieldValues>
  description?: string
  error?: FieldError
  className?: string
  registerOptions?: { required: string | boolean }
  multiple?: boolean
  onUploadComplete?: (key: string) => void
  onDelete?: () => void
}

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
  onUploadComplete,
  onDelete,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOver, setIsOver] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(action?.readUrl)

  useEffect(() => {
    if (action?.readUrl && !preview) {
      setPreview(action.readUrl)
    }
  }, [action?.readUrl])

  const handleOnDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsOver(true)
  }

  const handleDragEnd = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsOver(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      const ok = await putFile(file)
      if (ok) {
        setPreview(
          action?.readUrl ? `${action.readUrl}&t=${Date.now()}` : undefined,
        )
        if (action?.logoKey) onUploadComplete?.(action.logoKey)
      }
    }
  }

  const handleDelete = () => {
    setPreview(undefined)
    onDelete?.()
  }

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      const ok = await putFile(file)
      if (ok && action?.logoKey) onUploadComplete?.(action.logoKey)
    }
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const putFile = async (file: File): Promise<boolean> => {
    if (!action?.putUrl) {
      console.warn("[InputFile] No putUrl provided - upload skipped")
      return false
    }
    try {
      const response = await fetch(action.putUrl, {
        method: "put",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })
      return response.ok
    } catch (e) {
      console.error("[InputFile] Upload error:", e)
      return false
    }
  }

  return (
    <div className="mb-8">
      {title && <p className="text-brand_dark font-satoMiddle">{title}</p>}
      {description && (
        <p className="text-brand_gray text-sm">{description}</p>
      )}

      <div
        onDrop={handleDragEnd}
        onDragOver={handleOnDragOver}
        onDragLeave={() => setIsOver(false)}
        onClick={preview ? undefined : openFilePicker}
        className={twMerge(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#CFCFCF] bg-transparent text-center transition-all mt-6 h-[160px]",
          "hover:border-brand_blue",
          isOver && "border-brand_blue scale-105 bg-brand_blue/10",
          className,
        )}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          onChange={handleChange}
          type="file"
          className="hidden"
          multiple={multiple}
        />
        <input
          type="hidden"
          name={name}
          {...register?.(name, registerOptions)}
        />

        {preview ? (
          <>
            <img
              onError={() => setPreview("")}
              alt="preview"
              className="absolute inset-0 h-full w-full object-cover"
              src={preview}
            />
            {/* Menu overlay */}
            <div className="absolute right-1 top-1 z-10">
              <DropdownMenu
                onDelete={handleDelete}
                onReplace={openFilePicker}
              />
            </div>
          </>
        ) : (
          <div className="text-brand_gray">{children}</div>
        )}
      </div>

      {error?.message && (
        <p className="mt-1 text-xs text-red-500 pl-1">{error.message}</p>
      )}
    </div>
  )
}

function DropdownMenu({
  onDelete,
  onReplace,
}: {
  onDelete: () => void
  onReplace: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow transition-all hover:bg-black/60 bg-black/30"
      >
        <BsThreeDotsVertical />
      </button>
      {open && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-20"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          />
          <div className="absolute right-0 z-30 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onReplace()
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Cambiar imagen
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onDelete()
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <FaRegTrashCan className="text-xs" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </>
  )
}
