import { useEffect, useMemo, useRef, useState } from "react"
import type {
  FormEvent,
  ReactNode,
  UIEvent,
} from "react"
import { useRevalidator } from "react-router"
import { twMerge } from "tailwind-merge"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { EmojiConfetti } from "~/components/common/EmojiConfetti"
import { ArrowRight } from "~/components/icons/arrowRight"
import { X } from "~/components/icons/X"
import type {
  Reward,
  ServiceOption,
  Transaction,
} from "~/routes/dash/dash.lealtad"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { BasicInput } from "~/components/forms/BasicInput"

const COUPON_META_PREFIX = "__COUPON_META__:"

type DiscountType = "discount_percent" | "discount_fixed"
type DurationType = "one_time" | "several_months" | "forever"

type CouponMeta = {
  code: string
  durationType: DurationType
  months: number
  applyAllServices: boolean
  serviceIds: string[]
}

type CouponListItem = {
  reward: Reward
  meta: CouponMeta | null
}

function parseCouponMeta(description: string | null | undefined): CouponMeta | null {
  if (!description || !description.startsWith(COUPON_META_PREFIX)) return null

  try {
    const parsed = JSON.parse(
      description.slice(COUPON_META_PREFIX.length),
    ) as Partial<CouponMeta> & { durationType?: string }

    const normalizedDurationType: DurationType =
      parsed.durationType === "several_months"
        ? "several_months"
        : parsed.durationType === "forever"
          ? "forever"
          : "one_time"

    return {
      code: parsed.code || "",
      durationType: normalizedDurationType,
      months:
        typeof parsed.months === "number" && parsed.months > 0 ? parsed.months : 1,
      applyAllServices: Boolean(parsed.applyAllServices),
      serviceIds: Array.isArray(parsed.serviceIds) ? parsed.serviceIds : [],
    }
  } catch {
    return null
  }
}

function buildCouponDescription(meta: CouponMeta) {
  return `${COUPON_META_PREFIX}${JSON.stringify(meta)}`
}

function formatFixedAmount(value: number) {
  return `$ ${Math.round(value / 100)} mxn`
}

function getCouponDiscountLabel(reward: Reward) {
  if (reward.type === "discount_fixed") {
    return formatFixedAmount(reward.value)
  }

  if (reward.type === "discount_percent") {
    return `${reward.value}%`
  }

  return "—"
}

function getCouponBadgeLabel(reward: Reward) {
  if (reward.type === "discount_fixed") {
    return `$${Math.round(reward.value / 100)}`
  }

  if (reward.type === "discount_percent") {
    return `${reward.value}%`
  }

  return "—"
}

function getDurationLabel(meta: CouponMeta | null) {
  if (!meta) return "Una vez"
  if (meta.durationType === "one_time") return "Una vez"
  if (meta.durationType === "forever") return "Para siempre"
  return `${meta.months} meses`
}

function getServicesLabel(meta: CouponMeta | null, services: ServiceOption[]) {
  if (!meta || meta.applyAllServices || meta.serviceIds.length === 0) {
    return "Todos"
  }

  const names = services
    .filter((service) => meta.serviceIds.includes(service.id))
    .map((service) => service.name)

  if (names.length === 0) return "Todos"
  if (names.length === 1) return names[0]
  return `${names.length} servicios`
}

function Modal({
  onClose,
  children,
}: {
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#D3D3D3]/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {children}
    </div>
  )
}

// Nuevo componente CustomSelect basado en FieldSelect del primer código

