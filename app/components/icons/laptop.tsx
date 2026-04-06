import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

const CalendarScreen = () => (
  <div className="p-3 h-full flex flex-col">
    <div className="flex items-center justify-between mb-2">
      <div className="flex gap-1">
        <div className="w-[6px] h-[6px] rounded-full bg-[#ff5f57]" />
        <div className="w-[6px] h-[6px] rounded-full bg-[#febc2e]" />
        <div className="w-[6px] h-[6px] rounded-full bg-[#28c840]" />
      </div>
      <div className="h-[6px] w-16 bg-gray-200 rounded-full" />
      <div className="w-4" />
    </div>
    <div className="flex flex-1 gap-2 overflow-hidden">
      <div className="w-[48px] flex flex-col gap-1.5 shrink-0">
        <div className="h-[6px] w-full bg-brand_blue/20 rounded" />
        <div className="h-[6px] w-9 bg-gray-100 rounded" />
        <div className="h-[6px] w-7 bg-gray-100 rounded" />
        <div className="h-[6px] w-9 bg-gray-100 rounded" />
      </div>
      <div className="flex-1 flex flex-col gap-[3px]">
        <div className="grid grid-cols-7 gap-[2px]">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div
              key={i}
              className="text-[5px] text-gray-400 text-center font-satoshi leading-none"
            >
              {d}
            </div>
          ))}
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="grid grid-cols-7 gap-[2px]">
            {Array.from({ length: 7 }).map((_, col) => {
              const day = row * 7 + col + 1
              const isToday = day === 15
              const hasEvent =
                day === 8 || day === 12 || day === 15 || day === 22
              return (
                <div
                  key={col}
                  className={twMerge(
                    "aspect-square rounded-[2px] flex items-center justify-center text-[5px] leading-none",
                    isToday
                      ? "bg-brand_blue text-white"
                      : hasEvent
                        ? "bg-brand_blue/10 text-brand_blue"
                        : day <= 28
                          ? "bg-gray-50/80 text-gray-300"
                          : "bg-transparent"
                  )}
                >
                  {day <= 28 ? day : ""}
                </div>
              )
            })}
          </div>
        ))}
        <div className="flex flex-col gap-[3px] mt-[2px]">
          <div className="h-[10px] rounded bg-brand_blue/10 flex items-center px-1">
            <div className="w-[3px] h-[6px] rounded-sm bg-brand_blue mr-1" />
            <div className="h-[3px] w-10 bg-brand_blue/20 rounded" />
          </div>
          <div className="h-[10px] rounded bg-emerald-50 flex items-center px-1">
            <div className="w-[3px] h-[6px] rounded-sm bg-emerald-400 mr-1" />
            <div className="h-[3px] w-8 bg-emerald-300/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const LaptopShell = ({
  children,
  className,
  width = "w-[260px] md:w-[340px]",
}: {
  children: ReactNode
  className?: string
  width?: string
}) => (
  <div className={twMerge("relative", className)}>
    <div className={twMerge("relative mx-auto", width)}>
      <style>{`
        .laptop-lid {
          transform: perspective(800px) rotateX(8deg);
          transition: transform 0.7s ease-out;
        }
        .group:hover .laptop-lid {
          transform: perspective(800px) rotateX(0deg);
        }
      `}</style>
      <div className="laptop-lid relative origin-bottom">
        <div className="rounded-t-xl border-[3px] border-[#1a1a2e] bg-[#1a1a2e] p-[5px] relative">
          <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#2a2a3e] z-10" />
          <div className="absolute inset-[5px] rounded-lg bg-brand_blue/0 group-hover:bg-brand_blue/5 transition-colors duration-700 z-0" />
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#f8f9ff] to-white aspect-[16/10]">
            {children}
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-b from-black/5 to-transparent" />
      </div>
      <div className="relative">
        <div className="mx-auto h-[5px] w-[102%] -ml-[1%] bg-gradient-to-b from-[#d4d4d4] to-[#b8b8b8] rounded-[1px]" />
        <div className="mx-auto w-[106%] -ml-[3%] h-[8px] bg-gradient-to-b from-[#e8e8e8] to-[#d8d8d8] rounded-b-lg">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#ccc] rounded-t-sm" />
        </div>
      </div>
    </div>
  </div>
)

export const LaptopIllustration = ({
  className,
}: {
  className?: string
}) => (
  <LaptopShell className={className}>
    <CalendarScreen />
  </LaptopShell>
)
