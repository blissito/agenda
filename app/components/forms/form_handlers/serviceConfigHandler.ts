import { redirect } from "@remix-run/node";
import { getServicefromSearchParams } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import { serviceConfigFormSchema } from "../services_model/ServiceConfigForm";

export const serviceConfigHandler = async (
  request: Request,
  formData: FormData
) => {
  const url = new URL(request.url);
  const service = await getServicefromSearchParams(request);
  if (!service) {
    url.pathname = "/dash/servicios/nuevo";
    throw redirect(url.toString());
  }
  const data = JSON.parse(formData.get("data") as string); // Needs data string
  if (data.localWeekDays === "inherit") {
    data.weekDays = null;
  }
  const validatedData = serviceConfigFormSchema.parse(data);

  await db.service.update({
    where: { id: service.id },
    data: validatedData,
  });
  url.pathname = "/dash/servicios/servicio-agregado-con-exito";
  url.searchParams.set("serviceId", service.id);
  throw redirect(url.toString());
};
