// loyaltyStep.tsx

import { motion } from "motion/react"
import type { ChangeEvent, InputHTMLAttributes } from "react"
import { useEffect, useState } from "react"
import { useRevalidator } from "react-router"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { EmojiConfetti } from "~/components/common/EmojiConfetti"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { SuccessToast } from "~/components/common/SuccessToast"
import { BasicInput } from "~/components/forms/BasicInput"
import { ArrowRight } from "~/components/icons/arrowRight"
import { X } from "~/components/icons/X"
import type { Level, ServiceOption } from "~/routes/dash/dash.lealtad"
import { Modal, ServiceToggleRow } from "./loyaltycupones"

// ==================== SHARED: LEVEL IMAGE UPLOAD ====================

async function uploadLevelImage(file: File): Promise<string | null> {
  try {
    const res = await fetch("/api/loyalty?intent=level-upload-url")
    const { putUrl, key } = await res.json()

    const upload = await fetch(putUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Length": String(file.size),
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      },
    })

    return upload.ok ? key : null
  } catch {
    return null
  }
}

// ==================== SHARED COMPONENTS ====================

const WizardInput = ({
  label,
  required = false,
  error,
  showError = false,
  ...props
}: {
  label: string
  required?: boolean
  error?: string
  showError?: boolean
} & InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="mb-2 block font-satoMedium text-[14px] text-brand_dark">
      {label}
      {required}
    </label>
    <input
      {...props}
      className={`h-[44px] w-full rounded-[16px] border px-4 text-[14px] outline-none placeholder:text-brand_silver focus:border-[#615FFF] ${
        showError && error
          ? "border-brand_red text-brand_gray"
          : "border-brand_ash text-brand_gray"
      } ${props.className || ""}`}
    />
    {showError && error && (
      <p className="mt-1 text-[12px] text-red-500">{error}</p>
    )}
  </div>
)

