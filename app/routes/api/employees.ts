import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/services"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }
  // Multi-org: un colaborador pertenece a la org si la tiene en `orgIds`,
  // sin importar cuál sea su org activa (`orgId`). El OR con `orgId` cubre
  // datos legacy (creados antes de poblar `orgIds`).
  return {
    employees: await db.user.findMany({
      where: {
        OR: [{ orgIds: { has: org.id } }, { orgId: org.id }],
      },
    }),
  }
}
