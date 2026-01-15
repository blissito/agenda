// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { getEvents, getService } from "~/.server/userGetters";

export const userInfoSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  comments: z.string(),
  tel: z.string().min(10),
});

export const actionFunction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "get_times_for_selected_date") {
    const service = await getService(params.serviceSlug);
    if (!service) throw json(null, { status: 404 });
    const events = await getEvents(service.id);
    return { events };
  }
  return null;
};
