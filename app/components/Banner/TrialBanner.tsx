import { trialBannerCopy } from "./TrialBanner.variants";
import type { TrialBannerProps } from "./TrialBanner.types";

export function TrialBanner({
  status,
  onPrimaryAction,
  onDismiss,
  imageSrc,
}: TrialBannerProps) {
  const copy = trialBannerCopy[status];

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="
        fixed inset-0 z-40 flex items-center justify-center
        bg-black/20 px-4
      "
    >
      <div
        className="
          w-full max-w-md rounded-2xl bg-white shadow-xl
          overflow-hidden
        "
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt=""
            className="h-40 w-full object-cover"
          />
        )}

        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {copy.title}
          </h2>

          <p className="text-sm text-neutral-600">
            {copy.description}
          </p>

          <div className="flex gap-3 pt-4">
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="
                  flex-1 rounded-full border border-neutral-300
                  px-4 py-2 text-sm text-neutral-700
                  hover:bg-neutral-100
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                "
              >
                En otro momento
              </button>
            )}

            <button
              onClick={onPrimaryAction}
              className="
                flex-1 rounded-full bg-indigo-600
                px-4 py-2 text-sm font-medium text-white
                hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              {copy.primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    