import { twMerge } from "tailwind-merge"

const tiers = [
  {
    name: "Básico",
    discount: "5% OFF",
    bg: "from-brand_lime to-brand_lime/70",
    stars: 1,
    defaultStyle: "rotate-[-8deg] translate-x-[-20px] translate-y-[10px]",
    hoverStyle: "rotate-[-12deg] translate-x-[-70px] translate-y-[0px]",
    z: "z-0",
  },
  {
    name: "Premium",
    discount: "10% OFF",
    bg: "from-brand_yellow to-brand_yellow/70",
    stars: 2,
    defaultStyle: "rotate-[-2deg] translate-x-[0px] translate-y-[0px]",
    hoverStyle: "rotate-[0deg] translate-x-[0px] translate-y-[-10px]",
    z: "z-10",
  },
  {
    name: "VIP",
    discount: "20% OFF",
    bg: "from-brand_cloud to-brand_cloud/70",
    stars: 3,
    defaultStyle: "rotate-[6deg] translate-x-[20px] translate-y-[-10px]",
    hoverStyle: "rotate-[12deg] translate-x-[70px] translate-y-[0px]",
    z: "z-20",
  },
]

export const LoyaltyCardsIllustration = ({
  className,
}: {
  className?: string
}) => (
  <div
    className={twMerge(
      "relative flex items-center justify-center h-[220px] mt-2",
      className
    )}
  >
    <style>{`
      .loyalty-card {
        transition: transform 0.5s ease-out;
      }
      .loyalty-card-0 { transform: rotate(-14deg) translateX(-100px) translateY(5px); }
      .loyalty-card-1 { transform: rotate(0deg) translateX(0px) translateY(-12px); }
      .loyalty-card-2 { transform: rotate(14deg) translateX(100px) translateY(5px); }
      .group:hover .loyalty-card-0 { transform: rotate(-4deg) translateX(-15px) translateY(8px); }
      .group:hover .loyalty-card-1 { transform: rotate(0deg) translateX(0px) translateY(0px); }
      .group:hover .loyalty-card-2 { transform: rotate(4deg) translateX(15px) translateY(-8px); }
    `}</style>
    {tiers.map((tier, i) => (
      <div
        key={tier.name}
        className={twMerge(
          "loyalty-card absolute w-[240px] h-[150px] rounded-2xl p-5 flex flex-col justify-between shadow-sm border border-white/20",
          `loyalty-card-${i}`,
          `bg-gradient-to-br ${tier.bg}`,
          tier.z
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-satoBold text-white/80 uppercase tracking-wider">
            {tier.name}
          </span>
          <div className="flex gap-[2px]">
            {Array.from({ length: tier.stars }).map((_, s) => (
              <svg
                key={s}
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="white"
                fillOpacity="0.7"
              >
                <path d="M6 0L7.5 4H12L8.5 6.5L9.5 11L6 8L2.5 11L3.5 6.5L0 4H4.5L6 0Z" />
              </svg>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xl font-satoBold text-white leading-none">
            {tier.discount}
          </p>
          <p className="text-[9px] text-white/60 mt-1">Nivel de lealtad</p>
        </div>
      </div>
    ))}
  </div>
)
