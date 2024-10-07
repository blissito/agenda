import { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const loaderFunction = async ({ params }: LoaderFunctionArgs) => {
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
  if (!service || !org) return json(null, { status: 404 });
  return { org, service };
};
