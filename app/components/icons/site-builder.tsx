import { twMerge } from "tailwind-merge"

const promptText =
  "Crea mi sitio web para mi estudio de belleza con colores rosa y dorado..."

const SiteScreen = () => (
  <div className="h-full flex flex-col bg-white overflow-hidden">
    {/* Navbar */}
    <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-300 to-amber-200" />
        <div className="h-[3px] w-8 rounded bg-gray-300" />
      </div>
      <div className="flex gap-2">
        <div className="h-[3px] w-4 rounded bg-gray-200" />
        <div className="h-[3px] w-4 rounded bg-gray-200" />
        <div className="h-[3px] w-4 rounded bg-gray-200" />
      </div>
    </div>
    {/* Hero */}
    <div className="bg-gradient-to-br from-pink-50 to-amber-50 px-3 py-3 flex flex-col items-center gap-1">
      <div className="h-[3px] w-16 rounded bg-pink-300/60" />
      <div className="h-[2px] w-10 rounded bg-gray-300/50" />
      <div className="h-3 w-10 rounded-full bg-gradient-to-r from-pink-400 to-amber-300 mt-[2px]" />
    </div>
    {/* Services section */}
    <div className="px-2 py-1.5 flex flex-col items-center gap-1">
      <div className="h-[3px] w-8 rounded bg-gray-300 mb-[2px]" />
      <div className="grid grid-cols-3 gap-1 w-full">
        {[0, 1, 2].map((n) => (
          <div
            key={n}
            className="flex flex-col items-center gap-[2px] rounded-md bg-gray-50 p-1"
          >
            <div className="w-full h-3 rounded bg-pink-100/80" />
            <div className="h-[2px] w-3/4 rounded bg-gray-200" />
            <div className="h-[2px] w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
    {/* Testimonials */}
    <div className="px-2 py-1 flex gap-1">
      {[0, 1].map((n) => (
        <div
          key={n}
          className="flex-1 rounded-md bg-gray-50 p-1 flex flex-col gap-[2px]"
        >
          <div className="flex items-center gap-[3px]">
            <div className="w-2 h-2 rounded-full bg-pink-200" />
            <div className="h-[2px] w-5 rounded bg-gray-200" />
          </div>
          <div className="h-[2px] w-full rounded bg-gray-100" />
          <div className="h-[2px] w-2/3 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
)

export const SiteBuilderIllustration = ({
  className,
}: {
  className?: string
}) => (
  <div
    className={twMerge(
      "relative flex items-start justify-center max-w-md mx-auto",
      className,
    )}
  >
    {/* Textarea - AI prompt */}
    <div className="w-[48%] rounded-xl bg-white border border-gray-100 p-3 shadow-sm z-10 shrink-0">
      {/* AI header */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand_blue to-purple-500 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L10 6L14 7L10 8L8 14L6 8L2 7L6 6L8 2Z" fill="white" />
          </svg>
        </div>
        <span className="text-[10px] font-satoBold text-brand_dark">
          Nik, tu asistente IA
        </span>
      </div>
      <p className="text-[10px] text-brand_gray font-satoshi leading-relaxed">
        {promptText}
      </p>
      {/* Fake input */}
      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5">
        <div className="h-[3px] w-12 rounded bg-gray-200" />
        <div className="ml-auto w-4 h-4 rounded-full bg-brand_blue flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2V10M6 2L3 5M6 2L9 5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    {/* Laptop */}
    <div className="w-[55%] -ml-3">
      <div className="relative mx-auto">
        <div className="rounded-t-xl border-[3px] border-[#1a1a2e] bg-[#1a1a2e] p-[4px] relative">
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a3e] z-10" />
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#f8f9ff] to-white aspect-[16/10]">
            <SiteScreen />
          </div>
        </div>
        <div className="mx-auto h-[4px] w-[102%] -ml-[1%] bg-gradient-to-b from-[#d4d4d4] to-[#b8b8b8] rounded-[1px]" />
        <div className="mx-auto w-[106%] -ml-[3%] h-[7px] bg-gradient-to-b from-[#e8e8e8] to-[#d8d8d8] rounded-b-lg">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#ccc] rounded-t-sm" />
        </div>
      </div>
    </div>
  </div>
)
