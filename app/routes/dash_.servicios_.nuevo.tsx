import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { ServiceGeneralForm } from "~/components/forms/services_model/ServiceGeneralForm";
import { serviceGeneralFormHandler } from "~/components/forms/form_handlers/serviceGeneralFormHandler";
import { getServicefromSearchParams } from "~/db/userGetters";
import { useLoaderData } from "@remix-run/react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "general_form") {
    await serviceGeneralFormHandler(request, formData); // not return if want to do stuff at the end
  }
  return null;
};

// @TODO: just get the fields used in this route !
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const service = await getServicefromSearchParams(request, {
    redirectURL: null,
    select: {
      name: true,
      price: true,
      points: true,
      description: true,
    },
  });
  console.log(service);
  return { service: service || undefined };
};

export default function NewService() {
  const { service } = useLoaderData<typeof loader>();
  console.log("SERVICE; ", service);
  return (
    <main className="max-w-xl mx-auto pt-20 relative px-2">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        ¡Empecemos! <br /> Describe tu servicio
      </h2>
      <ServiceGeneralForm defaultValues={service} />
    </main>
  );
}