function CustomSelect({
  value,
  onChange,
  children,
  className = "",
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const options = useMemo(() => {
    if (!children) return []
    return (Array.isArray(children) ? children : [children])
      .filter((child): child is React.ReactElement => {
        return (
          child !== null &&
          child !== undefined &&
          typeof child === "object" &&
          "props" in child
        )
      })
      .map((child) => {
        const element = child as React.ReactElement<{
          value?: string
          children?: React.ReactNode
        }>

        return {
          value: String(element.props.value ?? ""),
          label: element.props.children,
        }
      })
  }, [children])

  const selectedOption = options?.find((option) => option.value === value)
  const selectedLabel = selectedOption?.label ?? options?.[0]?.label ?? ""

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(nextValue: string) {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
     <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className="flex h-[44px] w-full items-center rounded-[16px] border border-brand_ash bg-white px-4 pr-10 text-left text-[16px] leading-[24px] text-brand_dark outline-none transition focus:border-[#615FFF] disabled:opacity-50"
      >
        <span className="truncate">{selectedLabel}</span>
      </button>

      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-brand_gray"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {open && !disabled ? (
        <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-[16px] border border-brand_ash bg-white shadow-md">
          {options?.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={[
                  "flex w-full items-center px-4 py-3 text-left text-[16px] leading-[24px] transition",
                  isSelected
                    ? "bg-[#F8F7FF] text-brand_dark"
                    : "bg-white text-brand_dark hover:bg-[#F8F7FF]",
                ].join(" ")}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

const WizardSelect = ({
  label,
  required = false,
  error,
  showError = false,
  children,
  value,
  onChange,
  className = "",
}: {
  label: string
  required?: boolean
  error?: string
  showError?: boolean
  children: ReactNode
  value: string
  onChange: (value: string) => void
  className?: string
}) => (
  <div>
    <label className="mb-2 block font-satoMedium text-[16px] leading-[24px] text-brand_dark">
      {label}
      {required}
    </label>

    <CustomSelect
      value={value}
      onChange={onChange}
      className={showError && error ? "border-brand_red" : ""}
    >
      {children}
    </CustomSelect>

    {showError && error && (
      <p className="mt-1 text-[12px] text-brand_red">{error}</p>
    )}
  </div>
)

export function CuponesTab({
  rewards,
  transactions,
  services,
  isCreateOpen,
  onOpenCreate,
  onCloseCreate,
}: {
  rewards: Reward[]
  transactions: Transaction[]
  services: ServiceOption[]
  isCreateOpen: boolean
  onOpenCreate: () => void
  onCloseCreate: () => void
}) {
  const revalidator = useRevalidator()
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

  const items = useMemo<CouponListItem[]>(
    () =>
      rewards.map((reward) => ({
        reward,
        meta: parseCouponMeta(reward.description),
      })),
    [rewards],
  )

  const apiCall = async (intent: string, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/loyalty?intent=${intent}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }),
    })
    return res.json()
  }

  const handleToggleActive = async (reward: Reward) => {
    await apiCall("update-reward", {
      rewardId: reward.id,
      isActive: !reward.isActive,
    })
    setOpenMenuId(null)
    revalidator.revalidate()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    const result = await apiCall("delete-reward", { rewardId: deleteTarget.id })
    if (result.error) {
      alert(result.error)
    } else {
      setDeleteTarget(null)
      setOpenMenuId(null)
      revalidator.revalidate()
    }
  }

  const handleUpdateReward = async (
    e: FormEvent<HTMLFormElement>,
    editDiscountType: DiscountType,
    editDurationType: DurationType,
    applyAllServices: boolean,
    selectedServiceIds: string[],
  ) => {
    e.preventDefault()
    if (!editingReward) return

    setIsUpdating(true)
    const form = e.currentTarget

    const nextName = (form.elements.namedItem("editName") as HTMLInputElement).value.trim()
    const nextCode = (form.elements.namedItem("editCode") as HTMLInputElement).value.trim()
    const nextValueRaw = (
      form.elements.namedItem("editValue") as HTMLInputElement
    ).value.trim()

    const nextMonthsRaw = (
      form.elements.namedItem("editMonths") as HTMLInputElement | null
    )?.value.trim() || ""

    const numericValue = Number(nextValueRaw || "0")
    const numericMonths = Number(nextMonthsRaw || "1")

    await apiCall("update-reward", {
      rewardId: editingReward.id,
      name: nextName,
      description: buildCouponDescription({
        code: nextCode,
        durationType: editDurationType,
        months: editDurationType === "several_months" ? numericMonths : 1,
        applyAllServices,
        serviceIds: applyAllServices ? [] : selectedServiceIds,
      }),
      type: editDiscountType,
      value:
        editDiscountType === "discount_fixed"
          ? Math.round(numericValue * 100)
          : numericValue,
      pointsCost: editingReward.pointsCost,
    })

    setEditingReward(null)
    setIsUpdating(false)
    revalidator.revalidate()
  }

  if (items.length === 0 && !isCreateOpen) {
    return <EmptyStateCupones onStart={onOpenCreate} />
  }

  return (
    <>
      {isCreateOpen && (
        <CuponWizard
          services={services}
          onClose={onCloseCreate}
          onCreated={() => {}}
        />
      )}

      {editingReward && (
        <CouponEditModal
          reward={editingReward}
          services={services}
          isUpdating={isUpdating}
          onClose={() => setEditingReward(null)}
          onDelete={() => {
            setDeleteTarget(editingReward)
            setEditingReward(null)
          }}
          onSubmit={handleUpdateReward}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Seguro que quieres eliminar este cupón?"
        description="Al eliminarlo, el cupón dejará de estar disponible para tus clientes."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {items.length > 0 && (
        <div className="mx-auto w-full ">
          <CouponTableHeader />
          {items.map(({ reward, meta }, index) => (
            <CouponRow
              key={reward.id}
              reward={reward}
              meta={meta}
              services={services}
              isLast={index === items.length - 1}
              menuOpen={openMenuId === reward.id}
              menuRef={openMenuId === reward.id ? menuRef : undefined}
              onOpenEdit={() => setEditingReward(reward)}
              onToggleMenu={() =>
                setOpenMenuId((prev) => (prev === reward.id ? null : reward.id))
              }
              onToggleActive={() => handleToggleActive(reward)}
              onDelete={() => setDeleteTarget(reward)}
            />
          ))}
        </div>
      )}

      {transactions.length > 0 && (
        <TransactionsTable transactions={transactions} />
      )}
    </>
  )
}

function CouponTableHeader() {
  const titles: [string, string][] = [
    ["Cupón", "col-span-10 sm:col-span-4 pl-2"],
    ["Descuento", "hidden sm:block sm:col-span-2 text-center"],
    ["Duración", "hidden sm:block sm:col-span-2 text-center"],
    ["Servicios", "hidden sm:block sm:col-span-3 text-center"],
    ["Acciones", "col-span-2 sm:col-span-1 text-center"],
  ]

  return (
    <div className="mt-4 grid grid-cols-12 items-center rounded-t-2xl border-b  border-slate-200 bg-white px-2 py-3 text-[12px] font-satoMedium uppercase tracking-wide text-slate-600 sm:px-4">
      {titles.map(([title, classes]) => (
        <h3
          key={`${title}-${classes}`}
          className={twMerge("capitalize whitespace-nowrap", classes)}
        >
          {title}
        </h3>
      ))}
    </div>
  )
}

function CouponRow({
  reward,
  meta,
  services,
  isLast,
  menuOpen,
  menuRef,
  onOpenEdit,
  onToggleMenu,
  onToggleActive,
  onDelete,
}: {
  reward: Reward
  meta: CouponMeta | null
  services: ServiceOption[]
  isLast?: boolean
  menuOpen: boolean
  menuRef?: React.RefObject<HTMLDivElement | null>
  onOpenEdit: () => void
  onToggleMenu: () => void
  onToggleActive: () => void
  onDelete: () => void
}) {
  return (
    <div
    className={twMerge(
      "grid grid-cols-12 items-center bg-white px-2 transition-colors hover:bg-slate-50 sm:px-4",
      !isLast && "border-b border-slate-200",
      isLast && "rounded-b-2xl",
    )}
    >
      <button
        type="button"
        onClick={onOpenEdit}
        className="col-span-10 grid min-w-0 grid-cols-10 items-center py-3 text-left sm:col-span-11 sm:grid-cols-11"
      >
        <div className="col-span-10 flex min-w-0 items-center gap-3 sm:col-span-4">
          <div className="flex h-[32px] min-w-[40px] items-center justify-center rounded-[8px] bg-[#121212] px-2 text-[12px] font-satoBold text-white">
            {getCouponBadgeLabel(reward)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-brand_dark">
              {reward.name}
            </p>
            <p className="truncate text-xs font-satoMedium text-brand_gray">
              {meta?.code || getCouponDiscountLabel(reward)}
            </p>
            <div className="mt-1 truncate text-[12px] text-brand_gray sm:hidden">
              {getCouponDiscountLabel(reward)} · {getDurationLabel(meta)} ·{" "}
              {getServicesLabel(meta, services)}
            </div>
          </div>
        </div>

        <p className="hidden whitespace-nowrap text-center text-sm text-brand_gray sm:col-span-2 sm:block">
          {getCouponDiscountLabel(reward)}
        </p>

        <p className="hidden whitespace-nowrap text-center text-sm text-brand_gray sm:col-span-2 sm:block">
          {getDurationLabel(meta)}
        </p>

        <p className="hidden truncate whitespace-nowrap text-center text-sm text-brand_gray sm:col-span-3 sm:block">
          {getServicesLabel(meta, services)}
        </p>
      </button>

      <div
        className="relative col-span-2 flex items-center justify-center py-3 sm:col-span-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onToggleMenu}
          className="flex h-8 w-8 items-center justify-center rounded-full text-brand_gray hover:bg-[#F8F7FF]"
          aria-label="Acciones"
        >
          <DotsIcon />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-12 z-20 w-[188px] rounded-[18px] bg-white p-2 shadow-[0_12px_28px_rgba(16,24,40,0.12)] ring-1 ring-[#F2F4F7]"
          >
           <div>
  <button
    type="button"
    onClick={onToggleActive}
    className="flex h-[52px] w-full items-center gap-3 rounded-[14px] px-4 text-left text-brand_gray transition hover:bg-[#F5F5F7]"
  >
    <span className="flex h-8 w-8 items-center justify-center text-brand_gray">
      <PauseSmallIcon />
    </span>
    <span className="text-base font-satoMedium text-brand_gray">
      {reward.isActive ? "Desactivar" : "Activar"}
    </span>
  </button>

  <button
    type="button"
    onClick={onDelete}
    className="flex h-[52px] w-full items-center gap-3 rounded-[14px] px-4 text-left text-brand_red transition hover:bg-[#FDF3F3]"
  >
    <span className="flex h-8 w-8 items-center justify-center text-brand_red">
      <TrashSmallIcon />
    </span>
    <span className="text-base font-satoMedium text-brand_red">
      Eliminar
    </span>
  </button>
</div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyStateCupones({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[calc(100dvh-220px)] w-full items-center justify-center bg-cover">
      <div className="text-center">
        <img
          className="mx-auto mb-4"
          src="/images/emptyState/loyalty.webp"
          alt="Empty state cupones"
        />
        <p className="text-2xl font-satoBold text-brand_dark">
          Aquí huele a descuento... pero falta el cupón
        </p>
        <p className="mx-auto mt-2 max-w-[780px] text-center text-[18px] text-brand_gray">
          Créalo y deja que empiece la magia ✨
        </p>

        <PrimaryButton
          type="button"
          onClick={onStart}
          className="mx-auto mt-12"
        >
          Crear cupón <ArrowRight />
        </PrimaryButton>
      </div>
    </div>
  )
}

function CuponWizard({
  services,
  onClose,
  onCreated,
}: {
  services: ServiceOption[]
  onClose: () => void
  onCreated: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [couponName, setCouponName] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [discountType, setDiscountType] = useState<DiscountType>("discount_percent")
  const [discountValue, setDiscountValue] = useState("")
  const [durationType, setDurationType] = useState<DurationType>("one_time")
  const [months, setMonths] = useState("")
  const [applyAllServices, setApplyAllServices] = useState(true)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [showValidation, setShowValidation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepTwoError, setStepTwoError] = useState<string | null>(null)

  const parsedDiscountValue = Number(discountValue)
  const parsedMonths = Number(months)

  const isStepOneValid =
    couponName.trim().length > 0 &&
    couponCode.trim().length > 0 &&
    discountValue !== "" &&
    Number.isFinite(parsedDiscountValue) &&
    parsedDiscountValue >= 1 &&
    (discountType === "discount_percent" ? parsedDiscountValue <= 100 : true) &&
    (
      durationType !== "several_months" ||
      (months !== "" && Number.isFinite(parsedMonths) && parsedMonths >= 2)
    )

  const isStepTwoValid =
    applyAllServices || selectedServiceIds.length > 0 || services.length === 0

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const handleBack = () => {
    if (isSubmitting) return
    setShowValidation(false)
    setStepTwoError(null)

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
      setStepTwoError(null)
      setStep(2)
      return
    }

    if (step === 2) {
      if (!isStepTwoValid) {
        setStepTwoError("Selecciona al menos un servicio.")
        return
      }

      void handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!isStepTwoValid || isSubmitting) return

    setIsSubmitting(true)
    setStepTwoError(null)

    try {
      const response = await fetch("/api/loyalty?intent=create-reward", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          data: JSON.stringify({
            name: couponName.trim(),
            description: buildCouponDescription({
              code: couponCode.trim(),
              durationType,
              months: durationType === "several_months" ? parsedMonths : 1,
              applyAllServices,
              serviceIds: applyAllServices ? [] : selectedServiceIds,
            }),
            type: discountType,
            value:
              discountType === "discount_fixed"
                ? Math.round(parsedDiscountValue * 100)
                : parsedDiscountValue,
            pointsCost: 0,
          }),
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || result?.error) {
        throw new Error(result?.error || "No se pudo crear el cupón.")
      }

      setStep(3)
      onCreated()
    } catch (error) {
      setStepTwoError(
        error instanceof Error ? error.message : "No se pudo crear el cupón.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 3) {
    return <CouponSuccessScreen onClose={onClose} />
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

        <div className="mx-auto w-full pt-10 text-center sm:pt-8">
          <h2 className="text-2xl font-satoBold text-brand_dark">
            ¡Empecemos! Crea tu próximo descuento
          </h2>
          <div className="mt-5 flex justify-center">
            <CouponStepper currentStep={step} />
          </div>
        </div>

        {step === 1 && (
          <CouponWizardStepOne
            couponName={couponName}
            setCouponName={setCouponName}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            durationType={durationType}
            setDurationType={setDurationType}
            months={months}
            setMonths={setMonths}
            showValidation={showValidation}
          />
        )}

        {step === 2 && (
          <CouponWizardStepTwo
            services={services}
            applyAllServices={applyAllServices}
            setApplyAllServices={setApplyAllServices}
            selectedServiceIds={selectedServiceIds}
            toggleService={toggleService}
            error={stepTwoError}
          />
        )}

        <div className="mx-auto mt-auto flex w-full max-w-[440px] items-center justify-between pb-3 pt-6">
          <SecondaryButton
            type="button"
            onClick={handleBack}
            isDisabled={isSubmitting}
            className="min-w-[120px] bg-white"
          >
            ← Volver
          </SecondaryButton>

          <PrimaryButton
            type="button"
            onClick={handleNext}
            isDisabled={isSubmitting}
            className="min-w-[132px]"
          >
            {isSubmitting ? "Guardando..." : "Continuar"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

function CouponWizardStepOne({
  couponName,
  setCouponName,
  couponCode,
  setCouponCode,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  durationType,
  setDurationType,
  months,
  setMonths,
  showValidation,
}: {
  couponName: string
  setCouponName: (value: string) => void
  couponCode: string
  setCouponCode: (value: string) => void
  discountType: DiscountType
  setDiscountType: (value: DiscountType) => void
  discountValue: string
  setDiscountValue: (value: string) => void
  durationType: DurationType
  setDurationType: (value: DurationType) => void
  months: string
  setMonths: (value: string) => void
  showValidation: boolean
}) {
  const getDiscountValueError = () => {
    if (!discountValue) return "Este campo es obligatorio"
    const value = Number(discountValue)
    if (value < 1) return "Debe ser mayor o igual a 1"
    if (discountType === "discount_percent" && value > 100) {
      return "Debe ser menor o igual a 100"
    }
    return ""
  }

  const getMonthsError = () => {
    if (durationType !== "several_months") return ""
    if (!months) return "Este campo es obligatorio"
    if (Number(months) < 2) return "Debe ser mayor o igual a 2"
    return ""
  }

  const discountValueError = getDiscountValueError()
  const monthsError = getMonthsError()

  return (
    <div className="mx-auto mt-8 w-full max-w-[440px] pb-6">
      <BasicInput
        label="Nombre del cupón"
        name="couponName"
        value={couponName}
        onChange={(e) => setCouponName(e.target.value)}
        placeholder="Buen Fin"
        required
      />
      {showValidation && !couponName.trim() && (
        <p className="mt-1 text-[12px] text-brand_red">
          Este campo es obligatorio
        </p>
      )}

      <div className="mt-5">
        <BasicInput
          label="Código del cupón"
          name="couponCode"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="BuenFin2026"
          required
        />
        {showValidation && !couponCode.trim() && (
          <p className="mt-1 text-[12px] text-brand_red">
            Este campo es obligatorio
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <WizardSelect
          label="Tipo de descuento"
          required
          value={discountType}
          onChange={(value) =>
            setDiscountType(
              value === "discount_fixed"
                ? "discount_fixed"
                : "discount_percent",
            )
          }
          error=""
          showError={false}
        >
          <option value="discount_percent">% de descuento</option>
          <option value="discount_fixed">Importe fijo</option>
        </WizardSelect>

        <div>
          <BasicInput
            label={
              discountType === "discount_percent"
                ? "Porcentaje"
                : "Cantidad (mxn)"
            }
            name="discountValue"
            type="text"
            inputMode="numeric"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value.replace(/\D/g, ""))}
            placeholder={discountType === "discount_percent" ? "15%" : "$120"}
            required
          />
          {showValidation && discountValueError && (
            <p className="mt-1 text-[12px] text-brand_red">
              {discountValueError}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <WizardSelect
          label="Duración"
          required
          value={durationType}
          onChange={(value) =>
            setDurationType(
              value === "several_months"
                ? "several_months"
                : value === "forever"
                  ? "forever"
                  : "one_time",
            )
          }
          error=""
          showError={false}
        >
          <option value="one_time">Una vez</option>
          <option value="several_months">Varios meses</option>
          <option value="forever">Para siempre</option>
        </WizardSelect>

        {durationType === "several_months" ? (
          <div>
            <BasicInput
              label="No. de meses"
              name="months"
              type="text"
              inputMode="numeric"
              value={months}
              onChange={(e) => setMonths(e.target.value.replace(/\D/g, ""))}
              placeholder="2"
              required
            />
            {showValidation && monthsError && (
              <p className="mt-1 text-[12px] text-brand_red">
                {monthsError}
              </p>
            )}
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

function CouponWizardStepTwo({
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

<div className="mt-6 flex flex-col gap-6">
    {services.map((service) => (
      <ServiceToggleRow
        key={service.id}
        label={service.name}
        checked={applyAllServices ? true : selectedServiceIds.includes(service.id)}
        disabled={applyAllServices}
        onChange={() => toggleService(service.id)}
      />
    ))}
  </div>
</div>

      {error && (
        <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

function CouponSuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="relative flex min-h-[100dvh] flex-1 items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] overflow-hidden">
          <EmojiConfetti />
        </div>

        <div className="relative z-10 text-center">
          <img
            src="/images/dancing-tag.webp"
            alt="Cupón creado exitosamente"
            className="mx-auto mb-6 w-[150px] sm:w-[190px] md:w-[220px]"
          />

          <h3 className="text-2xl font-satoBold text-brand_dark">
            ¡Ese descuento se ve bien!
          </h3>

          <p className="mx-auto mt-3 max-w-[420px] text-[18px] text-brand_gray">
            Ya puedes compartirlo con tus clientes 🎉
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

function CouponStepper({ currentStep }: { currentStep: 1 | 2 }) {
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
      <span className="min-w-0 flex-1 font-satoMedium text-[16px] leading-[27px] text-brand_dark">
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

function CouponEditModal({
  reward,
  services,
  isUpdating,
  onClose,
  onDelete,
  onSubmit,
}: {
  reward: Reward
  services: ServiceOption[]
  isUpdating: boolean
  onClose: () => void
  onDelete: () => void
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    editDiscountType: DiscountType,
    editDurationType: DurationType,
    applyAllServices: boolean,
    selectedServiceIds: string[],
  ) => Promise<void> | void
}) {
  const currentMeta =
    parseCouponMeta(reward.description) || {
      code: "",
      durationType: "one_time" as DurationType,
      months: 1,
      applyAllServices: true,
      serviceIds: [],
    }

  const [editDiscountType, setEditDiscountType] = useState<DiscountType>(
    reward.type === "discount_fixed" ? "discount_fixed" : "discount_percent",
  )

  const [editDurationType, setEditDurationType] = useState<DurationType>(
    currentMeta.durationType,
  )

  const [applyAllServices, setApplyAllServices] = useState(
    currentMeta.applyAllServices,
  )

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    currentMeta.serviceIds,
  )

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const [hasScrolledTop, setHasScrolledTop] = useState(false)
  const [hasReachedBottom, setHasReachedBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  
  const updateScrollState = (element: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = element
  
    setHasScrolledTop(scrollTop > 0)
    setHasReachedBottom(scrollTop + clientHeight >= scrollHeight - 2)
  }
  
  const handleBodyScroll = (e: UIEvent<HTMLDivElement>) => {
    updateScrollState(e.currentTarget)
  }
  
  useEffect(() => {
    if (scrollRef.current) {
      updateScrollState(scrollRef.current)
    }
  }, [reward, editDurationType, applyAllServices, selectedServiceIds.length, services.length])

  return (
    <Modal onClose={onClose}>
      <div className="mx-4 w-full max-w-[584px]">
        <form
          onSubmit={(e) =>
            onSubmit(
              e,
              editDiscountType,
              editDurationType,
              applyAllServices,
              selectedServiceIds,
            )
          }
          className="flex h-[min(848px,calc(100dvh-32px))] w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
        >
          <div
            ref={scrollRef}
            onScroll={handleBodyScroll}
            className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
          <div className="sticky top-0 z-20">
  <div
    className={twMerge(
      "absolute inset-0 pointer-events-none transition-opacity duration-200",
      hasScrolledTop
        ? " backdrop-blur-sm opacity-100"
        : "bg-white opacity-100",
    )}
  />

  <div className="relative px-8 pt-8 pb-8">
    <div className="flex items-center justify-between">
      <h3 className="text-2xl font-satoBold leading-[32px] text-brand_dark">
        Editar cupón
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
  </div>

  <div
    className={twMerge(
      "pointer-events-none absolute inset-x-0 -bottom-4 h-4 transition-opacity duration-200",
      hasScrolledTop
        ? "bg-gradient-to-b from-white/90 to-transparent opacity-100"
        : "opacity-0",
    )}
  />
</div>
  
            <div className="px-[32px] pb-[24px]">
              <div className="space-y-6">
                <div>
                  <BasicInput
                    name="editName"
                    label="Nombre del cupón"
                    defaultValue={reward.name}
                    placeholder="Nombre del cupón"
                    required
                  />
                </div>
  
                <div>
                  <BasicInput
                    name="editCode"
                    label="Código del cupón (Código que usarán tus clientes)"
                    defaultValue={currentMeta.code}
                    placeholder="Código del cupón"
                    required
                  />
                </div>
  
                <div className="grid grid-cols-2 gap-x-[24px]">
                  <div>
                    <label className="mb-2 block font-satoMedium text-[16px] leading-[24px] text-brand_dark">
                      Tipo de descuento
                    </label>
                    <CustomSelect
                      value={editDiscountType}
                      onChange={(value) =>
                        setEditDiscountType(
                          value === "discount_fixed"
                            ? "discount_fixed"
                            : "discount_percent",
                        )
                      }
                      className="h-[40px]"
                    >
                      <option value="discount_percent">% de descuento</option>
                      <option value="discount_fixed">Importe fijo</option>
                    </CustomSelect>
                  </div>
  
                  <div>
                    <BasicInput
                      name="editValue"
                      type="number"
                      min={1}
                      label={
                        editDiscountType === "discount_percent"
                          ? "Porcentaje"
                          : "Cantidad (mxn)"
                      }
                      defaultValue={
                        reward.type === "discount_fixed"
                          ? reward.value / 100
                          : reward.value
                      }
                      placeholder="Valor"
                      required
                    />
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-x-[24px]">
                  <div>
                    <label className="mb-2 block font-satoMedium text-[16px] leading-[24px] text-brand_dark">
                      Duración
                    </label>
                    <CustomSelect
                      value={editDurationType}
                      onChange={(value) =>
                        setEditDurationType(
                          value === "several_months"
                            ? "several_months"
                            : value === "forever"
                              ? "forever"
                              : "one_time",
                        )
                      }
                      className="h-[40px]"
                    >
                      <option value="one_time">Una vez</option>
                      <option value="several_months">Varios meses</option>
                      <option value="forever">Para siempre</option>
                    </CustomSelect>
                  </div>
  
                  <div>
                    {editDurationType === "several_months" ? (
                      <>
                        <BasicInput
                          name="editMonths"
                          type="number"
                          min={2}
                          label="No. de meses"
                          defaultValue={currentMeta.months}
                          placeholder="2"
                          required
                        />
                      </>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
  
                <div className="pt-1">
                  <div>
                    <ServiceToggleRow
                      label="Aplicable para todos los servicios"
                      checked={applyAllServices}
                      onChange={(checked) => setApplyAllServices(checked)}
                    />

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
                  </div>
                </div>
              </div>
            </div>
  
            <div className="sticky bottom-0 z-20">
            <div
              className={twMerge(
                "pointer-events-none h-4 transition-opacity duration-200",
                !hasReachedBottom
                  ? "bg-gradient-to-t from-white/90 to-transparent opacity-100"
                  : "opacity-0",
              )}
            />
  
              <div
                className={twMerge(
                  "px-[32px] pb-[32px] pt-[20px] transition-all duration-200",
                  !hasReachedBottom ? " backdrop-blur-sm" : "bg-white",
                )}
              >
                <div className="flex justify-end">
                  <div className="flex items-center gap-[24px]">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="flex h-[32px] w-[140px] items-center justify-center whitespace-nowrap text-[16px] font-satoMedium text-brand_red"
                    >
                      Eliminar cupón
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
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Transacciones recientes</h2>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brand_gray">
            <tr>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-right">Puntos</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2 text-left">Razón</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="px-4 py-2">{tx.customer.displayName}</td>
                <td className="px-4 py-2">{tx.type}</td>
                <td
                  className={`px-4 py-2 text-right ${
                    tx.points >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.points >= 0 ? "+" : ""}
                  {tx.points}
                </td>
                <td className="px-4 py-2 text-right">{tx.balance}</td>
                <td className="px-4 py-2 text-gray-500">{tx.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function DotsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="3" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="13" cy="8" r="1.3" fill="currentColor" />
    </svg>
  )
}

function PauseSmallIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M10 9v6m4-6v6" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function TrashSmallIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
      <path d="M10 11v6m4-6v6" />
      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
      <path d="M4 7h16" />
    </svg>
  )
}