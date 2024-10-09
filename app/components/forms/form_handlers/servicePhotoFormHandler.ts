import { redirect } from "@remix-run/node";
import { getServicefromSearchParams } from "~/.server/userGetters";
import { servicePhotoFormSchema } from "../services_model/ServicePhotoForm";
import { db } from "~/utils/db.server";

export const servicePhotoFormHandler = async (
  request: Request,
  formData: FormData
) => {
  // 0. session and orgid
  const url = new URL(request.url);
  const service = await getServicefromSearchParams(request);
  // 0. Guard
  if (!service) {
    url.pathname = "/dash/servicios/nuevo";
    throw redirect(url.toString());
  }
  // 1. get data
  // const formData = await request.formData();
  const data = Object.fromEntries(formData); // not using data key here 🥸
  // 2. validate data
  const validatedData = servicePhotoFormSchema.parse(data);

  // 3. update service object
  await db.service.update({
    where: { id: service.id },
    data: validatedData,
  });
  url.pathname = "/dash/servicios/horario";
  url.searchParams.set("serviceId", service.id);
  // 4. redirect with serviceId in searchParams
  throw redirect(url.toString());
};
