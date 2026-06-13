import type { Service } from "@prisma/client"
import { AnimatePresence } from "motion/react"
import { useCallback } from "react"
import { Outlet } from "react-router"
import {
  assertServiceInOrg,
  getServices,
  getUserAndOrgOrRedirect,
  requireRole,
} from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import {
  AddService,
  ServiceCard,
} from "~/components/dash/servicios/ServiceCard"
import { BranchServiceToggle } from "~/components/dash/servicios/BranchServiceToggle"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import {
  assertBranchInOrg,
  getActiveBranchFromRequest,
} from "~/lib/branches.server"
import { db } from "~/utils/db.server"
import { getServicePublicUrl } from "~/utils/urls"
import type { Route } from "./+types"

export const action = async ({ request }: Route.ActionArgs) => {
  const { org } = await requireRole(request, ["OWNER", "ADMIN"])
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "update_service") {
    const data = JSON.parse(formData.get("data") as string)
    // @todo validate
    await assertServiceInOrg(data.id as string, org.id)
    await db.service.update({
      where: {
        id: data.id as string,
      },
      data: {
        ...data,
        id: undefined,
        orgId: undefined, // no permitir reasignar de org via mass-assignment
      },
    })
  }

  // Activa/desactiva un servicio en la sucursal activa (crea/elimina ServiceBranch).
  if (intent === "toggle_service_branch") {
    const serviceId = formData.get("serviceId") as string
    const branchId = formData.get("branchId") as string
    const offered = formData.get("offered") === "true"
    await assertServiceInOrg(serviceId, org.id)
    await assertBranchInOrg(branchId, org.id)
    if (offered) {
      const existing = await db.serviceBranch.findFirst({
        where: { serviceId, branchId },
        select: { id: true },
      })
      if (!existing) {
        await db.serviceBranch.create({ data: { serviceId, branchId } })
      }
    } else {
      await db.serviceBranch.deleteMany({ where: { serviceId, branchId } })
    }
    return { ok: true }
  }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const services = await getServices(request)
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }
  // Sede activa: si es una sucursal no-principal, exponemos qué servicios ofrece
  // para mostrar el toggle por-sede en cada card.
  const activeBranch = await getActiveBranchFromRequest(request, org.id)
  const isBranchScoped = Boolean(activeBranch && !activeBranch.isDefault)
  const offeredServiceIds =
    isBranchScoped && activeBranch
      ? (
          await db.serviceBranch.findMany({
            where: { branchId: activeBranch.id },
            select: { serviceId: true },
          })
        ).map((sb) => sb.serviceId)
      : []
  return {
    services,
    org,
    activeBranch: isBranchScoped ? activeBranch : null,
    offeredServiceIds,
  }
}

export default function Services({ loaderData }: Route.ComponentProps) {
  const { services, org, activeBranch, offeredServiceIds } = loaderData
  const offeredSet = new Set(offeredServiceIds)

  const getLink = useCallback(
    (service: Service) => getServicePublicUrl(org.slug, service.slug),
    [org.slug],
  )

  return (
    <main className="max-w-8xl mx-auto">
      <RouteTitle className="text-2xl md:text-3xl mb-4 md:mb-8">
        Servicios{" "}
      </RouteTitle>

      {activeBranch && (
        <div className="mb-6 rounded-2xl bg-brand_blue/5 border border-brand_blue/20 px-4 py-3 text-sm text-brand_dark">
          Estás viendo la sucursal <strong>{activeBranch.name}</strong>. Activa o
          desactiva qué servicios de tu catálogo se ofrecen en esta sede.
        </div>
      )}

      {!services.length ? (
        <EmptyStateServices />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            <AddService />
            {services.map((service, index) => (
              <div key={service.id} className="relative">
                {activeBranch && (
                  <BranchServiceToggle
                    serviceId={service.id}
                    branchId={activeBranch.id}
                    offered={offeredSet.has(service.id)}
                  />
                )}
                <ServiceCard
                  service={service}
                  isActive={service.isActive}
                  id={service.id}
                  image={service.gallery?.[0]}
                  index={index}
                  title={service.name}
                  duration={Number(service.duration)} // @TODO: format function this is minutes for now
                  price={`${service.price} mxn`}
                  status={service.isActive ? "Activo" : "Desactivado"}
                  link={getLink(service)} // for copy link action
                  path={
                    service.isActive
                      ? `/dash/servicios/${service.id}`
                      : `/dash/servicios/nuevo?id=${service.id}`
                  }
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <Outlet />
    </main>
  )
}

const EmptyStateServices = () => {
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img
          className="mx-auto mb-4 w-40 md:w-60"
          src="/images/emptyState/access-empty.webp"
          alt="illustration"
        />
        <p className="font-satoBold text-xl md:text-2xl">¡Nada por aquí!</p>
        <p className="mt-2 text-base md:text-lg font-satoshi text-brand_gray">
          Crea tu primer servicio y empieza a recibir a tus clientes
        </p>

        <PrimaryButton
          as="Link"
          to="/dash/servicios/nuevo"
          className="mx-auto mt-12 w-fit"
        >
          + Agregar servicio
        </PrimaryButton>
      </div>
    </div>
  )
}
