import type { ReactNode } from "react";

export type TrialStatus = "ending_soon" | "expired" | "grace_period";

export type TrialBannerProps = {
  status: TrialStatus;
  onPrimaryAction: () => void;
  onDismiss?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  imageSrc?: string;
};
