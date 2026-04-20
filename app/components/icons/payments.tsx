import { twMerge } from "tailwind-merge"

const notifications = [
  { name: "María G.", amount: "$350", service: "Corte + Color" },
  { name: "Carlos R.", amount: "$200", service: "Masaje relajante" },
]

const extraNotification = {
  name: "Ana L.",
  amount: "$450",
  service: "Facial completo",
}

const PaymentItem = ({
  name,
  amount,
  service,
  className,
}: {
  name: string
  amount: string
  service: string
  className?: string
}) => (
  <div
    className={twMerge(
      "flex items-center gap-3 rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-3",
      className,
    )}
  >
    <div className="w-8 h-8 rounded-full bg-brand_lime/30 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="#65a30d"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-satoBold text-brand_dark truncate">{name}</p>
      <p className="text-[11px] text-brand_gray truncate">{service}</p>
    </div>
    <span className="text-sm font-satoBold text-lime-600 shrink-0">
      {amount}
    </span>
  </div>
)

export const PaymentsIllustration = ({ className }: { className?: string }) => (
  <div className={twMerge("relative flex flex-col gap-3", className)}>
    <style>{`
      .payment-extra {
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
      }
      .group:hover .payment-extra {
        opacity: 1;
        transform: translateY(0);
      }
    `}</style>
    {notifications.map((n, i) => (
      <PaymentItem key={i} {...n} />
    ))}
    <PaymentItem {...extraNotification} className="payment-extra" />
  </div>
)
