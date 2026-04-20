import { type ReactNode } from "react"
import { cn } from "../../utils/cn"

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    plan: string
    description: string
    price: string
    priceNote?: string
    popular?: boolean
    cta: ReactNode
    features: string[]
  }[]
  className?: string
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch",
        className,
      )}
    >
      {items.map((item) => (
        <section
          key={item.plan}
          className={cn(
            "bg-white rounded-2xl max-w-[480px] w-full mx-auto h-full text-left flex flex-col transition-shadow duration-300 hover:shadow-xl",
            item.popular
              ? "border-2 border-brand_blue shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
              : "border border-gray-200 shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
          )}
        >
          {/* Header */}
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-satoBold text-brand_dark">
                {item.plan}
              </h3>
              {item.popular && (
                <span className="bg-brand_cloud/40 text-teal-800 text-[10px] font-satoshi_bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
            </div>
            <p className="text-brand_gray font-satoshi text-sm mt-2 leading-relaxed">
              {item.description}
            </p>

            {/* Price */}
            <p className="text-4xl md:text-5xl font-satoBold text-brand_dark mt-6">
              {item.price}
              <span className="text-lg font-satoshi text-brand_gray font-normal">
                /mes
              </span>
            </p>
            {item.priceNote && (
              <p className="text-sm text-brand_gray font-satoshi mt-2 leading-relaxed">
                {item.priceNote}
              </p>
            )}

            {/* CTA */}
            <div className="mt-6">{item.cta}</div>
          </div>

          {/* Features */}
          <div className="px-6 md:px-8 pb-8 flex-1">
            <ul className="flex flex-col gap-3">
              {item.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-base text-brand_gray font-satoshi"
                >
                  <img
                    className="w-5 h-5 shrink-0 mt-0.5"
                    src="/images/star.svg"
                    alt=""
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}
