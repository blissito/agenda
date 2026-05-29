import {
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaRegTrashCan } from "react-icons/fa6"
import { twMerge } from "tailwind-merge"
import { Spinner } from "~/components/common/Spinner"

type UploadStatus = "idle" | "uploading" | "error"

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
  containerClassName?: string
  registerOptions?: { required: string | boolean }
  multiple?: boolean
  onUploadComplete?: (key: string) => void
  onUploadStateChange?: (uploading: boolean) => void
  onUploadError?: () => void
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
  containerClassName,
  onUploadComplete,
  onUploadStateChange,
  onUploadError,
  onDelete,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOver, setIsOver] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(action?.readUrl)
  const [status, setStatus] = useState<UploadStatus>("idle")

  useEffect(() => {
    if (action?.readUrl) {
      setPreview(action.readUrl)
    }
  }, [action?.readUrl])

  const handleOnDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsOver(true)
  }

  // Sube el archivo y mantiene el estado visible (uploading/error) para dar
  // feedback claro. Mientras `status === "uploading"` el padre puede bloquear
  // el botón de continuar (via onUploadStateChange) y así evitar que se avance
  // antes de que la imagen termine de subir.
  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setStatus("uploading")
    onUploadStateChange?.(true)
    const ok = await putFile(file)
    onUploadStateChange?.(false)
    if (ok && action?.logoKey) {
      setStatus("idle")
      onUploadComplete?.(action.logoKey)
    } else {
      console.error("[InputFile] Upload failed - check Tigris CORS/credentials")
      setStatus("error")
      setPreview(undefined)
      onUploadError?.()
    }
  }

  const handleDragEnd = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsOver(false)
    const file = event.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDelete = () => {
    setPreview(undefined)
    setStatus("idle")
    onDelete?.()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleFile(file)
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
    <div className={twMerge("mb-8", containerClassName)}>
      {title && <p className="text-brand_dark font-satoMiddle">{title}</p>}
      {description && <p className="text-brand_gray text-sm">{description}</p>}

      <div
        onDrop={status === "uploading" ? undefined : handleDragEnd}
        onDragOver={handleOnDragOver}
        onDragLeave={() => setIsOver(false)}
        onClick={
          preview || status === "uploading" ? undefined : openFilePicker
        }
        className={twMerge(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#CFCFCF] bg-transparent text-center transition-all mt-6 h-[160px]",
          "hover:border-brand_blue",
          isOver && "border-brand_blue scale-105 bg-brand_blue/10",
          status === "uploading" && "cursor-wait",
          status === "error" && "border-red-400 border-solid",
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
            {/* Menu overlay (oculto mientras sube) */}
            {status !== "uploading" && (
              <div className="absolute right-1 top-1 z-10">
                <DropdownMenu
                  onDelete={handleDelete}
                  onReplace={openFilePicker}
                />
              </div>
            )}
          </>
        ) : status === "error" ? (
          <div className="text-red-500 px-4">
            <p className="font-satoMiddle text-sm">No se pudo subir la imagen</p>
            <p className="text-xs mt-1">Haz clic para intentar de nuevo</p>
          </div>
        ) : (
          <div className="text-brand_gray">{children}</div>
        )}

        {/* Overlay de subida en progreso */}
        {status === "uploading" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-sm">
            <Spinner className="w-7" />
            <span className="text-xs font-satoMiddle text-brand_gray">
              Subiendo imagen…
            </span>
          </div>
        )}
      </div>

      {status === "error" && (
        <p className="mt-1 text-xs text-red-500 pl-1">
          La imagen no se subió. Vuelve a intentarlo antes de continuar.
        </p>
      )}
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
