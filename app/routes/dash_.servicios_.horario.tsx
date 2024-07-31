import { serviceTimesFormHandler } from "~/components/forms/form_handlers/serviceTimesFormHandler";
import { ServiceTimesForm } from "~/components/forms/services_model/ServiceTimesForm";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_service") {
    await serviceTimesFormHandler(request, formData); // not return if want to do stuff at the end
  }
  return null;
};

export default function NewServiceTimetable() {
  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Define tu horario
      </h2>
      <ServiceTimesForm />
    </main>
  );
}
