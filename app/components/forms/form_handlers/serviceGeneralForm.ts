import { getUserAndOrgOrRedirect } from "~/db/userGetters";
import { generalFormSchema } from "../services_model/ServiceGeneralForm";
import { db } from "~/utils/db.server";
import { redirect } from "@remix-run/node";

export const serviceGeneralFormHandler = async (
  request: Request,
  formData: FormData
) => {
  // 0. session and orgid
  const url = new URL(request.url);
  const { org } = await getUserAndOrgOrRedirect(request);
  // 1. get data
  // const formData = await request.formData();
  const data = Object.fromEntries(formData); // not using data key here 🥸
  // 2. validate data
  const validatedData = generalFormSchema.parse(data);
  // 3. create service object
  const service = await db.service.create({
    data: {
      ...validatedData,
      orgId: org.id,
      // required
      config: {
        confirmation: true,
        reminder: true,
        survey: true,
      },
      // @TODO: should we relate user?
      // userId: user.id
      // @TODO: should we provide a provider? 😇
    },
  });
  url.pathname = "/dash/servicios/fotos";
  url.searchParams.set("serviceId", service.id);
  // 4. redirect with serviceId in searchParams
  throw redirect(url.toString());
};
