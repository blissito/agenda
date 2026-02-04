import { useLoaderData } from "react-router"
import invariant from "tiny-invariant"
import { getServicefromSearchParams } from "~/.server/userGetters"
import { ServicePhotoForm } from "~/components/forms/services_model/ServicePhotoForm"

type ServicePhotoData = {
  id: string
  place: string
  allowMultiple: boolean
  isActive: boolean
  photoURL?: string | null
}

export const loader = async ({ request }: { request: Request }) => {
  const serviceData = await getServicefromSearchParams(request, {
    select: {
      id: true,
      place: true,
      allowMultiple: true,
      isActive: true,
      photoURL: true,
    },
  })
  const service = serviceData as unknown as ServicePhotoData
  invariant(service?.id)
  return { service }
}

export default function NewServicePhotos() {
  const { service } = useLoaderData<typeof loader>()

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Un poco más de información del agendamiento
      </h2>
      <ServicePhotoForm
        defaultValues={{
          place: service.place,
          allowMultiple: service.allowMultiple,
          isActive: service.isActive,
          photoURL: service.photoURL ?? undefined,
        }}
      />
    </main>
  )
}
