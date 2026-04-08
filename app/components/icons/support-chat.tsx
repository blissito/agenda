import { twMerge } from "tailwind-merge"

export const SupportChatIllustration = ({
  className,
}: {
  className?: string
}) => (
  <div className={twMerge("relative flex items-start justify-center", className)}>
    <style>{`
      .support-ticket {
        transition: transform 0.5s ease-out;
      }
      .support-ticket-0 {
        transform: rotate(-6deg);
      }
      .support-ticket-1 {
        transform: rotate(3deg);
      }
      .support-ticket-2 {
        transform: rotate(-4deg);
      }
      .group:hover .support-ticket-0 {
        transform: rotate(-8deg) translateY(-4px);
      }
      .group:hover .support-ticket-1 {
        transform: rotate(5deg) translateY(-4px);
      }
      .group:hover .support-ticket-2 {
        transform: rotate(-6deg) translateY(-4px);
      }
    `}</style>

    <div className="flex flex-col -space-y-3 w-full max-w-[160px]">
      {/* Ticket 1 */}
      <div className="support-ticket support-ticket-0 w-full bg-white rounded-xl shadow-lg border border-[#EFEFEF] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-brand_blue/10 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#5158F6" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="h-[4px] w-14 bg-black/10 rounded" />
          <div className="ml-auto flex items-center gap-1">
            <div className="w-[6px] h-[6px] rounded-full bg-amber-400" />
            <span className="text-[6px] text-brand_gray font-satoshi">Prioritario</span>
          </div>
        </div>
        <div className="h-[3px] w-20 bg-black/5 rounded" />
        <div className="h-[3px] w-12 bg-black/5 rounded" />
      </div>

      {/* Ticket 2 */}
      <div className="support-ticket support-ticket-1 w-full bg-white rounded-xl shadow-lg border border-[#EFEFEF] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-brand_blue/20" />
          <div className="h-[4px] w-16 bg-black/10 rounded" />
          <div className="ml-auto flex items-center gap-1">
            <div className="w-[6px] h-[6px] rounded-full bg-brand_blue" />
            <span className="text-[6px] text-brand_gray font-satoshi">En proceso</span>
          </div>
        </div>
        <div className="h-[3px] w-24 bg-black/5 rounded" />
        <div className="h-[3px] w-14 bg-black/5 rounded" />
      </div>

      {/* Ticket 3 */}
      <div className="support-ticket support-ticket-2 w-full bg-white rounded-xl shadow-lg border border-[#EFEFEF] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-brand_yellow/30" />
          <div className="h-[4px] w-12 bg-black/10 rounded" />
          <div className="ml-auto flex items-center gap-1">
            <div className="w-[6px] h-[6px] rounded-full bg-green-400" />
            <span className="text-[6px] text-brand_gray font-satoshi">Resuelto</span>
          </div>
        </div>
        <div className="h-[3px] w-16 bg-black/5 rounded" />
        <div className="h-[3px] w-10 bg-black/5 rounded" />
      </div>
    </div>
  </div>
)
