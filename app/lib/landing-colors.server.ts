import type { CustomColors } from "@easybits.cloud/html-tailwind-generator"
import type { Org } from "@prisma/client"

type OrgColorSource = Pick<Org, "landingCustomColors" | "brandkit">

function brandkitToCustomColors(
  brandkit: Org["brandkit"],
): CustomColors | undefined {
  if (!brandkit?.primaryColor) return undefined
  return {
    primary: brandkit.primaryColor,
    ...(brandkit.secondaryColor ? { secondary: brandkit.secondaryColor } : {}),
    ...(brandkit.accentColor ? { accent: brandkit.accentColor } : {}),
    ...(brandkit.surfaceColor ? { surface: brandkit.surfaceColor } : {}),
  }
}

/**
 * Resolves CustomColors for landing render. Explicit override
 * (landingCustomColors) wins; otherwise project the org's brandkit.
 * Returns undefined when neither applies — SDK falls back to theme default.
 */
export function resolveLandingColors(
  org: OrgColorSource,
): CustomColors | undefined {
  const explicit = org.landingCustomColors as CustomColors | null | undefined
  if (explicit && Object.keys(explicit).length > 0) return explicit
  return brandkitToCustomColors(org.brandkit)
}
