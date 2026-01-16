import type { TrialStatus } from "./TrialBanner.types";

export const trialBannerCopy: Record<
  TrialStatus,
  {
    title: string;
    description: string;
    primaryLabel: string;
  }
> = {
  ending_soon: {
    title: "Tu periodo de prueba está por finalizar ⏳",
    description:
      "Actualiza tu plan para no perder acceso a las funcionalidades.",
    primaryLabel: "Actualizar plan",
  },
  expired: {
    title: "Vaya, tu periodo de prueba ha terminado 🚀",
    description:
      "Mejora tu plan ahora y obtén 20% de descuento en tu primer año.",
    primaryLabel: "Suscribirme",
  },
  grace_period: {
    title: "Último acceso disponible ⚠️",
    description:
      "Activa tu plan ahora para continuar usando la plataforma sin interrupciones.",
    primaryLabel: "Activar plan",
  },
};
