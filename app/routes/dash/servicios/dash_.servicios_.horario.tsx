// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { useLoaderData } from "react-router";
import { serviceTimesFormHandler } from "~/.server/form_handlers/serviceTimesFormHandler";
import { ServiceTimesForm } from "~/components/forms/services_model/ServiceTimesForm";
import { getServicefromSearchParams } from "~/.server/userGetters";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_service") {
    await serviceTimesFormHandler(request, formData); // not return if want to do stuff at the end
  }
  return null;
};

export const loader = async ({ request }) => {
  // will redirect when 404
  const service = await getServicefromSearchParams(request, {
    select: {
      id: true,
      duration: true,
      weekDays: true,
    },
  });
  return {
    service,
  };
};

export default function NewServiceTimetable() {
  const { service } = useLoaderData<typeof loader>();

  return (
    <main className="max-w-xl mx-auto py-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Define tu horario
      </h2>
      <ServiceTimesForm
        backButtonLink={`/dash/servicios/fotos?serviceId=${service.id}`}
        defaultValues={service}
      />
    </main>
  );
}
