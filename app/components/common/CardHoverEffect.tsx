import { type ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "../../utils/cn"

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    plan: string
    price: string
    link?: string
    recommended?: boolean
    children: ReactNode
  }[]
  className?: string
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 items-start",
        className
      )}
    >
      {items.map((item) => (
        <Link
          to={item?.link || ""}
          key={item?.link}
          className="relative group block p-4 h-full w-full"
        >
          <section
            className={cn(
              "group cursor-pointer bg-white rounded-2xl max-w-[400px] z-10 xl:max-w-[480px] h-full md:px-8 px-4 py-6 md:py-10 text-left flex flex-col relative transition-shadow duration-300",
              item.recommended
                ? "border-2 border-brand_blue shadow-lg shadow-brand_blue/10 hover:shadow-xl hover:shadow-brand_blue/20"
                : "border border-brand_ash shadow-sm hover:shadow-md"
            )}
          >
            {item.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand_blue text-white text-xs font-satoshi_bold uppercase tracking-wider px-4 py-1 rounded-full">
                Recomendado
              </span>
            )}
            <img
              alt="rocket"
              className="absolute w-[200px] -right-10 top-0 md:-right-12 md:top-0 opacity-0 group-hover:opacity-100 transition-all"
              src="/images/Rocket.gif"
            />
            <span className="text-xl uppercase font-satoshi_bold text-brand_blue">
              {item?.plan}
            </span>
            <p className="text-5xl md:text-6xl font-satoshi_bold font-bold mt-4">
              {item?.price}{" "}
              <span className="text-2xl text-brand_gray">/mes</span>
            </p>
            <div className="mt-8 w-full h-full grow flex flex-col justify-between gap-12">
              {item.children}
            </div>
          </section>
        </Link>
      ))}
    </div>
  )
}
