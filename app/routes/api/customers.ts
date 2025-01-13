import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import type { Route } from "./+types/customers";
import { db } from "~/utils/db.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  const formData = await request.formData();

  if (intent === "new") {
    const { org } = await getUserAndOrgOrRedirect(request);
    const data = JSON.parse(formData.get("data") as string);
    data.orgId = org.id;
    // @todo validate & user relation
    return await db.customer.create({ data });
  }
  return null;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("search") as string;
  // @todo lower and upper (regex) match
  return {
    customers: await db.customer.findMany({
      where: {
        orgId: org.id,
        OR: [
          {
            displayName: {
              startsWith: search,
            },
          },
          {
            email: {
              startsWith: search,
            },
          },
          {
            comments: {
              startsWith: search,
            },
          },
          {
            tel: {
              startsWith: search,
            },
          },
        ],
      },
    }),
  };
};
