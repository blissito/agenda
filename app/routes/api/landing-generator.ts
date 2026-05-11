import {
  type CustomColors,
  type Section3,
} from "@easybits.cloud/html-tailwind-generator"
import type { ActionFunctionArgs } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import {
  generateOrgLanding,
  getLandingUsage,
  incrementLandingUsage,
  refineOrgLanding,
} from "~/lib/landing-generator.server"
import { db } from "~/utils/db.server"
import { uploadFileToTigris } from "~/utils/lib/tigris.server"
import { getPublicImageUrl } from "~/utils/urls"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent") as string

  if (intent === "generate") {
    const usage = await getLandingUsage(org.id)
    if (usage.genUsed >= usage.genLimit) {
      return Response.json(
        { error: "Límite de generaciones alcanzado", code: "LIMIT_REACHED" },
        { status: 429 },
      )
    }

    const userInstructions =
      (formData.get("instruction") as string | null)?.trim() || undefined

    const services = await db.service.findMany({
      where: { orgId: org.id, isActive: true, archived: false },
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let closed = false
        const send = (event: string, data: unknown) => {
          if (closed) return
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          )
        }
        const close = () => {
          if (closed) return
          closed = true
          controller.close()
        }

        try {
          let donePromise: Promise<void> | undefined
          await generateOrgLanding(org, services, {
            userInstructions,
            onSection: (section) => send("section", section),
            onImageUpdate: (id, html) => send("section-update", { id, html }),
            onPartialSection: (index, html) =>
              send("partial", { index, html }),
            onDone: async (sections) => {
              send("done", { total: sections.length })
              // Run async work but capture the promise so we await it before closing
              donePromise = (async () => {
                await incrementLandingUsage(org.id, "gen")
                try {
                  await db.org.update({
                    where: { id: org.id },
                    data: { landingSections: sections as any },
                  })
                } catch (e) {
                  console.error("Failed to auto-save sections:", e)
                }
              })()
            },
            onError: (error) => send("error", { message: error.message }),
          })
          // Wait for onDone async work to finish before closing
          if (donePromise) await donePromise
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error al generar landing"
          send("error", { message })
        } finally {
          close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }

  if (intent === "refine") {
    const usage = await getLandingUsage(org.id)
    if (usage.refineUsed >= usage.refineLimit) {
      return Response.json(
        { error: "Límite de refinamientos alcanzado", code: "LIMIT_REACHED" },
        { status: 429 },
      )
    }

    const currentHtml = formData.get("currentHtml") as string
    const instruction = formData.get("instruction") as string
    const referenceImage = formData.get("referenceImage") as string | undefined

    if (!currentHtml || !instruction) {
      return Response.json(
        { error: "Missing currentHtml or instruction" },
        { status: 400 },
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let closed = false
        const send = (event: string, data: unknown) => {
          if (closed) return
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          )
        }
        const close = () => {
          if (closed) return
          closed = true
          controller.close()
        }
        try {
          let donePromise: Promise<void> | undefined
          await refineOrgLanding(org.id, currentHtml, instruction, {
            referenceImage: referenceImage || undefined,
            onChunk: (html) => send("chunk", { html }),
            onDone: async (html) => {
              send("done", { html })
              donePromise = incrementLandingUsage(org.id, "refine")
            },
            onError: (err) => send("error", { message: err.message }),
          })
          if (donePromise) await donePromise
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error al refinar"
          send("error", { message })
        } finally {
          close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }

  if (intent === "regenerate_sections") {
    const usage = await getLandingUsage(org.id)
    if (usage.refineUsed >= usage.refineLimit) {
      return Response.json(
        { error: "Límite de refinamientos alcanzado", code: "LIMIT_REACHED" },
        { status: 429 },
      )
    }

    const sectionIdsRaw = formData.get("sectionIds") as string | null
    const instruction = (formData.get("instruction") as string | null)?.trim()
    let sectionIds: string[] = []
    try {
      sectionIds = sectionIdsRaw ? JSON.parse(sectionIdsRaw) : []
    } catch {
      return Response.json(
        { error: "Invalid sectionIds JSON" },
        { status: 400 },
      )
    }
    if (sectionIds.length === 0) {
      return Response.json(
        { error: "Selecciona al menos una sección" },
        { status: 400 },
      )
    }

    const currentSections = (org.landingSections as Section3[] | null) ?? []
    const targets = currentSections.filter((s) => sectionIds.includes(s.id))
    if (targets.length === 0) {
      return Response.json(
        { error: "No se encontraron las secciones seleccionadas" },
        { status: 404 },
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let closed = false
        const send = (event: string, data: unknown) => {
          if (closed) return
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          )
        }
        const close = () => {
          if (closed) return
          closed = true
          controller.close()
        }
        try {
          let consumedRefines = 0
          for (const target of targets) {
            const baseInstruction =
              instruction ||
              "Regenera esta sección manteniendo el mismo propósito pero mejorando diseño, copy e imágenes. Conserva la estructura semántica."
            const finalHtml = await refineOrgLanding(
              org.id,
              target.html,
              `Estás regenerando la sección "${target.id}". ${baseInstruction}`,
            )
            send("section-done", { id: target.id, html: finalHtml })
            await incrementLandingUsage(org.id, "refine")
            consumedRefines += 1
          }
          send("done", { regenerated: consumedRefines })
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error al regenerar secciones"
          send("error", { message })
        } finally {
          close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }

  if (intent === "save") {
    const sectionsRaw = formData.get("sections") as string
    const theme = formData.get("theme") as string | null
    const customColorsRaw = formData.get("customColors") as string | null
    const brandkitRaw = formData.get("brandkit") as string | null
    const publish = formData.get("publish") === "true"
    const chatbotEnabledRaw = formData.get("chatbotEnabled")
    const chatbotEnabled =
      chatbotEnabledRaw === null ? undefined : chatbotEnabledRaw === "true"

    console.log(
      "[landing-generator] save intent — publish:",
      publish,
      "orgId:",
      org.id,
      "sectionsLength:",
      sectionsRaw?.length,
    )

    if (!sectionsRaw) {
      return Response.json({ error: "Missing sections" }, { status: 400 })
    }

    let sections: Section3[]
    try {
      sections = JSON.parse(sectionsRaw)
    } catch {
      return Response.json({ error: "Invalid sections JSON" }, { status: 400 })
    }

    let parsedCustomColors: CustomColors | null = null
    if (customColorsRaw) {
      try {
        parsedCustomColors = JSON.parse(customColorsRaw) as CustomColors
      } catch {
        return Response.json(
          { error: "Invalid customColors JSON" },
          { status: 400 },
        )
      }
    }

    // No sanitizar en save: las ediciones manuales deben respetarse tal cual.
    // El HTML de generate/refine ya pasa por el sanitizer dentro del SDK,
    // así que el editor recibe HTML limpio. Re-sanitizar aquí pisa cambios
    // manuales (ej. bg-black se mapea de regreso a bg-primary del tema).

    let brandkitParsed: Record<string, unknown> | null | undefined
    if (brandkitRaw !== null) {
      if (brandkitRaw === "" || brandkitRaw === "null") {
        brandkitParsed = null
      } else {
        try {
          brandkitParsed = JSON.parse(brandkitRaw)
        } catch {
          return Response.json({ error: "Invalid brandkit JSON" }, { status: 400 })
        }
      }
    }

    try {
      await db.org.update({
        where: { id: org.id },
        data: {
          landingSections: Array.isArray(sections) ? (sections as any) : [],
          landingTheme: theme || undefined,
          ...(parsedCustomColors !== null
            ? { landingCustomColors: parsedCustomColors as any }
            : {}),
          landingPublished: publish,
          ...(chatbotEnabled !== undefined
            ? { landingChatbotEnabled: chatbotEnabled }
            : {}),
          ...(brandkitParsed !== undefined
            ? { brandkit: brandkitParsed as any }
            : {}),
        },
      })
      console.log("[landing-generator] save OK — published:", publish)
    } catch (e) {
      console.error("[landing-generator] save FAILED:", e)
      return Response.json({ error: "DB update failed" }, { status: 500 })
    }

    return Response.json({ ok: true })
  }

  if (intent === "image_upload") {
    const file = formData.get("file") as File | null
    if (!file || typeof file === "string") {
      return Response.json({ error: "Missing file" }, { status: 400 })
    }
    const MAX_BYTES = 8 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: "Imagen demasiado grande (máx 8 MB)" },
        { status: 413 },
      )
    }
    if (!/^image\//.test(file.type)) {
      return Response.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 },
      )
    }
    const ext = (file.name.split(".").pop() || "png").toLowerCase()
    const key = `landings/${org.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      await uploadFileToTigris(key, buffer, file.type)
    } catch (e: any) {
      console.error("[landing image_upload] tigris failed:", e?.message || e)
      return Response.json({ error: "Upload failed" }, { status: 500 })
    }
    return Response.json({ url: getPublicImageUrl(key), key })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
