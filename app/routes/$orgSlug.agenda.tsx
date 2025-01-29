import { useLoaderData } from "react-router";
import { getPublicServicesFor } from "~/.server/userGetters";
import TemplateOne from "~/components/templates/TemplateOne";
import TemplateTwo from "~/components/templates/TemplateTwo";

export const loader = async ({ params }: Route) => {
  const services = await getPublicServicesFor(params.orgSlug);
  if (services.length < 1) throw new Response(null, { status: 404 });

  return { services, org: services.org };
};

export default function Page() {
  const { org, services = [] } = useLoaderData<typeof loader>();
  return (
    <>
      <main>
        <main>
          {org.websiteConfig?.template === "templateOne" ? (
            <TemplateOne isPublic services={services} org={org} />
          ) : (
            <TemplateTwo isPublic services={services} org={org} />
          )}
        </main>
      </main>
    </>
  );
}
