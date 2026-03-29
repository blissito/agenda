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
      className={`relative pb-2 text-base font-satoMedium whitespace-nowrap ${
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
