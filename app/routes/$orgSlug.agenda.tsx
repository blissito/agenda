import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices, getUserAndOrgOrRedirect } from "~/db/userGetters";
import { CompanyInfo } from "./dash.website";
import { db } from "~/utils/db.server";
import TemplateOne from "~/components/templates/TemplateOne";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const org = await db.org.findUnique({ where: { slug: params.orgSlug } });
  const services = await getServices(request);
  if (!org) return json(null, { status: 404 });
  return { org, services };
};

export default function Page() {
  const { org, services = [] } = useLoaderData<typeof loader>();
  return (
    <>
      <main>
        <TemplateOne isPublic services={services} org={org} />
      </main>
    </>
  );
}
