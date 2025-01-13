import { Outlet, useLoaderData } from "react-router";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { PrimaryButton } from "~/components/common/primaryButton";
import {
  AddService,
  ServiceCard,
} from "~/components/dash/servicios/ServiceCard";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices, getUserAndOrgOrRedirect } from "~/.server/userGetters";
import type { Route } from "./+types";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const services = await getServices(request);
  const { org } = await getUserAndOrgOrRedirect(request); // @TODO: not all  the org please!
  return { services, org };
};

export default function Services({ loaderData }: Route.ComponentProps) {
  const { services, org } = loaderData;
  const origin = useRef<string>("");

  useEffect(() => {
    origin.current = window.location.origin;
  }, []);

  const getLink = useCallback(
    (serviceSlug: string) =>
      `${origin.current}/agenda/${org.slug}/${serviceSlug}`,
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
              isActive={service.isActive}
              id={service.id}
              image={service.photoURL ?? undefined}
              key={service.id}
              title={service.name}
              duration={service.duration} // @TODO: format function this is minutes for now
              price={`${service.price} mxn`}
              status={service.isActive ? "Activo" : "Desactivado"}
              link={getLink(service.slug)} // for copy link action
              path={`/dash/servicios/${service.id}`}
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
          as="Link"
          to="/dash/servicios/nuevo"
          className="mx-auto mt-12"
        >
          + Agregar servicio
        </PrimaryButton>
      </div>
    </div>
  );
};
