import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getOrgFromApiKey } from "~/.server/apiKeyAuth"
import { db } from "~/utils/db.server"
import { uploadFileToTigris } from "~/utils/lib/tigris.server"
import { generateUniqueServiceSlug } from "~/utils/slugs.server"
import { getServicePublicUrl } from "~/utils/urls"
import { WEEK_DAYS } from "~/utils/weekDays"

/**
 * GET /api/mcp/services?intent=list
 * GET /api/mcp/services?intent=public_url&serviceId=...
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") ?? "list"

  if (intent === "list") {
    const includeArchived = url.searchParams.get("includeArchived") === "true"
    const services = await db.service.findMany({
      where: { orgId: org.id, ...(includeArchived ? {} : { archived: false }) },
      orderBy: { name: "asc" },
    })
    return Response.json(services.map(serializeService))
  }

  if (intent === "public_url") {
    const serviceId = url.searchParams.get("serviceId")
    if (!serviceId)
      return Response.json({ error: "serviceId required" }, { status: 400 })
    const service = await db.service.findFirst({
      where: { id: serviceId, orgId: org.id },
    })
    if (!service) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json({
      url: getServicePublicUrl(org.slug, (service as any).slug),
    })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

/**
 * POST /api/mcp/services
 *  - multipart/form-data con intent=gallery_upload
 *  - application/json con intent= create | update | update_hours | gallery_remove
 *    | gallery_reorder | archive | unarchive | toggle_active
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const intent = form.get("intent") as string
    if (intent === "gallery_upload") {
      const serviceId = form.get("serviceId") as string
      const file = form.get("file") as File | null
      if (!serviceId || !file)
        return Response.json(
          { error: "serviceId and file required" },
          { status: 400 },
        )
      const service = await db.service.findFirst({
        where: { id: serviceId, orgId: org.id },
        select: { id: true, gallery: true },
      })
      if (!service)
        return Response.json({ error: "Service not found" }, { status: 404 })
      const key = `services/${service.id}/${Date.now()}-${file.name}`
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        await uploadFileToTigris(key, buffer, file.type)
      } catch (e: any) {
        console.error("[mcp gallery_upload] Tigris failed:", e.message || e)
        return Response.json(
          { error: "Upload failed", details: e.message },
          { status: 500 },
        )
      }
      const gallery = [...(service.gallery || []), key]
      const updated = await db.service.update({
        where: { id: service.id },
        data: { gallery },
      })
      return Response.json({
        ok: true,
        key,
        service: serializeService(updated),
      })
    }
    return Response.json({ error: "Unknown multipart intent" }, { status: 400 })
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, any>
  const intent = body.intent as string

  if (intent === "create") {
    const { name } = body
    if (!name || typeof name !== "string")
      return Response.json({ error: "name required" }, { status: 400 })
    const service = await db.service.create({
      data: {
        orgId: org.id,
        name,
        slug: await generateUniqueServiceSlug(name, org.id),
        description: body.description ?? null,
        price: body.price ?? 0,
        currency: body.currency ?? "MXN",
        duration: body.duration ?? 30,
        points: body.points ?? 0,
        videoProvider: body.videoProvider ?? "auto",
        place: body.place ?? "INPLACE",
        isActive: body.isActive ?? false,
        allowMultiple: false,
        archived: false,
        paid: false,
        payment: false,
        seats: 1,
      },
    })
    return Response.json(serializeService(service))
  }

  const serviceId = body.serviceId as string
  if (!serviceId)
    return Response.json({ error: "serviceId required" }, { status: 400 })

  const existing = await db.service.findFirst({
    where: { id: serviceId, orgId: org.id },
  })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  if (intent === "update") {
    const allowed = [
      "name",
      "description",
      "price",
      "currency",
      "duration",
      "points",
      "videoProvider",
      "place",
      "isActive",
      "address",
      "lat",
      "lng",
      "employeeName",
      "allowMultiple",
      "seats",
    ] as const
    const data: Record<string, any> = {}
    for (const k of allowed) if (k in body) data[k] = body[k]
    const updated = await db.service.update({ where: { id: serviceId }, data })
    return Response.json(serializeService(updated))
  }

  if (intent === "update_hours") {
    const { weekDays, duration } = body
    if (!weekDays || typeof weekDays !== "object")
      return Response.json({ error: "weekDays required" }, { status: 400 })
    const invalidKeys = Object.keys(weekDays).filter(
      (k) => !WEEK_DAYS.includes(k as any),
    )
    if (invalidKeys.length)
      return Response.json(
        {
          error: `Invalid weekDays keys: ${invalidKeys.join(",")}. Use English: ${WEEK_DAYS.join(",")}`,
        },
        { status: 400 },
      )
    const updated = await db.service.update({
      where: { id: serviceId },
      data: {
        weekDays: { set: weekDays },
        ...(duration != null ? { duration } : {}),
      },
    })
    return Response.json(serializeService(updated))
  }

  if (intent === "gallery_remove") {
    const { key } = body
    if (!key) return Response.json({ error: "key required" }, { status: 400 })
    const gallery = (existing.gallery || []).filter((k) => k !== key)
    const updated = await db.service.update({
      where: { id: serviceId },
      data: { gallery },
    })
    return Response.json(serializeService(updated))
  }

  if (intent === "gallery_reorder") {
    const { gallery } = body
    if (!Array.isArray(gallery))
      return Response.json({ error: "gallery array required" }, { status: 400 })
    const currentSet = new Set(existing.gallery || [])
    const nextSet = new Set(gallery)
    if (
      currentSet.size !== nextSet.size ||
      [...currentSet].some((k) => !nextSet.has(k))
    )
      return Response.json(
        { error: "gallery must contain same keys as current (reorder only)" },
        { status: 400 },
      )
    const updated = await db.service.update({
      where: { id: serviceId },
      data: { gallery },
    })
    return Response.json(serializeService(updated))
  }

  if (intent === "archive" || intent === "unarchive") {
    const updated = await db.service.update({
      where: { id: serviceId },
      data: { archived: intent === "archive" },
    })
    return Response.json(serializeService(updated))
  }

  if (intent === "toggle_active") {
    const next =
      typeof body.isActive === "boolean" ? body.isActive : !existing.isActive
    const updated = await db.service.update({
      where: { id: serviceId },
      data: { isActive: next },
    })
    return Response.json(serializeService(updated))
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

function serializeService(s: any) {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    price: Number(s.price),
    currency: s.currency,
    duration: Number(s.duration),
    isActive: s.isActive,
    archived: s.archived,
    points: Number(s.points),
    videoProvider: s.videoProvider,
    place: s.place,
    address: s.address,
    gallery: s.gallery ?? [],
    weekDays: s.weekDays ?? null,
    seats: s.seats != null ? Number(s.seats) : null,
    allowMultiple: s.allowMultiple,
  }
}
