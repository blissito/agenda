// loyaltyStep.tsx

import type {
  ChangeEvent,
  ComponentType,
  FormEvent,
  ReactNode,
} from "react"
import { useState } from "react"
import { useRevalidator } from "react-router"
import { EmojiConfetti } from "~/components/common/EmojiConfetti"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { ArrowRight } from "~/components/icons/arrowRight"
import { BasicInput } from "~/components/forms/BasicInput"

import type { Level, ServiceOption } from "~/routes/dash/dash.lealtad"
import { X } from "~/components/icons/X"

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

const CardActionButton = ({
  onClick,
  icon: Icon,
  title,
}: {
  onClick: () => void
  icon: ComponentType
  title: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-brand_gray shadow-sm"
    title={title}
  >
    <Icon />
  </button>
)

export function Modal({
  onClose,
  children,
}: {
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6">
        {children}
      </div>
    </div>
  )
}

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

  const apiCall = async (intent: string, payload: Record<string, unknown>) => {
    await fetch(`/api/loyalty?intent=${intent}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }),
    })
    revalidator.revalidate()
  }

  const handleDelete = async (level: Level) => {
    const res = await fetch("/api/loyalty?intent=delete-level", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        data: JSON.stringify({ levelId: level.id }),
      }),
    })
    const result = await res.json()

    if (result.error) {
      alert(result.error)
    } else {
      revalidator.revalidate()
    }
  }

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingLevel) return

    const form = e.currentTarget
    const selectedServices = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="editServiceId"]:checked',
      ),
    ).map((el) => el.value)

    const fileInput = form.elements.namedItem(
      "editLevelImage",
    ) as HTMLInputElement
    let imageKey: string | null = editingLevel.image

    if (fileInput?.files?.[0]) {
      imageKey = await uploadLevelImage(fileInput.files[0])
    }

    await apiCall("update-level", {
      levelId: editingLevel.id,
      name: (form.elements.namedItem("editLevelName") as HTMLInputElement).value,
      minPoints: Number(
        (form.elements.namedItem("editMinPoints") as HTMLInputElement).value,
      ),
      discountPercent: Number(
        (form.elements.namedItem("editDiscountPercent") as HTMLInputElement)
          .value,
      ),
      serviceIds: selectedServices,
      image: imageKey,
    })

    setEditingLevel(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => (
          <LoyaltyLevelCard
            key={level.id}
            level={level}
            onEdit={() => setEditingLevel(level)}
            onDelete={() => handleDelete(level)}
          />
        ))}
      </div>

      {editingLevel && (
        <Modal onClose={() => setEditingLevel(null)}>
          <LevelForm
            title="Editar nivel"
            services={services}
            onSubmit={handleUpdate}
            isLoading={false}
            onCancel={() => setEditingLevel(null)}
            namePrefix="edit"
            serviceCheckboxName="editServiceId"
            defaultValues={editingLevel}
          />
        </Modal>
      )}
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

  return (
    <div className="group overflow-hidden rounded-[16px] bg-white">
      <div className="relative overflow-hidden rounded-t-[16px] bg-white">
        <div className="aspect-[1.55/1] w-full">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={level.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EEEAFE] to-[#F8F7FF] text-[28px] font-semibold text-[#615FFF]">
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
    <div className="fixed inset-0 z-50 bg-white">
      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-y-auto bg-white px-4 py-5 sm:px-8 sm:py-6">
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
      <h2 className="text-2xl font-satoBold text-brand_dark">
        ¡Empecemos! Crea un nuevo nivel para tus clientes
      </h2>
      <div className="mt-5 flex justify-center">
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
    <div className="mx-auto mt-8 w-full max-w-[440px] pb-6">
      <BasicInput
        label="Nombre del nivel"
        name="levelName"
        value={levelName}
        onChange={(e) => setLevelName(e.target.value)}
        placeholder="Ej. VIP, Premium, Gold"
        required
      />
      {showValidation && !levelName.trim() && (
        <p className="mt-1 text-[12px] text-red-500">
          Este campo es obligatorio
        </p>
      )}

      <div className="mt-5">
        <label className="mb-2 block font-satoMedium text-[16px] leading-[24px] text-brand_dark">
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

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <BasicInput
            label="Puntos requeridos"
            name="minPoints"
            type="text"
            inputMode="numeric"
            value={minPoints}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/\D/g, "")
              setMinPoints(onlyDigits)
            }}
            placeholder="00"
            required
          />
          {showValidation && getMinPointsError() && (
            <p className="mt-1 text-[12px] text-red-500">
              {getMinPointsError()}
            </p>
          )}
        </div>

        <div>
          <BasicInput
            label="Porcentaje de descuento"
            name="discountPercent"
            type="text"
            inputMode="numeric"
            value={discountPercent}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/\D/g, "")
              setDiscountPercent(onlyDigits)
            }}
            placeholder="10%"
            required
          />
          {showValidation && getDiscountError() && (
            <p className="mt-1 text-[12px] text-red-500">
              {getDiscountError()}
            </p>
          )}
        </div>
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
    <div className="mx-auto mt-8 w-full max-w-[440px] pb-6">
      <div>
        <ServiceToggleRow
          label="Aplicable para todos los servicios"
          checked={applyAllServices}
          onChange={(checked) => {
            setApplyAllServices(checked)
          }}
        />

        {services.length > 0 && (
             <div className="mt-6 flex flex-col gap-6">

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
        )}

        {services.length === 0 && (
          <p className="mt-[27px] text-[16px] leading-[22px] text-brand_gray">
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
    <div className="fixed inset-0 z-50 bg-white">
      <div className="relative flex min-h-[100dvh] flex-1 items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] overflow-hidden">
          <EmojiConfetti />
        </div>
        <div className="relative z-10 text-center">
          <img
            src="/images/dancing-tag.webp"
            alt="Nivel creado exitosamente"
            className="mx-auto mb-6 w-[150px] sm:w-[190px] md:w-[220px]"
          />
          <h3 className="text-2xl font-satoBold text-brand_dark">
            ¡Eso sí es consentir clientes!
          </h3>
          <p className="mx-auto mt-3 max-w-[420px] text-[18px] text-brand_gray">
            Ahora tus clientes pueden disfrutar de descuentos y beneficios ✨
          </p>
          <div className="mt-12">
            <SecondaryButton
              type="button"
              onClick={onClose}
              className="mx-auto h-10 min-w-[180px] text-brand_dark"
            >
              Volver
            </SecondaryButton>
          </div>
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
    <div className="mx-auto mt-auto flex w-full max-w-[440px] items-center justify-between pb-3 pt-6">
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

function ServiceToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-[52px]">
      <span className="min-w-0 flex-1 font-satoMedium text-[16px] leading-[22px] text-brand_dark">
        {label}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[#615FFF]" : "bg-[#E5E7EB]"
        } ${disabled ? "opacity-100" : ""}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  )
}

// ==================== LEVEL FORM ====================

function LevelForm({
  title,
  services,
  onSubmit,
  isLoading,
  onCancel,
  namePrefix,
  serviceCheckboxName,
  defaultValues,
}: {
  title: string
  services: ServiceOption[]
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onCancel: () => void
  namePrefix: string
  serviceCheckboxName: string
  defaultValues?: Level
}) {
  const n = (name: string) =>
    namePrefix
      ? `${namePrefix}${name.charAt(0).toUpperCase() + name.slice(1)}`
      : name

  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultValues?.image ? `/api/images?key=${defaultValues.image}` : null,
  )

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 max-w-lg space-y-4 rounded-xl bg-gray-50 p-5"
    >
      <h3 className="text-lg font-semibold">{title}</h3>

      <div>
        <label className="mb-2 block font-satoMedium text-[16px] leading-[24px] text-brand_gray">
          Imagen del nivel
        </label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-16 w-16 rounded-full border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-400">
              Sin imagen
            </div>
          )}
          <label className="cursor-pointer rounded-lg border border-brand_stroke bg-white px-3 py-2 text-sm text-brand_gray hover:bg-gray-50">
            {imagePreview ? "Cambiar" : "Subir imagen"}
            <input
              type="file"
              name={n("levelImage")}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      <div>
        <BasicInput
          name={n("levelName")}
          label="Nombre del nivel"
          defaultValue={defaultValues?.name}
          required
          placeholder="Ej. VIP, Premium, Gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <BasicInput
            name={n("minPoints")}
            type="number"
            min={0}
            label="Puntos requeridos"
            defaultValue={defaultValues?.minPoints}
            required
            placeholder="500"
          />
        </div>
        <div>
          <BasicInput
            name={n("discountPercent")}
            type="number"
            min={0}
            max={100}
            step={0.1}
            label="% de descuento"
            defaultValue={defaultValues?.discountPercent}
            required
            placeholder="15"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-satoMedium text-[16px] leading-[24px] text-brand_gray">
          Servicios donde aplica el descuento
        </label>
        <p className="mb-2 text-xs text-brand_gray">
          Si no seleccionas ninguno, aplica a todos.
        </p>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border bg-white p-3">
          {services.length === 0 ? (
            <p className="text-xs text-brand_gray">No hay servicios creados.</p>
          ) : (
            services.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-2 py-0.5 text-sm"
              >
                <input
                  type="checkbox"
                  name={serviceCheckboxName}
                  value={s.id}
                  defaultChecked={defaultValues?.serviceIds.includes(s.id)}
                  className="rounded border-gray-300"
                />
                {s.name}
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <SecondaryButton type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </SecondaryButton>
        <PrimaryButton type="submit" isDisabled={isLoading} className="flex-1">
          {isLoading ? "Guardando..." : "Guardar"}
        </PrimaryButton>
      </div>
    </form>
  )
}

// ==================== SHARED EXPORTS ====================

export function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-2 text-base font-satoMedium ${
        active ? "text-brand_dark" : "text-brand_gray"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#615FFF]" />
      )}
    </button>
  )
}

export function EmptyStateLoyalty({ onStart }: { onStart: () => void }) {
  return (
    <div className="mt-10 flex h-[80vh] w-full items-center justify-center bg-cover">
      <div className="text-center">
        <img
          className="mx-auto mb-4"
          src="/images/emptyState/loyalty.webp"
          alt=""
        />
        <p className="text-2xl font-satoBold">
          ¡Convierte visitas en clientes frecuentes!
        </p>
        <p className="mx-auto mt-2 max-w-[780px] text-center text-[18px] text-brand_gray">
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