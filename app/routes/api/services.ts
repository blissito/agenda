import type { Prisma, Service } from "@prisma/client"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { ServerServiceConfigFormSchema } from "~/components/forms/services_model/ServiceConfigForm"
import { generalFormSchema } from "~/components/forms/services_model/ServiceGeneralForm"
import {
  type PhotoAction,
  serverServicePhotoFormSchema,
} from "~/components/forms/services_model/ServicePhotoForm"
import { serviceTimesSchema } from "~/components/forms/services_model/ServiceTimesForm"
import { db } from "~/utils/db.server"
import { getPutFileUrl, removeFileUrl } from "~/utils/lib/tigris.server"
import { generateUniqueServiceSlug } from "~/utils/slugs.server"
import type { Route } from "./+types/services"

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")
  const data = JSON.parse(formData.get("data") as string) as Partial<Service>

  if (intent === "service_update") {
    const { id } = data
    delete data.id
    return await db.service.update({ where: { id }, data })
  }
  //67c90587bd7089263a5cf40b

  if (intent === "config_form") {
    const {
      success,
      data: parsedData,
      error,
    } = ServerServiceConfigFormSchema.safeParse(data)
    if (!success) throw new Response("Error in form fields", { status: 400 })

    await db.service.update({
      where: { id: data.id },
      data: { ...parsedData, isActive: true } as Prisma.ServiceUpdateInput,
    })
    return { id: data.id, nextIndex: 4 }
  }

  if (intent === "times_form") {
    const {
      success,
      data: parsedData,
      error,
    } = serviceTimesSchema.safeParse(data)
    if (!success) throw new Response("Error in form fields", { status: 400 })

    await db.service.update({
      where: { id: data.id },
      data: {
        duration: parsedData.duration,
        weekDays: parsedData.weekDays
          ? { set: parsedData.weekDays }
          : undefined,
      },
    })
    return { id: data.id, nextIndex: 3 }
  }

  if (intent === "photo_form") {
    const {
      success,
      data: parsedData,
      error,
    } = serverServicePhotoFormSchema.safeParse(data)
    if (!success) throw new Response("Error in form fields", { status: 400 })

    // Build update data, handling gallery as array
    const updateData: Prisma.ServiceUpdateInput = {
      place: parsedData.place,
      allowMultiple: parsedData.allowMultiple,
      isActive: parsedData.isActive,
    }

    // If a new photo key was provided, set it as the first gallery item
    if (parsedData.gallery) {
      updateData.gallery = [parsedData.gallery]
    }

    await db.service.update({
      where: { id: data.id },
      data: updateData,
    })
    return { id: data.id, nextIndex: 2 }
  }

  if (intent === "general_form") {
    const {
      success,
      error,
      data: parsedData,
    } = generalFormSchema.safeParse(data)
    if (!success) throw new Response("Error in form fields", { status: 400 })

    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      throw new Response("Organization not found", { status: 404 })
    }
    const newService = await db.service.create({
      data: {
        ...parsedData,
        orgId: org.id,
        slug: await generateUniqueServiceSlug(parsedData.name, org.id),
        // Valores por defecto para campos requeridos
        allowMultiple: false,
        archived: false,
        currency: "MXN",
        duration: 30,
        isActive: false,
        paid: false,
        payment: false,
        place: "INPLACE",
        points: parsedData.points ?? 0,
        price: parsedData.price ?? 0,
        seats: 1,
      },
    })
    return { id: newService.id, nextIndex: 1 }
  }

  return null
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")

  // Get upload URLs for a specific service
  if (intent === "get_photo_urls") {
    const serviceId = url.searchParams.get("serviceId")
    if (!serviceId) {
      return Response.json({ error: "serviceId required" }, { status: 400 })
    }

    // Verify service belongs to org
    const service = await db.service.findFirst({
      where: { id: serviceId, orgId: org.id },
      select: { id: true, gallery: true },
    })
    if (!service) {
      return Response.json({ error: "Service not found" }, { status: 404 })
    }

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

    return Response.json({ photoAction })
  }

  return {
    services: await db.service.findMany({
      where: {
        orgId: org.id,
        archived: false,
      },
    }),
  }
}
