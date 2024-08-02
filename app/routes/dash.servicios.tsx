import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  AddService,
  ServiceCard,
} from "~/components/dash/servicios/ServiceCard";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices, getUserAndOrgOrRedirect } from "~/db/userGetters";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const services = await getServices(request);
  const { org } = await getUserAndOrgOrRedirect(request); // @TODO: not all  the org please!
  return { services, org };
};

export default function Services() {
  const { services, org } = useLoaderData<typeof loader>();
  const origin = useRef<string>("");

  useEffect(() => {
    origin.current = location.origin;
  }, []);

  // const getLink = (serviceId: string) => `/dash/servicios/${serviceId}`;
  const getLink = (serviceSlug: string) => `/agenda/${org.slug}/${serviceSlug}`;

  return (
    <main className=" ">
      <RouteTitle>Servicios </RouteTitle>
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
              link={getLink(service.slug)} // just for developing
            />
          ))}
          <AddService />
        </AnimatePresence>
      </div>
      <Outlet />
    </main>
  );
}
