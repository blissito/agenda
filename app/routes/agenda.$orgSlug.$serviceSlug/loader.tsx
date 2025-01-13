import { data as json } from "react-router";
import { db } from "~/utils/db.server";

export const loaderFunction = async ({ params }) => {
  const org = await db.org.findUnique({ where: { slug: params.orgSlug } });
  const service = await db.service.findUnique({
    where: {
      slug: params.serviceSlug,
    },
    include: {
      events: {
        where: {
          status: "ACTIVE", // chulada 🤤
        },
      },
    },
  });
  if (!service || !org) throw json(null, { status: 404 });
  return { org, service };
};
