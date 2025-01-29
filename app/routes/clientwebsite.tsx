import { db } from "~/utils/db.server";
import type { Route } from "./+types/clientwebsite";
import TemplateOne from "~/components/templates/TemplateOne";
import TemplateTwo from "~/components/templates/TemplateTwo";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const org = await db.org.findUnique({
    where: {
      slug: params.orgSlug,
    },
    include: { services: { where: { isActive: true, archived: false } } },
  });
  if (!org) throw new Response("Empresa no encontrada", { status: 404 });

  return org;
};

export default function Index({ loaderData: org }: Route.ComponentProps) {
  return org.websiteConfig?.template === "defaultTemplate" ? (
    <TemplateOne org={org} services={org.services} />
  ) : (
    <TemplateTwo org={org} services={org.services} />
  );
}
