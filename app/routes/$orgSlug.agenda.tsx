import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices, getUserAndOrgOrRedirect } from "~/db/userGetters";
import { CompanyInfo } from "./dash.website";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  const services = await getServices(request);
  if (!org) return json(null, { status: 404 });
  return { org, services };
};

export default function Page() {
  const { org, services = [] } = useLoaderData<typeof loader>();
  return (
    <>
      <main>
        <RouteTitle>Mi sitio web </RouteTitle>
        <section className=" grid grid-cols-6 gap-6">
          <CompanyInfo isPublic services={services} org={org} />
        </section>
      </main>
    </>
  );
}
