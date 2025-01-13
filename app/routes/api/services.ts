import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/services";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  return {
    services: await db.service.findMany({
      where: {
        orgId: org.id,
      },
    }),
  };
};
