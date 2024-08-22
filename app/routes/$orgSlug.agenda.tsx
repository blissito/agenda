import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getServices } from "~/db/userGetters";
import { db } from "~/utils/db.server";
import TemplateOne from "~/components/templates/TemplateOne";
import TemplateTwo from "~/components/templates/TemplateTwo";

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
        <main>
          {org.websiteConfig === "templateOne" ? (
            <TemplateOne isPublic services={services} org={org} />
          ) : (
            <TemplateTwo isPublic services={services} org={org} />
          )}
        </main>
      </main>
    </>
  );
}
