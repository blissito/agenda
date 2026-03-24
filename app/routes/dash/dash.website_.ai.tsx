import { useCallback, useEffect, useRef, useState } from "react"
import { useFetcher, useLoaderData, Link } from "react-router"
import { getOrgPublicUrl } from "~/utils/urls"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import { getLandingUsage } from "~/lib/landing-generator.server"
import {
  LANDING_THEMES,
  buildPreviewHtml,
  type Section3,
  type CustomColors,
  grapesToSections,
} from "@easybits.cloud/html-tailwind-generator"
import { GrapesEditor, type GrapesEditorHandle, type AiAction } from "@easybits.cloud/html-tailwind-generator/components4"
import type { Route } from "./+types/dash.website_.ai"

export const handle = { hideSidebar: true }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request, {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      businessType: true,
      landingSections: true,
      landingTheme: true,
      landingCustomColors: true,
      landingPublished: true,
    },
  })
  if (!org) throw new Response("Org not found", { status: 404 })

  const serviceCount = await db.service.count({
    where: { orgId: org.id, isActive: true, archived: false },
  })

  const usage = await getLandingUsage(org.id)
  return { org, serviceCount, usage }
}

/** Convert Section3[] to a single HTML string for GrapesEditor */
function sectionsToHtml(sections: Section3[]): string {
  return sections
    .filter((s) => s.id !== "__grapes_css__")
    .sort((a, b) => a.order - b.order)
    .map((s) => s.html)
    .join("\n")
}

