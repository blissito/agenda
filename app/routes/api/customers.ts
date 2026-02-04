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
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }
    const rawData = JSON.parse(formData.get("data") as string);
    const result = newCustomerSchema.safeParse(rawData);
    if (!result.success) {
      return Response.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }
    const now = new Date();
    return await db.customer.create({
      data: {
        displayName: result.data.displayName,
        email: result.data.email,
        tel: result.data.tel ?? "",
        comments: result.data.comments ?? "",
        orgId: org.id,
        createdAt: now,
        updatedAt: now,
      },
    });
  }
  return null;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) {
    throw new Response("Organization not found", { status: 404 });
  }
  const url = new URL(request.url);
  const rawSearch = url.searchParams.get("search") || "";
  // Sanitize: remove special regex chars and limit length
  const search = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "").slice(0, 100);

  if (!search) {
    return {
      customers: await db.customer.findMany({
        where: { orgId: org.id },
        take: 50,
      }),
    };
  }

  return {
    customers: await db.customer.findMany({
      where: {
        orgId: org.id,
        OR: [
          {
            displayName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            comments: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            tel: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 50,
    }),
  };
};
