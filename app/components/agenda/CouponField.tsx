import { useEffect, useRef, useState } from "react"
import { FiAlertCircle, FiCheck } from "react-icons/fi"
import { useFetcher } from "react-router"
import { Spinner } from "~/components/common/Spinner"

export type ValidCoupon = {
  rewardId: string
  code: string
  type: "discount_percent" | "discount_fixed"
  discountAmount: number
  label: string
}

type FetcherData =
  | { ok: true; coupon: ValidCoupon }
  | { ok: false; error: string }

const formatAmount = (n: number) => {
  const rounded = Math.round(n * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

export function CouponField({
  serviceId,
  actionPath,
  basePrice,
  onChange,
}: {
  serviceId: string
  actionPath: string
  basePrice: number
  onChange: (code: string, applied: ValidCoupon | null) => void
}) {
  const [code, setCode] = useState("")
  const [applied, setApplied] = useState<ValidCoupon | null>(null)
  const lastTriedRef = useRef("")
  const fetcher = useFetcher<FetcherData>()
  const isLoading = fetcher.state !== "idle"

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok && fetcher.data.coupon) {
      setApplied(fetcher.data.coupon)
      onChange(code, fetcher.data.coupon)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data])

  const handleApply = () => {
    const trimmed = code.trim()
    if (!trimmed) return
    lastTriedRef.current = trimmed
    fetcher.submit(
      { intent: "validate_coupon", code: trimmed, serviceId },
      { method: "post", action: actionPath },
    )
  }

  const handleRemove = () => {
    setApplied(null)
    setCode("")
    lastTriedRef.current = ""
    onChange("", null)
  }

  const handleCodeChange = (next: string) => {
    setCode(next)
    if (applied) {
      setApplied(null)
      onChange(next, null)
    } else {
      onChange(next, null)
    }
  }

  const showError =
    !isLoading &&
    !applied &&
    fetcher.data &&
    fetcher.data.ok === false &&
    code.trim() === lastTriedRef.current

  return (
    <div>
      <label
        htmlFor="couponCode"
        className="mb-2 block font-satoMedium text-[14px] text-brand_dark"
      >
        Código de cupón (opcional)
      </label>
      <div className="flex gap-2">
        <input
          id="couponCode"
          type="text"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (!applied) handleApply()
            }
          }}
          disabled={!!applied}
          placeholder="Ej. BUENFIN2026"
          autoComplete="off"
          className="h-[44px] w-full rounded-[16px] border border-brand_ash bg-white px-4 text-[14px] text-brand_gray outline-none placeholder:text-brand_silver focus:border-[#615FFF] disabled:bg-slate-50"
        />
        {applied ? (
          <button
            type="button"
            onClick={handleRemove}
            className="h-[44px] shrink-0 rounded-full border border-brand_ash bg-white px-4 text-[14px] font-satoMedium text-brand_dark transition hover:bg-slate-50"
          >
            Quitar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            disabled={code.trim() === "" || isLoading}
            className="h-[44px] shrink-0 rounded-full bg-brand_dark px-5 text-[14px] font-satoMedium text-white transition disabled:opacity-50"
          >
            Aplicar
          </button>
        )}
      </div>

      {isLoading && (
        <p className="mt-2 flex items-center gap-2 text-xs text-brand_gray">
          <Spinner className="h-3 w-3" /> Validando…
        </p>
      )}

      {!isLoading && applied && (
        <div className="mt-2">
          <p className="flex items-center gap-2 text-xs font-satoMedium text-green-700">
            <FiCheck className="h-3.5 w-3.5" />
            Cupón aplicado: -${formatAmount(applied.discountAmount)} mxn (total $
            {formatAmount(Math.max(0, basePrice - applied.discountAmount))} mxn)
          </p>
          <p className="mt-1 text-[11px] text-brand_gray">
            Si tu cuenta tiene mejor descuento, se usará ese al confirmar.
          </p>
        </div>
      )}

      {showError && (
        <p className="mt-2 flex items-center gap-2 text-xs text-red-600">
          <FiAlertCircle className="h-3.5 w-3.5" />
          {(fetcher.data as { error: string }).error}
        </p>
      )}
    </div>
  )
}
