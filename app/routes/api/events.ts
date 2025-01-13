import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import type { Route } from "./+types/customers";
import { db } from "~/utils/db.server";
import type { Event } from "@prisma/client";
import { newEventSchema } from "~/utils/zod_schemas";

export const action = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  const formData = await request.formData();

  if (intent === "new") {
    const { org, user } = await getUserAndOrgOrRedirect(request);
    const data: Event = JSON.parse(formData.get("data") as string);
    // @todo validate
    const validData = newEventSchema.parse(data);
    const customer = await db.customer.findUnique({
      where: { id: validData.customerId as string },
      select: { displayName: true },
    });
    const event = await db.event.create({
      data: {
        ...validData,
        orgId: org.id,
        userId: user.id,
        title: customer?.displayName,
      },
    });
    return event; // rather null?
  }
  return null;
};
