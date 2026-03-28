import type { Service } from "@prisma/client"
import { AnimatePresence } from "motion/react"
import { useCallback } from "react"
import { Link, Outlet } from "react-router"
import { getServices, getUserAndOrgOrRedirect } from "~/.server/userGetters"
import {
  AddService,
  ServiceCard,
} from "~/components/dash/servicios/ServiceCard"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { db } from "~/utils/db.server"
import { getServicePublicUrl } from "~/utils/urls"
import type { Route } from "./+types"

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "update_service") {
    const data = JSON.parse(formData.get("data") as string)
    // @todo validate
    await db.service.update({
      where: {
        id: data.id as string,
      },
      data: {
        ...data,
        id: undefined,
      },
    })
  }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const services = await getServices(request)
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }
  return { services, org }
}

export default function Services({ loaderData }: Route.ComponentProps) {
  const { services, org } = loaderData

  const getLink = useCallback(
    (service: Service) => getServicePublicUrl(org.slug, service.slug),
    [org.slug],
  )

  return (
    <main className="max-w-8xl mx-auto">
      <RouteTitle>Servicios </RouteTitle>

      {!services.length && <EmptyStateServices />}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence>
          <AddService />
          {services.map((service, index) => (
            <ServiceCard
              service={service}
              isActive={service.isActive}
              id={service.id}
              image={service.gallery?.[0]}
              key={service.id}
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
          ))}
        </AnimatePresence>
      </div>
      <Outlet />
    </main>
  )
}

const EmptyStateServices = () => {
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img
          className="mx-auto mb-4"
          src="/images/emptyState/access-empty.webp"
          alt="illustration"
        />
        <p className="font-satoBold text-xl ">¡Nada por aquí!</p>
        <p className="mt-2 text-brand_gray">
          Crea tu primer servicio y empieza a recibir a tus clientes
        </p>

        <Link
          to="/dash/servicios/nuevo"
          className="mx-auto mt-12 inline-flex items-center justify-center rounded-full bg-brand_dark text-white px-8 py-3 font-satoMedium hover:opacity-90 transition-opacity"
        >
          + Agregar servicio
        </Link>
      </div>
    </div>
  )
}
