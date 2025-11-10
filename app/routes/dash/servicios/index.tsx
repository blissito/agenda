import { Outlet, redirect, useFetcher, useLoaderData } from "react-router";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { PrimaryButton } from "~/components/common/primaryButton";
import {
  AddService,
  ServiceCard,
} from "~/components/dash/servicios/ServiceCard";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices, getUserAndOrgOrRedirect } from "~/.server/userGetters";
import type { Route } from "./+types";
import { db } from "~/utils/db.server";
import slugify from "slugify";
import { nanoid } from "nanoid";
import type { Service } from "@prisma/client";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update_service") {
    const data = JSON.parse(formData.get("data") as string);
    // @todo validate
    await db.service.update({
      where: {
        id: data.id as string,
      },
      data: {
        ...data,
        id: undefined,
      },
    });
  }

  if (intent === "create_dummy_service") {
    const { org } = await getUserAndOrgOrRedirect(request);
    const dummy = await db.service.create({
      data: {
        name: "Fancy Service",
        slug: slugify("Fance Service") + nanoid(4),
        orgId: org.id,
      },
    });
    return redirect(`/dash/servicios/${dummy.id}`);
  }
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const services = await getServices(request);
  const { org } = await getUserAndOrgOrRedirect(request);
  return { services, org };
};

export default function Services({ loaderData }: Route.ComponentProps) {
  const { services, org } = loaderData;
  const origin = useRef<string>("");

  useEffect(() => {
    origin.current = window.location.origin;
  }, []);

  const getLink = useCallback(
    (service: Service) =>
      `${origin.current}/agenda/${org.slug}/${service.slug}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [origin]
  );

  return (
    <main className=" ">
      <RouteTitle>Servicios </RouteTitle>

      {!services.length && <EmptyStateServices />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {services.map((service) => (
            <ServiceCard
              service={service}
              isActive={service.isActive}
              id={service.id}
              image={service.photoURL ?? undefined}
              key={service.id}
              title={service.name}
              duration={service.duration} // @TODO: format function this is minutes for now
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
          {!!services.length && <AddService />}
        </AnimatePresence>
      </div>
      <Outlet />
    </main>
  );
}

const EmptyStateServices = () => {
  const fetcher = useFetcher();
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img
          className="mx-auto mb-4"
          src="/images/access-empty.svg"
          alt="illustration"
        />
        <p className="font-satoMedium text-xl font-bold">
          ¡Nada por aquí! <span className="text-2xl ">👀</span>{" "}
        </p>
        <p className="mt-2 text-brand_gray">
          Crea tu primer servicio y empieza a recibir a tus clientes
        </p>

        <PrimaryButton
          className="mx-auto mt-12"
          type="button"
          onClick={() => {
            fetcher.submit(
              { intent: "create_dummy_service" },
              { method: "post" }
            );
          }}
        >
          + Agregar servicio
        </PrimaryButton>
      </div>
    </div>
  );
};
