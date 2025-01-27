import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/dash.website";
import { Template } from "./Template";
import { CompanyInfo } from "./CompanyInfo";
import { getQRImageURL } from "~/utils/getQR";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const { org } = await getUserAndOrgOrRedirect(request);
  url.pathname = `/agenda/${org.slug}`;
  const qr = await getQRImageURL(url.toString());
  const services = await db.service.findMany({
    where: { orgId: org.id, archived: false },
    select: {
      id: true,
      name: true,
      photoURL: true,
      slug: true,
      isActive: true,
    },
  });
  return { url: url.toString(), qr, org, services };
};

export default function Website({ loaderData }: Route.ComponentProps) {
  const { url, qr, org, services } = loaderData;
  return (
    <main className=" ">
      <RouteTitle>Mi sitio web </RouteTitle>
      <section className=" grid grid-cols-6 gap-6">
        <Template org={org} url={url} qr={qr} />
        <CompanyInfo org={org} services={services} />
      </section>
    </main>
  );
}
