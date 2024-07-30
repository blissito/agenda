import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getServicefromSearchParams } from "~/db/userGetters";
import { ServicePhotoForm } from "~/components/forms/services_model/ServicePhotoForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const service = await getServicefromSearchParams(request);
  return { service };
};

export default function NewServicePhotos() {
  const { service } = useLoaderData<typeof loader>();
  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Un poco más de información del agendamiento
      </h2>
      <ServicePhotoForm
        backButtonLink={`/dash/servicios/nuevo?serviceId=${service.id}`}
        defaultValues={service}
      />
    </main>
  );
}
