import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { serviceConfigHandler } from "~/components/forms/form_handlers/serviceConfigHandler";
import { ServiceConfigForm } from "~/components/forms/services_model/ServiceConfigForm";
import { getServicefromSearchParams } from "~/db/userGetters";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_service") {
    await serviceConfigHandler(request, formData); // not return if want to do stuff at the end
  }
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const service = await getServicefromSearchParams(request, {
    select: {
      id: true,
      payment: true,
      config: true,
    },
  });
  return {
    service,
  };
};

export default function Page() {
  const { service } = useLoaderData<typeof loader>();
  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Define tus cobros y recordatorios
      </h2>
      <ServiceConfigForm
        defaultValues={service}
        backButtonLink={`/dash/servicios/horario?serviceId=${service.id}`}
      />
    </main>
  );
}