export default function WebsiteAI({ loaderData }: Route.ComponentProps) {
  const { org, serviceCount, usage: initialUsage } = loaderData
  const [usage, setUsage] = useState(initialUsage)
  const fetcher = useFetcher()
  const editorRef = useRef<GrapesEditorHandle>(null)

  // State
  const [sections, setSections] = useState<Section3[]>(
    (org.landingSections as Section3[] | null) || [],
  )
  const [theme, setTheme] = useState(org.landingTheme || "default")
  const [customColors, setCustomColors] = useState<Record<string, string>>(
    () => (org.landingCustomColors as Record<string, string> | null) || {},
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false)
  // During generation, we stream sections into a lightweight preview
  const [streamingSections, setStreamingSections] = useState<Section3[]>([])
  const [streamCount, setStreamCount] = useState(0)

  const isLoading = fetcher.state !== "idle"
  const hasExistingSections = sections.length > 0
  const abortRef = useRef<AbortController | null>(null)
  const isSavingRef = useRef(false)
  const streamEndRef = useRef<HTMLDivElement>(null)

  isSavingRef.current = isSaving

  // Show GrapesEditor only when NOT generating and has sections
  const showEditor = hasExistingSections && !isGenerating

  // Generate landing (streaming SSE)
  const handleGenerate = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsGenerating(true)
    setSaveMessage(null)
    setErrorMessage(null)
    const backup = sections
    setSections([])
    setStreamingSections([])
    setStreamCount(0)

    try {
      const formData = new FormData()
      formData.append("intent", "generate")

      const res = await fetch("/api/landing-generator", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      if (res.status === 429) {
        const data = await res.json()
        setErrorMessage(data.error || "Limite alcanzado")
        setSections(backup)
        setIsGenerating(false)
        return
      }
      if (!res.ok) throw new Error("Generation failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let buf = ""
      let eventType = ""
      const pendingUpdates = new Map<string, string>()
      let genRafId: number | null = null
      const flushGenUpdates = () => {
        if (pendingUpdates.size > 0) {
          const updates = new Map(pendingUpdates)
          pendingUpdates.clear()
          setStreamingSections((prev) =>
            prev.map((s) => updates.has(s.id) ? { ...s, html: updates.get(s.id)! } : s),
          )
        }
        genRafId = null
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        const lines = buf.split("\n")
        buf = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (eventType === "section") {
                setStreamingSections((prev) => [...prev, data])
                setStreamCount((c) => c + 1)
                requestAnimationFrame(() => {
                  streamEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
                })
              } else if (eventType === "section-update") {
                pendingUpdates.set(data.id, data.html)
                if (!genRafId) genRafId = requestAnimationFrame(flushGenUpdates)
              } else if (eventType === "done") {
                setUsage((u) => ({ ...u, genUsed: u.genUsed + 1 }))
              } else if (eventType === "error") {
                setErrorMessage(data.message)
              }
            } catch { /* skip malformed */ }
          }
        }
      }
      // Flush remaining updates
      if (genRafId) cancelAnimationFrame(genRafId)
      if (pendingUpdates.size > 0) {
        const updates = new Map(pendingUpdates)
        pendingUpdates.clear()
        setStreamingSections((prev) =>
          prev.map((s) => updates.has(s.id) ? { ...s, html: updates.get(s.id)! } : s),
        )
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      const message = err instanceof Error ? err.message : "Error al generar"
      setErrorMessage(message)
      setSections((current) => current.length > 0 ? current : backup)
    } finally {
      if (abortRef.current === controller) {
        // Move streaming sections to real sections, ending the generation
        setStreamingSections((final) => {
          if (final.length > 0) setSections(final)
          return []
        })
        setIsGenerating(false)
        setHasUnpublishedChanges(true)
      }
    }
  }, [])

  // Handle fetcher responses (save)
  const lastFetcherDataRef = useRef<unknown>(null)
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data || fetcher.data === lastFetcherDataRef.current) return
    lastFetcherDataRef.current = fetcher.data
    const data = fetcher.data as { ok?: boolean; error?: string }

    if (isSavingRef.current && pendingSaveRef.current) {
      if (data.error) {
        setErrorMessage(data.error)
      } else if (data.ok) {
        const msg = pendingSaveRef.current.publish ? "Landing publicada" : "Borrador guardado"
        setSaveMessage(msg)
        setTimeout(() => setSaveMessage(null), 3000)
        if (pendingSaveRef.current.publish) setHasUnpublishedChanges(false)
      }
      setIsSaving(false)
      pendingSaveRef.current = null
    }
  }, [fetcher.state, fetcher.data])

  // AI refine handler (called from GrapesEditor toolbar)
  const handleAiAction = useCallback(async (action: AiAction) => {
    if (action.type !== "refine-element") return

    const instruction = prompt("Instruccion para refinar:")
    if (!instruction) return

    setIsRefining(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("intent", "refine")
      formData.append("currentHtml", action.isSection ? action.html : (action.sectionHtml || action.html))
      formData.append("instruction", instruction)

      const res = await fetch("/api/landing-generator", {
        method: "POST",
        body: formData,
      })
      if (res.status === 429) {
        const data = await res.json()
        setErrorMessage(data.error || "Limite de refinamientos alcanzado")
        setIsRefining(false)
        return
      }
      if (!res.ok) throw new Error("Refine failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let buf = ""
      let eventType = ""
      let finalHtml = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        const lines = buf.split("\n")
        buf = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (eventType === "done" && data.html) {
                finalHtml = data.html
                setUsage((u) => ({ ...u, refineUsed: u.refineUsed + 1 }))
              } else if (eventType === "chunk" && data.html) {
                finalHtml = data.html
              } else if (eventType === "error") {
                setErrorMessage(data.message)
              }
            } catch {}
          }
        }
      }

      // Apply the refined HTML back to GrapesEditor
      if (finalHtml && editorRef.current) {
        if (action.isSection || !action.sectionComponentId) {
          // Replaced the whole section
          editorRef.current.replaceComponent(action.componentId, finalHtml)
        } else {
          // Replaced the parent section with the refined version
          editorRef.current.replaceComponent(action.sectionComponentId, finalHtml)
        }
        setHasUnpublishedChanges(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al refinar"
      setErrorMessage(message)
    } finally {
      setIsRefining(false)
    }
  }, [])

  // Save/Publish
  const pendingSaveRef = useRef<{ publish: boolean } | null>(null)
  const handleSave = useCallback(
    (publish: boolean) => {
      // Get latest HTML from editor
      let currentSections = sections
      if (editorRef.current) {
        const html = editorRef.current.getHtml()
        if (html) currentSections = grapesToSections(html)
      }

      setIsSaving(true)
      setSaveMessage(null)
      setErrorMessage(null)
      pendingSaveRef.current = { publish }
      fetcher.submit(
        {
          intent: "save",
          sections: JSON.stringify(currentSections),
          theme,
          customColors: JSON.stringify(customColors),
          publish: publish ? "true" : "false",
        },
        { method: "post", action: "/api/landing-generator" },
      )
    },
    [sections, theme, customColors, fetcher],
  )

  // GrapesEditor onChange — sync sections state
  const handleEditorChange = useCallback((html: string) => {
    const newSections = grapesToSections(html)
    setSections(newSections)
    setHasUnpublishedChanges(true)
  }, [])

  // Theme change from GrapesEditor sidebar
  const handleThemeChange = useCallback((themeId: string, colors?: Record<string, string>) => {
    setTheme(themeId)
    if (colors) setCustomColors(colors)
    setHasUnpublishedChanges(true)
  }, [])

  // Abort streaming on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  // Build streaming preview HTML
  const streamingHtml = isGenerating && streamingSections.length > 0
    ? buildPreviewHtml(streamingSections, theme)
    : null

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white min-h-[3.25rem]">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dash/website"
            className="text-gray-500 hover:text-gray-700 text-sm shrink-0"
          >
            &larr; Volver
          </Link>
          <h1 className="text-base font-semibold text-gray-900 truncate">
            Editor IA
          </h1>
          {hasExistingSections && (
            isSaving ? (
              <span className="text-xs text-gray-500 shrink-0">Guardando...</span>
            ) : !org.landingPublished && !hasUnpublishedChanges ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full shrink-0">Borrador</span>
            ) : hasUnpublishedChanges ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full shrink-0">Cambios sin publicar</span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full shrink-0 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Publicada
              </span>
            )
          )}
          {isRefining && (
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full shrink-0 animate-pulse">
              Refinando...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isGenerating && (
            <button
              type="button"
              onClick={() => { abortRef.current?.abort(); setIsGenerating(false) }}
              className="px-2.5 py-1 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              Detener
            </button>
          )}
          {hasExistingSections && (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || isLoading || usage.genUsed >= usage.genLimit}
                className="px-2.5 py-1 text-sm border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 inline-flex items-center gap-1.5"
                title={usage.genUsed >= usage.genLimit ? "Limite de generaciones alcanzado este mes" : `${usage.genLimit - usage.genUsed} generaciones restantes`}
              >
                {isGenerating ? "Regenerando..." : "Regenerar"}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${usage.genUsed >= usage.genLimit ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}>
                  {usage.genLimit - usage.genUsed}/{usage.genLimit}
                </span>
              </button>
              {org.landingPublished && (
                <a
                  href={getOrgPublicUrl(org.slug!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Ver
                </a>
              )}
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving || (!hasUnpublishedChanges && org.landingPublished)}
                className={`px-3 py-1 text-sm rounded-lg disabled:opacity-50 ${
                  !hasUnpublishedChanges && org.landingPublished
                    ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                    : "bg-brand_blue text-white hover:bg-blue-700"
                }`}
              >
                {isSaving && pendingSaveRef.current?.publish
                  ? "Publicando..."
                  : !org.landingPublished
                    ? "Publicar"
                    : hasUnpublishedChanges
                      ? "Publicar cambios"
                      : "Publicada"}
              </button>
            </>
          )}
          {hasExistingSections && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${usage.refineUsed >= usage.refineLimit ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`} title="Refinamientos restantes este mes">
              Refine {usage.refineLimit - usage.refineUsed}/{usage.refineLimit}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {showEditor ? (
          /* GrapesJS Editor */
          <GrapesEditor
            ref={editorRef}
            initialHtml={sectionsToHtml(sections)}
            theme={theme}
            customColors={customColors}
            onChange={handleEditorChange}
            onAiAction={handleAiAction}
            onThemeChange={handleThemeChange}
            panelSide="left"
          />
        ) : isGenerating ? (
          /* Streaming preview during generation */
          <div className="h-full flex flex-col">
            {streamingHtml ? (
              <div className="flex-1 overflow-auto bg-white">
                <iframe
                  srcDoc={streamingHtml}
                  className="w-full h-full border-none"
                  title="Preview"
                />
                <div ref={streamEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="flex flex-col items-center gap-6 animate-fade-in">
                  <img
                    src="/images/Rocket.gif"
                    alt="Generando"
                    className="w-32 h-32 object-contain"
                  />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-600">
                      Generando tu landing page...
                    </p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">
                      La IA esta disenando secciones con tus servicios y datos de negocio.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 py-3 px-6 border-t border-gray-200 bg-white">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm font-bold text-gray-500">
                Seccion {streamCount + 1} de ~8...
              </p>
              <button
                type="button"
                onClick={() => { abortRef.current?.abort(); setIsGenerating(false) }}
                className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Detener
              </button>
            </div>
          </div>
        ) : (
          /* Empty state — no sections yet */
          <div className="flex items-center justify-center h-full">
            <div className="p-6 text-center max-w-sm">
              <div className="text-6xl mb-4">&#10024;</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Genera tu landing con IA
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                Usaremos los datos de tu negocio:
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>Nombre: <strong>{org.name}</strong></li>
                {org.businessType && <li>Tipo: {org.businessType}</li>}
                <li>{serviceCount} servicios activos</li>
              </ul>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || isLoading || usage.genUsed >= usage.genLimit}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
              >
                {isGenerating ? "Generando..." : "Generar landing"}
                <span className="ml-2 text-xs opacity-80">({usage.genLimit - usage.genUsed}/{usage.genLimit})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {saveMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {saveMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-red-600 text-white rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
