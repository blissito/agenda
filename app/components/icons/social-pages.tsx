import { twMerge } from "tailwind-merge"

const FacebookPage = () => (
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden flex-1">
    {/* Cover */}
    <div className="h-12 bg-gradient-to-r from-blue-100 to-blue-50" />
    {/* Profile row */}
    <div className="px-3 -mt-4 flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-[#1877F2] border-2 border-white flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </div>
      <div className="pb-1">
        <p className="text-[8px] font-satoBold text-brand_dark leading-none">
          Studio Bella
        </p>
        <p className="text-[7px] text-gray-400">12.4k seguidores</p>
      </div>
    </div>
    {/* Action buttons */}
    <div className="px-3 py-2 flex gap-1.5">
      <div className="h-4 flex-1 rounded bg-gray-100 flex items-center justify-center">
        <span className="text-[6px] text-gray-400">Me gusta</span>
      </div>
      <div className="h-4 flex-1 rounded bg-brand_blue flex items-center justify-center group-hover:scale-110 transition-transform duration-300 origin-center">
        <span className="text-[6px] text-white font-satoBold">Reservar</span>
      </div>
    </div>
    {/* Post */}
    <div className="px-3 pb-2">
      <div className="h-[3px] w-20 rounded bg-gray-100 mb-1" />
      <div className="h-[3px] w-14 rounded bg-gray-100" />
    </div>
  </div>
)

const InstagramPage = () => (
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden flex-1">
    {/* Header */}
    <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743] p-[2px]">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100" />
        </div>
      </div>
      <div>
        <p className="text-[8px] font-satoBold text-brand_dark leading-none">
          studio.bella
        </p>
        <p className="text-[7px] text-gray-400">Estudio de belleza</p>
      </div>
    </div>
    {/* Bio */}
    <div className="px-3 py-1.5">
      <div className="flex gap-3 mb-1.5">
        <div className="text-center">
          <p className="text-[8px] font-satoBold text-brand_dark">124</p>
          <p className="text-[6px] text-gray-400">posts</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-satoBold text-brand_dark">12.4k</p>
          <p className="text-[6px] text-gray-400">seguidores</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-satoBold text-brand_dark">380</p>
          <p className="text-[6px] text-gray-400">seguidos</p>
        </div>
      </div>
      {/* CTA button */}
      <div className="h-5 rounded-md bg-brand_blue flex items-center justify-center group-hover:scale-110 transition-transform duration-300 origin-center">
        <span className="text-[7px] text-white font-satoBold">
          Reservar cita
        </span>
      </div>
    </div>
    {/* Grid */}
    <div className="grid grid-cols-3 gap-[1px] px-[1px] pb-[1px]">
      {[0, 1, 2].map((n) => (
        <div
          key={n}
          className={twMerge(
            "aspect-square",
            n === 0 ? "bg-pink-50" : n === 1 ? "bg-purple-50" : "bg-rose-50",
          )}
        />
      ))}
    </div>
  </div>
)

export const SocialPagesIllustration = ({
  className,
}: {
  className?: string
}) => (
  <div className={twMerge("flex items-center justify-center", className)}>
    <div className="w-[48%] z-10 shadow-sm shrink-0">
      <FacebookPage />
    </div>
    <div className="w-[48%] -ml-3 shrink-0">
      <InstagramPage />
    </div>
  </div>
)
