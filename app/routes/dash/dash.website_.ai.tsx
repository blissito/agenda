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
import { GrapesEditor, LANDING_BLOCKS, type GrapesEditorHandle, type AiAction } from "@easybits.cloud/html-tailwind-generator/components4"
import { DeviceToggle } from "~/components/dash/website/DeviceToggle"
import { EditorRightSidebar } from "~/components/dash/website/EditorRightSidebar"
import type { Route } from "./+types/dash.website_.ai"

// Remap block categories: "Básicos" for basic elements, section categories for compound sections
const CATEGORY_MAP: Record<string, string> = {
  Basic: "Básicos",
  Layout: "Básicos",
  Heroes: "Heroes",
  Features: "Services",
  "Social Proof": "Social Proof",
  Pricing: "Pricing",
  Content: "Content",
  CTA: "CTA",
  Footer: "Footer",
}

const LABEL_MAP: Record<string, string> = {
  Text: "Texto",
  Heading: "Título",
  Image: "Imagen",
  Button: "Botón",
  Container: "Contenedor",
  "2 Columns": "2 Columnas",
  "3 Columns": "3 Columnas",
  Spacer: "Espaciador",
}

const customBlocks = LANDING_BLOCKS.map((block) => ({
  ...block,
  label: LABEL_MAP[block.label] ?? block.label,
  category: CATEGORY_MAP[block.category] ?? block.category,
}))

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
  const [themeVersion, setThemeVersion] = useState(0)
  const [activeDevice, setActiveDevice] = useState<"Desktop" | "Tablet" | "Mobile">("Desktop")
  const [editorInstance, setEditorInstance] = useState<ReturnType<GrapesEditorHandle["getEditor"]>>(null)

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
        const msg = "Sitio web actualizado"
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

  // Theme change from sidebar
  const handleThemeChange = useCallback((themeId: string, colors?: Record<string, string>) => {
    setTheme(themeId)
    if (colors) setCustomColors(colors)
    setThemeVersion((v) => v + 1)
    setHasUnpublishedChanges(true)
  }, [])

  // Device switching
  const handleDeviceChange = useCallback((device: "Desktop" | "Tablet" | "Mobile") => {
    setActiveDevice(device)
    const editor = editorRef.current?.getEditor()
    if (editor) editor.setDevice(device)
  }, [])

  // Capture GrapesJS editor instance after mount
  useEffect(() => {
    if (showEditor && editorRef.current && !editorInstance) {
      // Small delay to let GrapesEditor initialize
      const timer = setTimeout(() => {
        const ed = editorRef.current?.getEditor() ?? null
        setEditorInstance(ed)
        // Collapse all block categories except the first (Básicos)
        if (ed) {
          const cats = ed.BlockManager.getCategories()
          cats.each((cat: { get: (k: string) => unknown; set: (k: string, v: unknown) => void }, i: number) => {
            if (i > 0) cat.set("open", false)
          })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
    if (!showEditor && editorInstance) {
      setEditorInstance(null)
    }
  }, [showEditor, editorInstance])

  // Abort streaming on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  // Build streaming preview HTML
  const streamingHtml = isGenerating && streamingSections.length > 0
    ? buildPreviewHtml(streamingSections, theme)
    : null

  return (
    <div className="flex flex-col h-screen bg-brand_dark">
      {/* Block manager overrides (correct class: gjs-block__media) */}
      <style>{`
.gjs-blocks-c .gjs-block.gjs-block {
  background: transparent !important;
  border: none !important;
  border-radius: 6px !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  text-align: left !important;
  gap: 10px !important;
  padding: 2px 10px !important;
  margin: 0 !important;
  width: 100% !important;
  min-height: 28px !important;
  height: auto !important;
  box-shadow: none !important;
}
.gjs-blocks-c .gjs-block.gjs-block:hover { background: rgba(255,255,255,0.06) !important; }
.gjs-block .gjs-block__media {
  width: 24px !important; height: 24px !important;
  min-width: 24px !important; max-width: 24px !important;
  min-height: 24px !important; max-height: 24px !important;
  background: #2D2D2D !important;
  border-radius: 5px !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  padding: 4px !important; flex-shrink: 0 !important;
}
.gjs-block .gjs-block__media { margin: 0 !important; }
.gjs-block .gjs-block__media svg { width: 14px !important; height: 14px !important; display: block !important; fill: #9ca3af !important; stroke: #9ca3af !important; }
.gjs-blocks-c .gjs-block .gjs-block-label { font-size: 14px !important; font-weight: 400 !important; text-align: left !important; padding: 0 !important; flex: 1 !important; line-height: 24px !important; font-family: "Satoshi ", sans-serif !important; }
.gjs-block-category:first-child .gjs-blocks-c { display: flex !important; flex-direction: column !important; flex-wrap: nowrap !important; gap: 12px !important; padding: 2px 0 !important; }
.gjs-blocks-c { flex-direction: column !important; flex-wrap: nowrap !important; gap: 8px !important; padding: 4px 0 !important; }
.gjs-blocks-c[style*="none"] { display: none !important; }
.gjs-editor, .gjs-editor-cont, .gjs-cv-canvas { background: white !important; }
.gjs-editor-cont + .absolute { background: transparent !important; }
.w-60.shrink-0.bg-black { background-color: #11151A !important; }
.w-60 > div:first-child { gap: 0 !important; padding: 12px !important; border: none !important; display: flex !important; }
.w-60 > div:first-child button { flex: none !important; padding: 8px 16px !important; border-radius: 9999px !important; font-size: 14px !important; border: none !important; background: transparent !important; }
.w-60 > div:first-child button.text-white { background-color: #2A2B31 !important; }
.gjs-cv-canvas { background: white !important; top: 32px !important; left: 32px !important; width: calc(100% - 64px) !important; height: calc(100% - 64px) !important; }
.w-72 span.inline-flex, .w-72 button.inline-flex { border: none !important; background: #2A2B31 !important; color: white !important; outline: none !important; }
.w-72 span.inline-flex:hover, .w-72 button.inline-flex:hover { background: #363740 !important; }
.w-72 p.uppercase { color: #9ca3af !important; }
.w-72 p.text-gray-600 { color: #9ca3af !important; }
.w-72 code { color: white !important; }
.w-72 input, .w-72 select, .w-72 button { outline: none !important; box-shadow: none !important; }
.w-72 input { background-color: #2A2B31 !important; }
.w-72 input, .w-72 .border, .w-72 .border-gray-600 { border-color: transparent !important; }
.w-72 input:focus { border-color: transparent !important; }
.w-72 .px-3 { padding-left: 16px !important; padding-right: 16px !important; }
.w-72 .p-3 { padding: 16px !important; }
.gjs-block-category { background: transparent !important; border: none !important; }
.gjs-block-categories { background: transparent !important; }
.gjs-block-category:first-child .gjs-title { background: transparent !important; color: #9ca3af !important; font-size: 11px !important; font-weight: 600 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; padding: 6px 10px 6px !important; border: none !important; pointer-events: none !important; font-family: "Medium Font ", sans-serif !important; }
.gjs-block-category:first-child .gjs-caret-icon { display: none !important; }
.gjs-block-category:first-child .gjs-blocks-c { display: flex !important; }
.gjs-block-category:not(:first-child) .gjs-title { background: transparent !important; color: #e5e7eb !important; font-size: 14px !important; font-weight: 500 !important; padding: 8px 10px !important; border: none !important; display: flex !important; align-items: center !important; gap: 10px !important; font-family: "Medium Font ", sans-serif !important; }
.gjs-block-category:not(:first-child) .gjs-title:hover { background: rgba(255,255,255,0.04) !important; }
.gjs-block-category:not(:first-child) .gjs-caret-icon { color: #6b7280 !important; margin-left: auto !important; }
.gjs-block-category:nth-child(2)::before { content: 'Secciones'; display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; padding: 18px 10px 6px; font-family: "Medium Font ", sans-serif; }
.gjs-block-category:not(:first-child) .gjs-title::before { content: ''; display: inline-block; width: 24px; height: 24px; min-width: 24px; border-radius: 5px; }
.gjs-block-category:nth-child(2) .gjs-title::before { background: #f472b6; }
.gjs-block-category:nth-child(3) .gjs-title::before { background: #fb923c; }
.gjs-block-category:nth-child(4) .gjs-title::before { background: #f87171; }
.gjs-block-category:nth-child(5) .gjs-title::before { background: #facc15; }
.gjs-block-category:nth-child(6) .gjs-title::before { background: #4ade80; }
.gjs-block-category:nth-child(7) .gjs-title::before { background: #60a5fa; }
.gjs-block-category:nth-child(8) .gjs-title::before { background: #c084fc; }
.gjs-block-category:nth-child(9) .gjs-title::before { background: #a8a29e; }
.gjs-block-category:not(:first-child) .gjs-title { justify-content: flex-start !important; }
.gjs-block-category:not(:first-child) .gjs-caret-icon { order: 99 !important; margin-left: auto !important; }
.gjs-block-category:not(:first-child) .gjs-block::after { display: none !important; }
      `}</style>
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-2.5 border-b border-gray-700 bg-brand_dark min-h-[3.25rem]">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 text-sm">
          <Link to="/dash/website" className="text-gray-400 hover:text-white transition-colors">
            Sitio web
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18L15 12L9 6" />
          </svg>
          <span className="text-white font-medium">Editor IA</span>
          {hasExistingSections && (
            isSaving ? (
              <span className="text-xs text-gray-500 shrink-0">Guardando...</span>
            ) : isRefining ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full shrink-0 animate-pulse">Refinando...</span>
            ) : hasUnpublishedChanges ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-300 rounded-full shrink-0">Sin publicar</span>
            ) : org.landingPublished ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-300 rounded-full shrink-0 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Publicada
              </span>
            ) : null
          )}
        </div>

        {/* Center: Device toggle */}
        {showEditor && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <DeviceToggle activeDevice={activeDevice} onDeviceChange={handleDeviceChange} />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isGenerating && (
            <button
              type="button"
              onClick={() => { abortRef.current?.abort(); setIsGenerating(false) }}
              className="px-2.5 py-1 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10"
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
                className="px-2.5 py-1 text-sm border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/10 disabled:opacity-50 inline-flex items-center gap-1.5"
                title={usage.genUsed >= usage.genLimit ? "Limite de generaciones alcanzado" : `${usage.genLimit - usage.genUsed} restantes`}
              >
                {isGenerating ? "Regenerando..." : "Regenerar"}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${usage.genUsed >= usage.genLimit ? "bg-red-500/20 text-red-300" : "bg-purple-500/20 text-purple-300"}`}>
                  {usage.genLimit - usage.genUsed}/{usage.genLimit}
                </span>
              </button>
              {org.landingPublished && (
                <a
                  href={getOrgPublicUrl(org.slug!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 inline-flex items-center gap-1"
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
                disabled={isSaving}
                className="px-3 py-1 text-sm rounded-lg disabled:opacity-50 bg-brand_blue text-white hover:bg-blue-700"
              >
                {isSaving && pendingSaveRef.current?.publish
                  ? "Publicando..."
                  : !org.landingPublished
                    ? "Publicar"
                    : "Publicar cambios"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {showEditor ? (
          /* GrapesJS Editor with right sidebar */
          <div className="flex h-full">
            <div className="flex-1 overflow-hidden">
              <GrapesEditor
                ref={editorRef}
                initialHtml={sectionsToHtml(sections)}
                theme={theme}
                customColors={customColors}
                onChange={handleEditorChange}
                onAiAction={handleAiAction}
                onThemeChange={handleThemeChange}
                hiddenTabs={["styles", "themes"]}
                panelSide="left"
                blocks={customBlocks}
              />
            </div>
            <EditorRightSidebar
              editor={editorInstance}
              theme={theme}
              customColors={customColors}
              onThemeChange={handleThemeChange}
              themeVersion={themeVersion}
            />
          </div>
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
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="px-5 py-3 bg-white text-brand_dark rounded-full shadow-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap pointer-events-auto">
          <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          {saveMessage}
          </div>
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
