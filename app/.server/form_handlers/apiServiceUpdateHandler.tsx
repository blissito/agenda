import { data as json } from "react-router";
import { db } from "~/utils/db.server";

export const apiServiceUpdateHandler = async (
  formData: FormData
  // request: Request,
) => {
  const data = JSON.parse(formData.get("data") as string);
  if (!data || !data.serviceId) return json(null, { status: 404 });
  const id = data.serviceId;
  delete data.serviceId;
  return json(
    JSON.stringify(
      await db.service.update({
        where: {
          id,
        },
        data,
      })
    ),
    { status: 200 }
  );
};
