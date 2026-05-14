import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5"
import { twMerge } from "tailwind-merge"

export const Pagination = ({
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 15, 25, 50],
  className,
}: {
  total: number
  page: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  perPageOptions?: number[]
  className?: string
}) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const pages = getVisiblePages(page, totalPages, 7)
  const mobilePages = getVisiblePages(page, totalPages, 3)

  return (
    <div
      className={twMerge(
        "flex flex-row items-center justify-between gap-3 pt-4",
        className,
      )}
    >
      {/* Items por página */}
      <div className="flex items-center gap-2 text-sm text-brand_gray min-w-0">
        <span className="hidden sm:inline">Mostrar</span>
        <select
          value={perPage}
          onChange={(e) => {
            onPerPageChange(Number(e.target.value))
            onPageChange(1)
          }}
          className="rounded-lg border border-brand_stroke bg-white pl-3 pr-8 py-1 text-sm text-brand_gray outline-none focus:border-brand_blue"
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="truncate">
          <span className="hidden sm:inline">de </span>
          {total} {total === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-1 shrink-0">
        <PageButton onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <IoChevronBackOutline className="w-4 h-4" />
        </PageButton>

        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="w-9 h-9 flex items-center justify-center text-sm text-brand_gray"
              >
                ...
              </span>
            ) : (
              <PageButton
                key={p}
                active={p === page}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </PageButton>
            ),
          )}
        </div>
        <div className="flex sm:hidden items-center gap-1">
          {mobilePages.map((p, i) =>
            p === "..." ? (
              <span
                key={`m-dots-${i}`}
                className="w-9 h-9 flex items-center justify-center text-sm text-brand_gray"
              >
                ...
              </span>
            ) : (
              <PageButton
                key={`m-${p}`}
                active={p === page}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </PageButton>
            ),
          )}
        </div>

        <PageButton
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <IoChevronForward className="w-4 h-4" />
        </PageButton>
      </div>
    </div>
  )
}

const PageButton = ({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={twMerge(
      "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-satoMedium transition-colors",
      active
        ? "bg-brand_blue text-white"
        : "text-brand_gray hover:bg-slate-100",
      disabled && "opacity-40 pointer-events-none",
    )}
  >
    {children}
  </button>
)

function getVisiblePages(
  current: number,
  total: number,
  maxVisible: number,
): (number | "...")[] {
  if (total <= maxVisible)
    return Array.from({ length: total }, (_, i) => i + 1)

  // Compact mode (mobile): siempre primera, "...", última
  if (maxVisible <= 3) {
    return [1, "...", total]
  }

  const pages: (number | "...")[] = [1]

  if (current > 3) pages.push("...")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("...")

  pages.push(total)
  return pages
}
