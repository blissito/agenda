import { redirect, type ActionFunctionArgs } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"

// Cambia la org activa del colaborador (User.orgId). Solo permite orgs a las
// que el usuario pertenece (orgIds) o que posee (ownerId), nunca arbitrarias.
export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserOrRedirect(request)
  const formData = await request.formData()
  const orgId = formData.get("orgId") as string
  if (!orgId || orgId === user.orgId) return redirect("/dash")

  const memberIds = new Set(
    [...(user.orgIds ?? []), user.orgId].filter(Boolean) as string[],
  )
  let allowed = memberIds.has(orgId)
  if (!allowed) {
    // Legacy/owner: el usuario podría no tener la org en orgIds todavía.
    const owned = await db.org.findFirst({
      where: { id: orgId, ownerId: user.id },
      select: { id: true },
    })
    allowed = Boolean(owned)
  }
  if (!allowed) return redirect("/dash")

  await db.user.update({ where: { id: user.id }, data: { orgId } })
  return redirect("/dash")
}

export const loader = () => redirect("/dash")
