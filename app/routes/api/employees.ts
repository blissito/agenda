import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/services"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }
  return {
    employees: await db.user.findMany({
      where: {
        orgId: org.id,
      },
    }),
  }
}
