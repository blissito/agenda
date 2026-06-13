import { FaArrowLeftLong } from "react-icons/fa6"
import { IoClose } from "react-icons/io5"
import { Form, Link, redirect, useNavigation } from "react-router"
import { getUserAndOrgOrRedirect, requireRole } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { BasicInput } from "~/components/forms/BasicInput"
import { createBranch, offerAllServicesAtBranch } from "~/lib/branches.server"
import { commitSession, getSession } from "~/sessions"
import type { Route } from "./+types/nueva"

// Oculta la sidebar: este form es una pantalla completa (overlay), igual que
// "agregar servicio".
export const handle = { hideSidebar: true }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })
  return { defaultTimezone: org.timezone ?? "America/Mexico_City" }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const { org } = await requireRole(request, ["OWNER", "ADMIN"])
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const name = String(formData.get("name") ?? "").trim()
  if (!name) {
    return { error: "El nombre de la sucursal es obligatorio" }
  }

  const branch = await createBranch({
    orgId: org.id,
    name,
    address: (formData.get("address") as string)?.trim() || null,
    tel: (formData.get("tel") as string)?.trim() || null,
    email: (formData.get("email") as string)?.trim() || null,
    timezone: (formData.get("timezone") as string)?.trim() || null,
  })

  // Hereda todo el catálogo por default (la sede ofrece todos los servicios;
  // luego se desactivan los que no apliquen). Los horarios quedan en null →
  // resuelven al horario del Org hasta que se editen en Ajustes → Horarios.
  await offerAllServicesAtBranch(org.id, branch.id)

  // Switchea a la nueva sede y aterriza en su configuración de horarios.
  const session = await getSession(request.headers.get("Cookie"))
  session.set("activeBranchId", branch.id)
  return redirect(`/dash/ajustes?tab=horarios&created=${branch.slug}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  })
}

export default function NuevaSucursal({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <article className="h-screen bg-white fixed inset-0 pt-14 md:pt-10 overflow-y-auto z-[600]">
      <Link
        to="/dash/ajustes?tab=sucursales"
        aria-label="Cerrar"
        className="absolute right-4 top-4 md:right-10 md:top-10 text-brand_gray rounded-full border border-ash h-8 w-8 flex items-center justify-center transition-all active:scale-95"
      >
        <IoClose className="text-2xl" />
      </Link>

      <section className="max-w-xl mx-auto h-full flex flex-col px-4 md:px-0">
        <h1 className="text-center text-xl md:text-2xl">
          Agrega una sucursal
        </h1>
        <p className="text-center text-brand_gray mt-2 mb-8">
          Una sede de tu negocio con su propia dirección y horarios. Podrás
          asignarle servicios después.
        </p>

        <Form method="post" className="flex flex-col flex-1">
          <div className="flex flex-col gap-2">
            <BasicInput
              name="name"
              label="Nombre de la sucursal"
              placeholder="Ej. Sucursal Centro"
              required
            />
            <BasicInput
              name="address"
              label="Dirección (opcional)"
              placeholder="Calle, número, colonia, ciudad"
            />
            <div className="flex flex-col md:flex-row gap-2">
              <BasicInput
                name="tel"
                label="Teléfono (opcional)"
                placeholder="55 1234 5678"
              />
              <BasicInput
                name="email"
                type="email"
                label="Email (opcional)"
                placeholder="centro@negocio.com"
              />
            </div>
            <BasicInput
              name="timezone"
              label="Zona horaria"
              defaultValue={loaderData.defaultTimezone}
              placeholder="America/Mexico_City"
            />

            {actionData?.error && (
              <p className="text-sm text-red-500 mb-2">{actionData.error}</p>
            )}
          </div>

          <footer className="items-center pb-4 pt-4 px-0 md:px-4 w-full justify-between flex mt-auto gap-2">
            <PrimaryButton
              type="button"
              as="Link"
              to="/dash/ajustes?tab=sucursales"
              className="bg-transparent text-brand_dark font-satoMiddle flex gap-2 items-center group transition-all"
            >
              <FaArrowLeftLong />
              <span className="group-hover:ml-1 transition-all">Volver</span>
            </PrimaryButton>
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Crear sucursal
            </PrimaryButton>
          </footer>
        </Form>
      </section>
    </article>
  )
}
