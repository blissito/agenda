import { useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getServicefromSearchParams } from "~/.server/userGetters";
import { ServicePhotoForm } from "~/components/forms/services_model/ServicePhotoForm";
import { servicePhotoFormHandler } from "~/components/forms/form_handlers/servicePhotoFormHandler";
import { getPutFileUrl, removeFileUrl } from "~/utils/lib/tigris.server";
import invariant from "tiny-invariant";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_service") {
    await servicePhotoFormHandler(request, formData); // not return if want to do stuff at the end
  }
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const service = await getServicefromSearchParams(request, {
    select: {
      id: true,
      place: true,
      allowMultiple: true,
      isActive: true,
      photoURL: true,
    },
  });
  invariant(service && service.id);
  const putUrl = await getPutFileUrl(service.id);
  const removeUrl = await removeFileUrl(service.id);
  return {
    service,
    action: {
      removeUrl,
      putUrl,
      readUrl: `/api/images?key=${service.id}`,
    },
  };
};

export default function NewServicePhotos() {
  const { service, action } = useLoaderData<typeof loader>();

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Un poco más de información del agendamiento
      </h2>
      <ServicePhotoForm
        action={action}
        backButtonLink={`/dash/servicios/nuevo?serviceId=${service.id}`}
        defaultValues={service}
      />
    </main>
  );
}