const CardActionButton = ({
  onClick,
  icon: Icon,
  title,
}: {
  onClick: () => void
  icon: React.ComponentType
  title: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-md"
    title={title}
  >
    <Icon />
  </button>
)

// ==================== TAB: NIVELES ====================

export function NivelesTab({
  levels,
  services,
}: {
  levels: Level[]
  services: ServiceOption[]
  onCreateClick: () => void
}) {
  const revalidator = useRevalidator()
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 2500)
    return () => clearTimeout(t)
  }, [toastMessage])

  const apiCall = async (intent: string, payload: Record<string, unknown>) => {
    await fetch(`/api/loyalty?intent=${intent}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }),
    })
    revalidator.revalidate()
  }

  const [deleteTarget, setDeleteTarget] = useState<Level | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const res = await fetch("/api/loyalty?intent=delete-level", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        data: JSON.stringify({ levelId: deleteTarget.id }),
      }),
    })
    const result = await res.json()

    if (result.error) {
      alert(result.error)
    } else {
      setDeleteTarget(null)
      revalidator.revalidate()
    }
  }

  const handleUpdate = async (payload: {
    name: string
    minPoints: number
    discountPercent: number
    serviceIds: string[]
    imageFile: File | null
  }) => {
    if (!editingLevel) return

    setIsUpdating(true)
    let imageKey: string | null = editingLevel.image
    if (payload.imageFile) {
      imageKey = await uploadLevelImage(payload.imageFile)
    }

    await apiCall("update-level", {
      levelId: editingLevel.id,
      name: payload.name,
      minPoints: payload.minPoints,
      discountPercent: payload.discountPercent,
      serviceIds: payload.serviceIds,
      image: imageKey,
    })

    setIsUpdating(false)
    setEditingLevel(null)
    setToastMessage("Cambios guardados")
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {levels.map((level, index) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <LoyaltyLevelCard
              level={level}
              onEdit={() => setEditingLevel(level)}
              onDelete={() => setDeleteTarget(level)}
            />
          </motion.div>
        ))}
      </div>

      {editingLevel && (
        <LevelEditModal
          level={editingLevel}
          services={services}
          isUpdating={isUpdating}
          onClose={() => setEditingLevel(null)}
          onDelete={() => {
            const toDelete = editingLevel
            setEditingLevel(null)
            setDeleteTarget(toDelete)
          }}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Seguro que quieres eliminar este nivel?"
        description="Al eliminarlo, los clientes dejarán de recibir los beneficios asociados a este nivel."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <SuccessToast message={toastMessage} />
    </>
  )
}

function LoyaltyLevelCard({
  level,
  onEdit,
  onDelete,
}: {
  level: Level
  onEdit: () => void
  onDelete: () => void
}) {
  const imageSrc = level.image ? `/api/images?key=${level.image}` : null
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div className="group overflow-hidden rounded-[16px] bg-white">
      <div className="relative overflow-hidden rounded-t-[16px] bg-white">
        <div className="aspect-[1.55/1] w-full">
          {imageSrc ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EEEAFE] to-[#F8F7FF] animate-pulse" />
              )}
              <img
                src={imageSrc}
                alt={level.name}
                onLoad={() => setImgLoaded(true)}
                className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cyan-200 text-[28px] font-semibold text-cyan-900">
              {level.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <CardActionButton onClick={onEdit} icon={PencilIcon} title="Editar" />
          <CardActionButton
            onClick={onDelete}
            icon={TrashIcon}
            title="Eliminar"
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 pt-3 pb-[15px]">
        <p className="min-w-0 truncate pr-3 text-[14px] font-satoMiddle text-brand_dark">
          {level.name}
        </p>
        <div className="text-[12px] font-satoMiddle text-brand_gray">
          +{level.minPoints} puntos
        </div>
      </div>
    </div>
  )
}

// ==================== CREATE LEVEL WIZARD ====================

export function CreateLevelWizard({
  services,
  isOrgEnabled,
  onClose,
  onCreated,
}: {
  services: ServiceOption[]
  isOrgEnabled: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [levelName, setLevelName] = useState("")
  const [minPoints, setMinPoints] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [applyAllServices, setApplyAllServices] = useState(true)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  const parsedMinPoints = Number(minPoints)
  const parsedDiscount = Number(discountPercent)

  const isStepOneValid =
    levelName.trim().length > 0 &&
    minPoints !== "" &&
    discountPercent !== "" &&
    Number.isFinite(parsedMinPoints) &&
    Number.isFinite(parsedDiscount) &&
    parsedMinPoints >= 1 &&
    parsedDiscount > 0 &&
    parsedDiscount <= 100

  const isStepTwoValid =
    applyAllServices || selectedServiceIds.length > 0 || services.length === 0

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const handleImageChange = (file?: File | null) => {
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleBack = () => {
    if (isSubmitting) return
    setShowValidation(false)

    if (step === 1) {
      onClose()
    } else if (step === 2) {
      setStep(1)
    } else {
      onClose()
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!isStepOneValid) {
        setShowValidation(true)
        return
      }

      setShowValidation(false)
      setError(null)
      setStep(2)
    } else if (step === 2) {
      handleSubmit()
    }
  }

  const handleEnableProgram = async () => {
    const response = await fetch(
      window.location.pathname + window.location.search,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ intent: "enable-loyalty" }),
      },
    )

    const result = await response.json().catch(() => null)
    if (!response.ok || result?.error) {
      throw new Error(result?.error || "No se pudo activar el programa.")
    }
  }

  const handleCreateLevel = async () => {
    let imageKey: string | null = null

    if (imageFile) {
      imageKey = await uploadLevelImage(imageFile)
      if (!imageKey) {
        throw new Error("No se pudo subir la imagen del nivel.")
      }
    }

    const response = await fetch("/api/loyalty?intent=create-level", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        data: JSON.stringify({
          name: levelName.trim(),
          minPoints: parsedMinPoints,
          discountPercent: parsedDiscount,
          serviceIds: applyAllServices ? [] : selectedServiceIds,
          ...(imageKey && { image: imageKey }),
        }),
      }),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok || result?.error) {
      throw new Error(result?.error || "No se pudo crear el nivel.")
    }
  }

  const handleSubmit = async () => {
    if (!isStepTwoValid || isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    try {
      if (!isOrgEnabled) {
        await handleEnableProgram()
      }

      await handleCreateLevel()
      setStep(3)
      onCreated()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al crear el nivel.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 3) {
    return <WizardSuccessScreen onClose={onClose} />
  }

  return (
    <div className="fixed inset-0 z-[70] bg-white">
      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-y-auto bg-white px-4 pt-5 pb-4 sm:px-8 sm:py-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 z-20 flex items-center justify-center text-[#8A90A2] disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X />
        </button>

        <WizardHeader currentStep={step} />

        {step === 1 && (
          <WizardStepOne
            levelName={levelName}
            setLevelName={setLevelName}
            minPoints={minPoints}
            setMinPoints={setMinPoints}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            imagePreview={imagePreview}
            handleImageChange={handleImageChange}
            showValidation={showValidation}
          />
        )}

        {step === 2 && (
          <WizardStepTwo
            services={services}
            applyAllServices={applyAllServices}
            setApplyAllServices={setApplyAllServices}
            selectedServiceIds={selectedServiceIds}
            toggleService={toggleService}
            error={error}
          />
        )}

        <WizardFooter
          onBack={handleBack}
          onNext={handleNext}
          canContinue={true}
          isSubmitting={isSubmitting}
          nextText={step === 1 ? "Continuar" : "Guardar"}
        />
      </div>
    </div>
  )
}

// ==================== WIZARD SUB-COMPONENTS ====================

function WizardHeader({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="mx-auto w-full pt-10 text-center sm:pt-8">
      <h2 className="text-[20px] leading-[28px] font-satoBold text-brand_dark">
        ¡Empecemos! Crea un nuevo nivel para tus clientes
      </h2>
      <div className="mt-4 sm:mt-5 flex justify-center">
        <WizardStepper currentStep={currentStep} />
      </div>
    </div>
  )
}

function WizardStepOne({
  levelName,
  setLevelName,
  minPoints,
  setMinPoints,
  discountPercent,
  setDiscountPercent,
  imagePreview,
  handleImageChange,
  showValidation = false,
}: {
  levelName: string
  setLevelName: (value: string) => void
  minPoints: string
  setMinPoints: (value: string) => void
  discountPercent: string
  setDiscountPercent: (value: string) => void
  imagePreview: string | null
  handleImageChange: (file?: File | null) => void
  showValidation?: boolean
}) {
  const getMinPointsError = () => {
    if (!minPoints) return "Este campo es obligatorio"
    if (Number(minPoints) < 1) return "Debe ser mayor o igual a 1"
    return ""
  }

  const getDiscountError = () => {
    if (!discountPercent) return "Este campo es obligatorio"
    const num = Number(discountPercent)
    if (num < 1) return "Debe ser mayor o igual a 1"
    if (num > 100) return "Debe ser menor o igual a 100"
    return ""
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-xl pb-6">
      <WizardInput
        label="Nombre del nivel"
        required
        value={levelName}
        onChange={(e) => setLevelName(e.target.value)}
        placeholder="Ej. VIP, Premium, Gold"
        error={!levelName.trim() ? "Este campo es obligatorio" : ""}
        showError={showValidation}
      />

      <div className="mt-4 sm:mt-5">
        <label className="mb-2 block font-satoMedium text-[14px] text-brand_dark">
          Imagen
        </label>
        <p className="mt-2 font-satoMedium text-[14px] text-brand_gray">
          Carga 1 imagen de portada para el nivel de lealtad de tus clientes. Te
          recomendamos un tamaño mínimo de 200 × 200 px y un peso máximo de 1
          MB.
        </p>

        <label className="mt-3 block cursor-pointer">
          {imagePreview ? (
            <div className="overflow-hidden rounded-[18px] border border-dashed border-brand_ash">
              <img
                src={imagePreview}
                alt="Preview del nivel"
                className="h-[112px] w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-[112px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D1D5DB] text-center">
              <UploadLevelIcon />
              <span className="mt-3 text-[14px] font-satoMedium text-brand_gray">
                Arrastra o selecciona
                <br />
                una foto
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-4">
        <WizardInput
          label="Puntos requeridos"
          required
          type="text"
          inputMode="numeric"
          value={minPoints}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "")
            setMinPoints(onlyDigits)
          }}
          placeholder="00"
          error={getMinPointsError()}
          showError={showValidation}
        />

        <WizardInput
          label="Porcentaje de descuento"
          required
          type="text"
          inputMode="numeric"
          value={discountPercent}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "")
            setDiscountPercent(onlyDigits)
          }}
          placeholder="10%"
          error={getDiscountError()}
          showError={showValidation}
        />
      </div>
    </div>
  )
}

function WizardStepTwo({
  services,
  applyAllServices,
  setApplyAllServices,
  selectedServiceIds,
  toggleService,
  error,
}: {
  services: ServiceOption[]
  applyAllServices: boolean
  setApplyAllServices: (value: boolean) => void
  selectedServiceIds: string[]
  toggleService: (id: string) => void
  error: string | null
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-xl pb-6">
      <div className="space-y-4">
        <ServiceToggleRow
          label="Aplicable para todos los servicios"
          checked={applyAllServices}
          onChange={(checked) => {
            setApplyAllServices(checked)
          }}
        />

        {services.map((service) => (
          <ServiceToggleRow
            key={service.id}
            label={service.name}
            checked={
              applyAllServices ? true : selectedServiceIds.includes(service.id)
            }
            disabled={applyAllServices}
            onChange={() => toggleService(service.id)}
          />
        ))}

        {services.length === 0 && (
          <p className="text-[13px] text-brand_gray">
            No hay servicios creados. El nivel aplicará a todos cuando existan
            servicios disponibles.
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

function WizardSuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-white">
      <div className="relative flex min-h-[100dvh] flex-1 items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] overflow-hidden">
          <EmojiConfetti />
        </div>
        <div className="relative z-10 text-center">
          <img
            src="/images/dancing-tag.webp"
            alt="Nivel creado exitosamente"
            className="mx-auto mb-6 w-[200px] md:w-auto"
          />
          <h3 className="text-xl md:text-2xl font-satoBold text-brand_dark">
            ¡Eso sí es consentir clientes!
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-base md:text-lg text-brand_gray">
            Ahora tus clientes pueden disfrutar de descuentos y beneficios ✨
          </p>
          <SecondaryButton
            type="button"
            onClick={onClose}
            className="mx-auto mt-8 md:mt-12 text-brand_dark"
          >
            Volver
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}

function WizardFooter({
  onBack,
  onNext,
  isSubmitting,
  nextText,
}: {
  onBack: () => void
  onNext: () => void
  canContinue: boolean
  isSubmitting: boolean
  nextText: string
}) {
  return (
    <div className="mx-auto mt-auto flex w-full max-w-xl items-center justify-between pt-6">
      <SecondaryButton
        type="button"
        onClick={onBack}
        isDisabled={isSubmitting}
        className="min-w-[120px] bg-white"
      >
        ← Volver
      </SecondaryButton>
      <PrimaryButton
        type="button"
        onClick={onNext}
        isDisabled={isSubmitting}
        className="min-w-[132px]"
      >
        {isSubmitting ? "Guardando..." : nextText}
      </PrimaryButton>
    </div>
  )
}

function WizardStepper({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium ${
          currentStep >= 1
            ? "bg-[#615FFF] text-white"
            : "bg-[#E5E7EB] text-[#8A90A2]"
        }`}
      >
        1
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`block h-[4px] w-[4px] rounded-full ${
              currentStep === 2 ? "bg-[#615FFF]" : "bg-brand_iron"
            }`}
          />
        ))}
      </div>
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium ${
          currentStep >= 2
            ? "bg-[#615FFF] text-white"
            : "bg-[#E5E7EB] text-[#8A90A2]"
        }`}
      >
        2
      </div>
    </div>
  )
}

// ==================== LEVEL EDIT MODAL ====================

function LevelEditModal({
  level,
  services,
  isUpdating,
  onClose,
  onDelete,
  onSubmit,
}: {
  level: Level
  services: ServiceOption[]
  isUpdating: boolean
  onClose: () => void
  onDelete: () => void
  onSubmit: (payload: {
    name: string
    minPoints: number
    discountPercent: number
    serviceIds: string[]
    imageFile: File | null
  }) => Promise<void> | void
}) {
  const [name, setName] = useState(level.name)
  const [minPoints, setMinPoints] = useState(String(level.minPoints))
  const [discountPercent, setDiscountPercent] = useState(
    String(level.discountPercent),
  )
  const [applyAllServices, setApplyAllServices] = useState(
    level.serviceIds.length === 0,
  )
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    level.serviceIds,
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    level.image ? `/api/images?key=${level.image}` : null,
  )

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit({
      name: name.trim(),
      minPoints: Number(minPoints),
      discountPercent: Number(discountPercent),
      serviceIds: applyAllServices ? [] : selectedServiceIds,
      imageFile,
    })
  }

  const shouldScrollServices = services.length > 4

  return (
    <Modal onClose={onClose}>
      <div className="mx-4 w-full max-w-[584px]">
        <form
          onSubmit={handleSubmit}
          className="flex max-h-[calc(100dvh-32px)] w-full flex-col overflow-y-auto rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center justify-between px-[32px] pb-[24px] pt-[32px]">
            <h3 className="text-lg md:text-2xl font-satoBold leading-[32px] text-brand_dark">
              Editar nivel
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0"
              aria-label="Cerrar"
            >
              <X />
            </button>
          </div>

          <div className="space-y-6 px-[32px]">
            <div>
              <label className="mb-2 block font-satoMedium text-[16px] leading-[24px] text-brand_dark">
                Imagen del nivel
              </label>
              <label className="flex cursor-pointer items-center gap-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-full border border-brand_ash object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-200 text-[20px] font-semibold text-cyan-900">
                    {level.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="rounded-[12px] border border-brand_ash bg-white px-4 py-2 text-[14px] font-satoMedium text-brand_gray transition hover:bg-[#F8F7FF]">
                  {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <BasicInput
              name="editLevelName"
              label="Nombre del nivel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. VIP, Premium, Gold"
              required
            />

            <div className="grid grid-cols-2 gap-x-[24px]">
              <BasicInput
                name="editMinPoints"
                type="number"
                min={0}
                label="Puntos requeridos"
                value={minPoints}
                onChange={(e) => setMinPoints(e.target.value)}
                placeholder="500"
                required
              />
              <BasicInput
                name="editDiscountPercent"
                type="number"
                min={0}
                max={100}
                label="% de descuento"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="15"
                required
              />
            </div>

            <div className="pt-1">
              <ServiceToggleRow
                label="Aplicable para todos los servicios"
                checked={applyAllServices}
                onChange={(checked) => setApplyAllServices(checked)}
              />
              <div
                className={
                  shouldScrollServices
                    ? "mt-[27px] flex max-h-[220px] flex-col gap-[26px] overflow-y-auto pr-1"
                    : "mt-[27px] flex flex-col gap-[26px]"
                }
              >
                {services.map((service) => (
                  <ServiceToggleRow
                    key={service.id}
                    label={service.name}
                    checked={
                      applyAllServices
                        ? true
                        : selectedServiceIds.includes(service.id)
                    }
                    disabled={applyAllServices}
                    onChange={() => toggleService(service.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end px-[32px] pb-[32px] pt-[48px]">
            <div className="flex items-center gap-[24px]">
              <button
                type="button"
                onClick={onDelete}
                className="flex h-[32px] w-[140px] items-center justify-center whitespace-nowrap text-[16px] font-satoMedium text-brand_red"
              >
                Eliminar nivel
              </button>
              <PrimaryButton
                type="submit"
                isDisabled={isUpdating}
                className="flex h-[40px] w-[120px] items-center justify-center rounded-full px-0 text-[16px] font-satoMedium"
              >
                {isUpdating ? "Guardando..." : "Guardar"}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

// ==================== SHARED EXPORTS ====================

// Re-export from canonical location
export { TabButton } from "~/components/common/TabButton"

export function EmptyStateLoyalty({ onStart }: { onStart: () => void }) {
  return (
    <div className="mt-10 flex h-[80vh] w-full items-center justify-center bg-cover px-4">
      <div className="text-center">
        <img
          className="mx-auto mb-4 w-[200px] md:w-auto"
          src="/images/emptyState/loyalty.webp"
          alt=""
        />
        <p className="text-xl md:text-2xl font-satoBold">
          ¡Convierte visitas en clientes frecuentes!
        </p>
        <p className="mx-auto mt-2 max-w-[780px] text-center text-base md:text-[18px] font-satoshi text-brand_gray">
          Activa el programa de lealtad y ofrece descuentos permanentes a tus
          clientes mas fieles, ademas de promociones para temporadas especiales
        </p>
        <PrimaryButton
          type="button"
          onClick={onStart}
          className="mx-auto mt-12"
        >
          Activar programa <ArrowRight />
        </PrimaryButton>
      </div>
    </div>
  )
}

// ==================== ICONS ====================

function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className || "h-4 w-4"}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  )
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className || "h-4 w-4"}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

function UploadLevelIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 4C2.90694 4 2 4.90694 2 6V18C2 19.0931 2.90694 20 4 20H12V18H4V6H20V12H22V6C22 4.90694 21.0931 4 20 4H4ZM14.5 11L11 15L8.5 12.5L5.77734 16H16V13L14.5 11ZM18 14V18H14V20H18V24H20V20H24V18H20V14H18Z"
        fill="#4B5563"
      />
    </svg>
  )
}
