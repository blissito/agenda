import { redirect } from "@remix-run/node";
import {
  getServicefromSearchParams,
  getUserOrRedirect,
} from "~/db/userGetters";
import { db } from "~/utils/db.server";
import { serviceTimesSchema } from "../services_model/ServiceTimesForm";
import { Org } from "@prisma/client";
import { weekDaysOrgSchema } from "~/utils/zod_schemas";

// this functions should handle everything including validation
export const handleOrgUpdate = async (request: Request, cn?: () => void) => {
  const formData = await request.formData();
  if (formData.get("intent") !== "update_org") return;
  const user = await getUserOrRedirect(request); // logged user @todo: permissions?
  const data = JSON.parse(String(formData.get("data"))) as Partial<Org>;
  // @todo improve
  if (!data || !user.orgId) return null;
  const validatedData = weekDaysOrgSchema.parse(data); // @todo should return errors?
  await db.org.update({ where: { id: user.orgId }, data: validatedData });
  throw cn?.();
};

export const serviceTimesFormHandler = async (
  request: Request,
  formData: FormData
) => {
  const url = new URL(request.url);
  const service = await getServicefromSearchParams(request);
  if (!service) {
    url.pathname = "/dash/servicios/nuevo";
    throw redirect(url.toString());
  }
  const data = JSON.parse(formData.get("data") as string);
  if (data.localWeekDays === "inherit") {
    data.weekDays = null;
  }
  const validatedData = serviceTimesSchema.parse(data);

  await db.service.update({
    where: { id: service.id },
    data: validatedData,
  });
  url.pathname = "/dash/servicios/config";
  url.searchParams.set("serviceId", service.id);
  throw redirect(url.toString());
};
