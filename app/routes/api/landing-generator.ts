import type { ActionFunctionArgs } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { generateOrgLanding, refineOrgLanding } from "~/lib/landing-generator.server"
import { db } from "~/utils/db.server"
import type { Section3 } from "@easybits.cloud/html-tailwind-generator"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent") as string

  if (intent === "generate") {
    const services = await db.service.findMany({
      where: { orgId: org.id, isActive: true, archived: false },
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        try {
          const allSections = await generateOrgLanding(org, services, {
            onSection: (section) => send("section", section),
            onImageUpdate: (id, html) => send("section-update", { id, html }),
            onDone: async (sections) => {
              send("done", { total: sections.length })
              // Auto-save to DB
              try {
                await db.org.update({
                  where: { id: org.id },
                  data: { landingSections: sections as any },
                })
              } catch (e) {
                console.error("Failed to auto-save sections:", e)
              }
            },
            onError: (error) => send("error", { message: error.message }),
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error al generar landing"
          send("error", { message })
        } finally {
          controller.close()
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
    const currentHtml = formData.get("currentHtml") as string
    const instruction = formData.get("instruction") as string
    const referenceImage = formData.get("referenceImage") as string | undefined

    if (!currentHtml || !instruction) {
      return Response.json({ error: "Missing currentHtml or instruction" }, { status: 400 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }
        try {
          await refineOrgLanding(org.id, currentHtml, instruction, {
            referenceImage: referenceImage || undefined,
            onChunk: (html) => send("chunk", { html }),
            onDone: (html) => send("done", { html }),
            onError: (err) => send("error", { message: err.message }),
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error al refinar"
          send("error", { message })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    })
  }

  if (intent === "save") {
    const sectionsRaw = formData.get("sections") as string
    const theme = formData.get("theme") as string | null
    const publish = formData.get("publish") === "true"

    console.log("[landing-generator] save intent — publish:", publish, "orgId:", org.id, "sectionsLength:", sectionsRaw?.length)

    if (!sectionsRaw) {
      return Response.json({ error: "Missing sections" }, { status: 400 })
    }

    let sections: Section3[]
    try {
      sections = JSON.parse(sectionsRaw)
    } catch {
      return Response.json({ error: "Invalid sections JSON" }, { status: 400 })
    }

    try {
      await db.org.update({
        where: { id: org.id },
        data: {
          landingSections: Array.isArray(sections) ? (sections as any) : [],
          landingTheme: theme || undefined,
          landingPublished: publish,
        },
      })
      console.log("[landing-generator] save OK — published:", publish)
    } catch (e) {
      console.error("[landing-generator] save FAILED:", e)
      return Response.json({ error: "DB update failed" }, { status: 500 })
    }

    return Response.json({ ok: true })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
