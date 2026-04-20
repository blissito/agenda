import { twMerge } from "tailwind-merge"

const ServerIcon = () => (
  <svg
    width="166"
    height="108"
    viewBox="0 0 166 108"
    fill="none"
    className="shrink-0"
  >
    <line
      y1="27.5"
      x2="81.0364"
      y2="27.5"
      stroke="#D6D6D6"
      strokeDasharray="2 2"
    />
    <line
      y1="44.5"
      x2="81.0364"
      y2="44.5"
      stroke="#D6D6D6"
      strokeDasharray="2 2"
    />
    <line
      y1="61.5"
      x2="81.0364"
      y2="61.5"
      stroke="#D6D6D6"
      strokeDasharray="2 2"
    />
    <line
      y1="78.5"
      x2="81.0364"
      y2="78.5"
      stroke="#D6D6D6"
      strokeDasharray="2 2"
    />
    <rect x="76" width="90" height="108" rx="16" fill="#F2F2F2" />
    <rect x="87" y="13" width="67" height="19" rx="2" fill="#DEDADA" />
    <rect x="105" y="18" width="2" height="9" rx="1" fill="#383838" />
    <rect x="110" y="18" width="2" height="9" rx="1" fill="#383838" />
    <rect x="115" y="18" width="2" height="9" rx="1" fill="#383838" />
    <rect x="120" y="18" width="2" height="9" rx="1" fill="#383838" />
    <rect x="125" y="18" width="2" height="9" rx="1" fill="#383838" />
    <rect x="130" y="18" width="2" height="9" rx="1" fill="#383838" />
    <rect x="135" y="18" width="2" height="9" rx="1" fill="#383838" />
    <rect
      x="87.5"
      y="48.5"
      width="66"
      height="22"
      rx="3.5"
      fill="#DEDADA"
      stroke="#F1F1F1"
    />
    <rect
      x="87.5"
      y="75.5"
      width="66"
      height="22"
      rx="3.5"
      fill="#DEDADA"
      stroke="#F1F1F1"
    />
    <rect x="93" y="81" width="17" height="3" fill="#F1F1F1" />
    <rect x="93" y="54" width="17" height="3" fill="#F1F1F1" />
  </svg>
)

export const ClientFolderIllustration = ({
  className,
}: {
  className?: string
}) => (
  <div className={twMerge("relative h-[200px]", className)}>
    <style>{`
      .client-file {
        transition: transform 0.5s ease-out, opacity 0.5s ease-out;
      }
      .client-file-0 { transform: translateY(-30px) translateX(-30px) rotate(-8deg) scale(1); opacity: 1; }
      .client-file-1 { transform: translateY(-38px) translateX(15px) rotate(0deg) scale(1); opacity: 1; }
      .client-file-2 { transform: translateY(-30px) translateX(60px) rotate(8deg) scale(1); opacity: 1; }
      .group:hover .client-file-0 {
        transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.9);
        opacity: 0;
      }
      .group:hover .client-file-1 {
        transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.9);
        opacity: 0;
      }
      .group:hover .client-file-2 {
        transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.9);
        opacity: 0;
      }
    `}</style>

    {/* Bottom row: folder + server */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-0">
      {/* Folder wrapper - files are positioned relative to this */}
      <div className="relative w-[130px]">
        {/* File cards that emerge from folder */}
        <div
          className="client-file client-file-0 absolute bottom-full left-0 w-[80px] h-[60px] rounded-lg bg-white shadow-lg overflow-hidden z-[3]"
          style={{ transitionDelay: "0ms" }}
        >
          <img
            src="/images/illustrations/person1.png"
            alt="Cliente 1"
            className="h-[35px] w-full object-cover"
          />
          <div className="p-1.5">
            <div className="h-[4px] w-10 bg-black/10 rounded" />
            <div className="h-[3px] w-6 bg-black/5 rounded mt-1" />
          </div>
        </div>

        <div
          className="client-file client-file-1 absolute bottom-full left-0 w-[80px] h-[60px] rounded-lg bg-white shadow-lg overflow-hidden z-[4]"
          style={{ transitionDelay: "80ms" }}
        >
          <img
            src="/images/illustrations/person2.png"
            alt="Cliente 2"
            className="h-[35px] w-full object-cover"
          />
          <div className="p-1.5">
            <div className="h-[4px] w-10 bg-black/10 rounded" />
            <div className="h-[3px] w-6 bg-black/5 rounded mt-1" />
          </div>
        </div>

        <div
          className="client-file client-file-2 absolute bottom-full left-0 w-[80px] h-[60px] rounded-lg bg-white shadow-lg overflow-hidden z-[3]"
          style={{ transitionDelay: "160ms" }}
        >
          <img
            src="/images/illustrations/person3.png"
            alt="Cliente 3"
            className="h-[35px] w-full object-cover"
          />
          <div className="p-1.5">
            <div className="h-[4px] w-10 bg-black/10 rounded" />
            <div className="h-[3px] w-6 bg-black/5 rounded mt-1" />
          </div>
        </div>

        {/* Folder */}
        <div className="relative z-10">
          <div className="w-[45%] h-[10px] bg-brand_mostaza rounded-t-md ml-1" />
          <div className="w-full h-[65px] bg-brand_yellow rounded-lg shadow-md flex items-end p-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 16 16"
                  fill="white"
                  fillOpacity="0.9"
                >
                  <circle cx="8" cy="5" r="3" />
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                </svg>
              </div>
              <p className="text-[7px] font-satoBold text-white">Expedientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Server */}
      <div className="-ml-2">
        <ServerIcon />
      </div>
    </div>
  </div>
)
