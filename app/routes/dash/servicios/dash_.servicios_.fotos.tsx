import { useLoaderData } from "react-router"
import invariant from "tiny-invariant"
import { getServicefromSearchParams } from "~/.server/userGetters"
import {
  type PhotoAction,
  ServicePhotoForm,
} from "~/components/forms/services_model/ServicePhotoForm"
import { getPutFileUrl, removeFileUrl } from "~/utils/lib/tigris.server"

type ServicePhotoData = {
  id: string
  place: string
  allowMultiple: boolean
  isActive: boolean
  gallery: string[]
}

export const loader = async ({ request }: { request: Request }) => {
  const serviceData = await getServicefromSearchParams(request, {
    select: {
      id: true,
      place: true,
      allowMultiple: true,
      isActive: true,
      gallery: true,
    },
  })
  const service = serviceData as unknown as ServicePhotoData
  invariant(service?.id)

  // Generate upload URLs for service photo
  let photoAction: PhotoAction | undefined
  try {
    const photoKey = `services/${service.id}/gallery/${Date.now()}`
    const putUrl = await getPutFileUrl(photoKey)
    const removeUrl = await removeFileUrl(photoKey)
    const currentPhoto = service.gallery?.[0]
    photoAction = {
      putUrl,
      removeUrl,
      readUrl: currentPhoto ? `/api/images?key=${currentPhoto}` : undefined,
      logoKey: photoKey,
    }
  } catch (error) {
    console.warn(
      "Service photo upload error:",
      error instanceof Error ? error.message : error,
    )
  }

  return { service, photoAction }
}

export default function NewServicePhotos() {
  const { service, photoAction } = useLoaderData<typeof loader>()

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Un poco más de información del agendamiento
      </h2>
      <ServicePhotoForm
        photoAction={photoAction}
        defaultValues={{
          place: service.place,
          allowMultiple: service.allowMultiple,
          isActive: service.isActive,
          gallery: service.gallery?.[0] ?? "",
        }}
      />
    </main>
  )
}
