import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import type { Route } from "./+types/customers";
import { db } from "~/utils/db.server";
import { newCustomerSchema } from "~/utils/zod_schemas";

export const action = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  const formData = await request.formData();

  if (intent === "new") {
    const { org } = await getUserAndOrgOrRedirect(request);
    const rawData = JSON.parse(formData.get("data") as string);
    const result = newCustomerSchema.safeParse(rawData);
    if (!result.success) {
      return Response.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }
    return await db.customer.create({
      data: {
        displayName: result.data.displayName,
        email: result.data.email,
        tel: result.data.tel ?? undefined,
        comments: result.data.comments ?? undefined,
        orgId: org.id,
      },
    });
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
