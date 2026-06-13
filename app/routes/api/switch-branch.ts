import { redirect, type ActionFunctionArgs } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { assertBranchInOrg } from "~/lib/branches.server"
import { commitSession, getSession } from "~/sessions"

// Cambia la sucursal activa del dashboard (guardada en sesión). Solo permite
// sedes que pertenezcan a la org activa del usuario, nunca arbitrarias.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) return redirect("/dash")

  const formData = await request.formData()
  const branchId = formData.get("branchId") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/dash"

  const session = await getSession(request.headers.get("Cookie"))

  // "" o "all" → filtro en "Todas las sucursales" (agregado): limpia la sede.
  if (!branchId || branchId === "all") {
    session.unset("activeBranchId")
  } else {
    // Cierra IDOR: la sede debe pertenecer a la org activa.
    await assertBranchInOrg(branchId, org.id)
    session.set("activeBranchId", branchId)
  }

  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  })
}

export const loader = () => redirect("/dash")
