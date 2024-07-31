import { redirect } from "@remix-run/node";
import { getServicefromSearchParams } from "~/db/userGetters";
import { db } from "~/utils/db.server";
import { serviceTimesSchema } from "../services_model/ServiceTimesForm";

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
  console.log("ValidatedData", validatedData);
  await db.service.update({
    where: { id: service.id },
    data: validatedData,
  });
  url.pathname = "/dash/servicios/config";
  url.searchParams.set("serviceId", service.id);
  throw redirect(url.toString());
};
