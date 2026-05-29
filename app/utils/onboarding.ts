import type { Org } from "@prisma/client"

/**
 * "Información del negocio completa" para el paso 1 del onboarding.
 * Criterio: la descripción del negocio está llena (el resto de campos son
 * opcionales y muchos negocios online no tienen dirección/teléfono).
 * Se usa tanto en el loader de `/dash/onboarding` (checkmark + progreso) como
 * en `dash_layout` (ocultar el banner de la sidebar), para que ambos coincidan.
 */
export const isBusinessInfoComplete = (
  org: Pick<Org, "description"> | null | undefined,
): boolean => Boolean(org?.description?.trim())
