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
            "rounded-2xl max-w-[480px] w-full mx-auto h-full text-left flex flex-col transition-shadow duration-300 hover:shadow-xl",
            item.popular
              ? "bg-brand_dark border-2 border-brand_dark shadow-[0_0_24px_rgba(0,0,0,0.25)] hover:shadow-[0_0_36px_rgba(0,0,0,0.35)]"
              : "bg-white border border-gray-200 shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
          )}
        >
          {/* Header */}
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <h3
                className={cn(
                  "text-2xl font-satoBold",
                  item.popular ? "text-white" : "text-brand_dark",
                )}
              >
                {item.plan}
              </h3>
              {item.popular && (
                <span className="bg-brand_yellow/20 text-brand_mostaza text-[10px] font-satoshi_bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
            </div>
            <p
              className={cn(
                "font-satoshi text-sm mt-2 leading-relaxed",
                item.popular ? "text-white/60" : "text-brand_gray",
              )}
            >
              {item.description}
            </p>

            {/* Price */}
            <p
              className={cn(
                "text-4xl md:text-5xl font-satoBold mt-6",
                item.popular ? "text-white" : "text-brand_dark",
              )}
            >
              {item.price}
              <span
                className={cn(
                  "text-lg font-satoshi font-normal",
                  item.popular ? "text-white/60" : "text-brand_gray",
                )}
              >
                /mes
              </span>
            </p>
            {item.priceNote && (
              <p
                className={cn(
                  "text-sm font-satoshi mt-2 leading-relaxed",
                  item.popular ? "text-white/60" : "text-brand_gray",
                )}
              >
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
                  className={cn(
                    "flex items-start gap-3 text-base font-satoshi",
                    item.popular ? "text-white/80" : "text-brand_gray",
                  )}
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
