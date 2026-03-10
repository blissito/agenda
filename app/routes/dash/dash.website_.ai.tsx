import { useCallback, useEffect, useRef, useState } from "react"
import { useFetcher, useLoaderData, Link, useRouteLoaderData } from "react-router"
import { getOrgPublicUrl } from "~/utils/urls"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import {
  Canvas,
  SectionList,
  FloatingToolbar,
  CodeEditor,
  ViewportToggle,
  LANDING_THEMES,
  type CanvasHandle,
  type Section3,
  type IframeMessage,
  type Viewport,
} from "@easybits.cloud/html-tailwind-generator"
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
      landingPublished: true,
    },
  })
  if (!org) throw new Response("Org not found", { status: 404 })

  const serviceCount = await db.service.count({
    where: { orgId: org.id, isActive: true, archived: false },
  })

  return { org, serviceCount }
}

export default function WebsiteAI({ loaderData }: Route.ComponentProps) {
  const { org, serviceCount } = loaderData
  const fetcher = useFetcher()
  const canvasRef = useRef<CanvasHandle>(null)
  const iframeRectRef = useRef<DOMRect | null>(null)

  // State
  const [sections, setSections] = useState<Section3[]>(
    (org.landingSections as Section3[] | null) || [],
  )
  const [theme, setTheme] = useState(org.landingTheme || "default")
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selection, setSelection] = useState<IframeMessage | null>(null)
  const [codeEditorSection, setCodeEditorSection] = useState<Section3 | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport>("desktop")

  const isLoading = fetcher.state !== "idle"
  const hasExistingSections = sections.length > 0
  const abortRef = useRef<AbortController | null>(null)
  const isSavingRef = useRef(false)
  const streamEndRef = useRef<HTMLDivElement>(null)
  const [streamCount, setStreamCount] = useState(0)

  // Keep refs in sync
  isSavingRef.current = isSaving

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
    setStreamCount(0)

    try {
      const formData = new FormData()
      formData.append("intent", "generate")

      const res = await fetch("/api/landing-generator", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      if (!res.ok) throw new Error("Generation failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let buf = ""
      let eventType = ""

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
                setSections((prev) => [...prev, data])
                setStreamCount((c) => c + 1)
                requestAnimationFrame(() => {
                  streamEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
                })
              } else if (eventType === "section-update") {
                setSections((prev) =>
                  prev.map((s) => (s.id === data.id ? { ...s, html: data.html } : s)),
                )
              } else if (eventType === "done") {
                // generation complete
              } else if (eventType === "error") {
                setErrorMessage(data.message)
              }
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      const message = err instanceof Error ? err.message : "Error al generar"
      setErrorMessage(message)
      setSections((current) => current.length > 0 ? current : backup)
    } finally {
      if (abortRef.current === controller) {
        setIsGenerating(false)
      }
    }
  }, [])

  // Handle fetcher responses (refine + save)
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
      }
      setIsSaving(false)
      pendingSaveRef.current = null
    }
  }, [fetcher.state, fetcher.data])

  // Refine section (streaming SSE)
  const handleRefine = useCallback(
    async (instruction: string, referenceImage?: string) => {
      if (!selectedSectionId) return
      const section = sections.find((s) => s.id === selectedSectionId)
      if (!section) return
      const sectionId = selectedSectionId

      setIsRefining(true)
      setErrorMessage(null)

      try {
        const formData = new FormData()
        formData.append("intent", "refine")
        formData.append("currentHtml", section.html)
        formData.append("instruction", instruction)
        if (referenceImage) formData.append("referenceImage", referenceImage)

        const res = await fetch("/api/landing-generator", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) throw new Error("Refine failed")

        const reader = res.body?.getReader()
        if (!reader) throw new Error("No stream")

        const decoder = new TextDecoder()
        let buf = ""
        let eventType = ""

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
                if ((eventType === "chunk" || eventType === "done") && data.html) {
                  setSections((prev) =>
                    prev.map((s) => (s.id === sectionId ? { ...s, html: data.html } : s))
                  )
                } else if (eventType === "error") {
                  setErrorMessage(data.message)
                }
              } catch {}
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al refinar"
        setErrorMessage(message)
      } finally {
        setIsRefining(false)
      }
    },
    [selectedSectionId, sections],
  )

  // Save/Publish
  const pendingSaveRef = useRef<{ publish: boolean } | null>(null)
  const handleSave = useCallback(
    (publish: boolean) => {
      setIsSaving(true)
      setSaveMessage(null)
      setErrorMessage(null)
      pendingSaveRef.current = { publish }
      fetcher.submit(
        {
          intent: "save",
          sections: JSON.stringify(sections),
          theme,
          publish: publish ? "true" : "false",
        },
        { method: "post", action: "/api/landing-generator" },
      )
    },
    [sections, theme, fetcher],
  )


  // Section operations
  const handleReorder = useCallback((from: number, to: number) => {
    setSections((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next.map((s, i) => ({ ...s, order: i }))
    })
  }, [])

  const handleDelete = useCallback(
    (id?: string) => {
      const targetId = id || selectedSectionId
      if (!targetId) return
      setSections((prev) => prev.filter((s) => s.id !== targetId))
      if (selectedSectionId === targetId) {
        setSelectedSectionId(null)
        setSelection(null)
      }
    },
    [selectedSectionId],
  )

  const handleRename = useCallback((id: string, label: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)))
  }, [])

  const handleCodeSave = useCallback(
    (code: string) => {
      if (!codeEditorSection) return
      setSections((prev) =>
        prev.map((s) => (s.id === codeEditorSection.id ? { ...s, html: code } : s)),
      )
      setCodeEditorSection(null)
    },
    [codeEditorSection],
  )

  const handleIframeMessage = useCallback(
    (msg: IframeMessage) => {
      if (msg.type === "element-selected" && msg.sectionId) {
        setSelectedSectionId(msg.sectionId)
        setSelection(msg)
      } else if (msg.type === "element-deselected") {
        setSelection(null)
      } else if (msg.type === "text-edited" && msg.sectionId && msg.newText !== undefined) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === msg.sectionId ? { ...s, html: msg.sectionHtml || s.html } : s,
          ),
        )
      } else if (msg.type === "section-html-updated" && msg.sectionId && msg.sectionHtml) {
        const html = msg.sectionHtml;
        setSections((prev) =>
          prev.map((s) =>
            s.id === msg.sectionId ? { ...s, html } : s,
          ),
        )
      }
    },
    [],
  )

  const handleUpdateAttribute = useCallback(
    (sectionId: string, elementPath: string, attr: string, value: string) => {
      canvasRef.current?.postMessage({
        action: "update-attribute",
        sectionId,
        elementPath,
        tagName: selection?.tagName || "*",
        attr,
        value,
      })
    },
    [selection?.tagName],
  )

  const handleMoveUp = useCallback(() => {
    if (!selectedSectionId) return
    const idx = sections.findIndex((s) => s.id === selectedSectionId)
    if (idx > 0) handleReorder(idx, idx - 1)
  }, [selectedSectionId, sections, handleReorder])

  const handleMoveDown = useCallback(() => {
    if (!selectedSectionId) return
    const idx = sections.findIndex((s) => s.id === selectedSectionId)
    if (idx < sections.length - 1) handleReorder(idx, idx + 1)
  }, [selectedSectionId, sections, handleReorder])

  // Abort streaming on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  // ESC to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (codeEditorSection) {
          setCodeEditorSection(null)
        } else if (selection) {
          setSelection(null)
          setSelectedSectionId(null)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [codeEditorSection, selection])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Link
            to="/dash/website"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            &larr; Volver
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            Editor AI — {org.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {errorMessage && (
            <span className="text-sm text-red-600 font-medium">{errorMessage}</span>
          )}
          {saveMessage && (
            <span className="text-sm text-green-600 font-medium">{saveMessage}</span>
          )}
          {isGenerating && (
            <button
              type="button"
              onClick={() => { abortRef.current?.abort(); setIsGenerating(false) }}
              className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              Detener
            </button>
          )}
          {hasExistingSections && (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || isLoading}
                className="px-3 py-1.5 text-sm border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50"
              >
                {isGenerating ? "Regenerando..." : "Regenerar"}
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isSaving && !pendingSaveRef.current?.publish ? "Guardando..." : "Guardar borrador"}
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm bg-brand_blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving && pendingSaveRef.current?.publish ? "Publicando..." : "Publicar"}
              </button>
              {org.landingPublished && (
                <a
                  href={getOrgPublicUrl(org.slug!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Ver
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          {hasExistingSections ? (<>
            <SectionList
              sections={sections}
              selectedSectionId={selectedSectionId}
              theme={theme}
              onThemeChange={setTheme}
              onSelect={(id) => {
                setSelectedSectionId(id)
                canvasRef.current?.scrollToSection(id)
              }}
              onOpenCode={(id) => {
                const s = sections.find((sec) => sec.id === id)
                if (s) setCodeEditorSection(s)
              }}
              onReorder={handleReorder}
              onDelete={handleDelete}
              onRename={handleRename}
              onAdd={() => {
                const newSection: Section3 = {
                  id: crypto.randomUUID().slice(0, 8),
                  order: sections.length,
                  html: '<section class="bg-surface py-24 px-8 text-center"><h2 class="text-3xl font-bold text-on-surface">Nueva sección</h2><p class="text-on-surface-muted mt-4">Edita esta sección o usa AI para refinarla</p></section>',
                  label: "Nueva sección",
                }
                setSections((prev) => [...prev, newSection])
              }}
            />
          {isGenerating && (
            <div className="flex items-center gap-3 py-4 px-6 border-t border-gray-200">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm font-bold text-gray-500">
                Sección {streamCount + 1} de ~8...
              </p>
              <button
                type="button"
                onClick={() => { abortRef.current?.abort(); setIsGenerating(false) }}
                className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Detener
              </button>
            </div>
          )}
          </>) : (
            <div className="p-6 text-center">
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
                disabled={isGenerating || isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
              >
                {isGenerating ? "Generando..." : "Generar landing"}
              </button>
              {isGenerating && (
                <button
                  type="button"
                  onClick={() => { abortRef.current?.abort(); setIsGenerating(false) }}
                  className="w-full px-4 py-2 mt-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 text-sm font-medium"
                >
                  Detener
                </button>
              )}
            </div>
          )}

        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
          {sections.length > 0 && (
            <ViewportToggle value={viewport} onChange={setViewport} />
          )}
          {sections.length > 0 ? (
            <div className={`flex-1 overflow-auto relative ${viewport !== "desktop" ? "flex justify-center" : ""}`}>
              <div
                className={`transition-all duration-300 h-full ${viewport !== "desktop" ? "shrink-0" : ""}`}
                style={{ width: viewport === "tablet" ? 768 : viewport === "mobile" ? 375 : "100%" }}
              >
              <Canvas
                ref={canvasRef}
                sections={sections}
                theme={theme}
                onMessage={handleIframeMessage}
                iframeRectRef={iframeRectRef}
              />
              <div ref={streamEndRef} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {isGenerating ? (
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
                      La IA está diseñando secciones con tus servicios y datos de negocio.
                    </p>
                    {streamCount > 0 && (
                      <p className="text-sm text-purple-500 mt-2 font-medium">
                        Sección {streamCount} generada...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              ) : (
                <p className="text-lg">Genera una landing para ver la preview</p>
              )}
            </div>
          )}

          {/* Floating toolbar */}
          {selection && selectedSectionId && (
            <FloatingToolbar
              selection={selection}
              iframeRect={iframeRectRef.current}
              onRefine={handleRefine}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDelete={() => handleDelete()}
              onClose={() => {
                setSelection(null)
                setSelectedSectionId(null)
              }}
              onUpdateAttribute={handleUpdateAttribute}
              onViewCode={() => {
                const s = sections.find((sec) => sec.id === selectedSectionId)
                if (s) setCodeEditorSection(s)
              }}
              isRefining={isRefining}
            />
          )}
        </div>
      </div>

      {/* Code editor modal */}
      {codeEditorSection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <CodeEditor
              code={codeEditorSection.html}
              label={codeEditorSection.label}
              onSave={handleCodeSave}
              onClose={() => setCodeEditorSection(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
