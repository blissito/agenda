import {
  buildPreviewHtml,
  grapesToSections,
  type Section3,
} from "@easybits.cloud/html-tailwind-generator"
import {
  type AiAction,
  GrapesEditor,
  type GrapesEditorHandle,
  LANDING_BLOCKS,
} from "@easybits.cloud/html-tailwind-generator/components4"
import { useCallback, useEffect, useRef, useState } from "react"
import { HiSparkles } from "react-icons/hi"
import { Link, useFetcher } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { DeviceToggle } from "~/components/dash/website/DeviceToggle"
import { EditorRightSidebar } from "~/components/dash/website/EditorRightSidebar"
import { buildDefaultSections } from "~/lib/default-landing"
import { getLandingUsage } from "~/lib/landing-generator.server"
import { db } from "~/utils/db.server"
import { getOrgPublicUrl } from "~/utils/urls"
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
      logo: true,
      email: true,
      address: true,
      social: true,
      landingSections: true,
      landingTheme: true,
      landingCustomColors: true,
      landingPublished: true,
      landingChatbotEnabled: true,
      chatbotAgentId: true,
    },
  })
  if (!org) throw new Response("Org not found", { status: 404 })

  const services = await db.service.findMany({
    where: { orgId: org.id, isActive: true, archived: false },
    select: {
      id: true,
      name: true,
      slug: true,
      duration: true,
      price: true,
      gallery: true,
    },
    take: 12,
  })

  const usage = await getLandingUsage(org.id)
  return { org, serviceCount: services.length, services, usage }
}

/** Convert Section3[] to a single HTML string for GrapesEditor */
function sectionsToHtml(sections: Section3[]): string {
  return sections
    .filter((s) => s.id !== "__grapes_css__")
    .sort((a, b) => a.order - b.order)
    .map((s) => s.html)
    .join("\n")
}

/** Always-present canvas styles: Satoshi font for branding etc. */
const BASE_CANVAS_STYLES = `@font-face{font-family:'Satoshi ';src:url('https://denik.me/fonts/Satoshi-Regular.ttf') format('truetype');font-display:swap}`

/** Extract the persisted GrapesJS CSS rules so they can be re-injected on load. */
function sectionsToCanvasStyles(sections: Section3[]): string {
  const cssSection = sections.find((s) => s.id === "__grapes_css__")
  const persisted = cssSection?.html
    ? cssSection.html.replace(/<\/?style[^>]*>/gi, "")
    : ""
  return `${BASE_CANVAS_STYLES}\n${persisted}`
}

export default function WebsiteAI({ loaderData }: Route.ComponentProps) {
  const { org, serviceCount, services, usage: initialUsage } = loaderData
  const [usage, setUsage] = useState(initialUsage)
  const fetcher = useFetcher()
  const editorRef = useRef<GrapesEditorHandle>(null)

  // State — pre-load default template if no saved sections
  const [sections, setSections] = useState<Section3[]>(() => {
    const saved = org.landingSections as Section3[] | null
    if (saved && saved.length > 0) return saved
    return buildDefaultSections(org as any, services)
  })
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
  const [isPublished, setIsPublished] = useState(org.landingPublished ?? false)
  const [chatbotEnabled, setChatbotEnabled] = useState(
    org.landingChatbotEnabled ?? true,
  )
  // During generation, we stream sections into a lightweight preview
  const [streamingSections, setStreamingSections] = useState<Section3[]>([])
  const [streamCount, setStreamCount] = useState(0)
  const [themeVersion, setThemeVersion] = useState(0)
  const [activeDevice, setActiveDevice] = useState<
    "Desktop" | "Tablet" | "Mobile"
  >("Desktop")
  const [editorInstance, setEditorInstance] =
    useState<ReturnType<GrapesEditorHandle["getEditor"]>>(null)

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
            prev.map((s) =>
              updates.has(s.id) ? { ...s, html: updates.get(s.id)! } : s,
            ),
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
                  streamEndRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                  })
                })
              } else if (eventType === "section-update") {
                pendingUpdates.set(data.id, data.html)
                if (!genRafId) genRafId = requestAnimationFrame(flushGenUpdates)
              } else if (eventType === "done") {
                setUsage((u) => ({ ...u, genUsed: u.genUsed + 1 }))
              } else if (eventType === "error") {
                setErrorMessage(data.message)
              }
            } catch {
              /* skip malformed */
            }
          }
        }
      }
      // Flush remaining updates
      if (genRafId) cancelAnimationFrame(genRafId)
      if (pendingUpdates.size > 0) {
        const updates = new Map(pendingUpdates)
        pendingUpdates.clear()
        setStreamingSections((prev) =>
          prev.map((s) =>
            updates.has(s.id) ? { ...s, html: updates.get(s.id)! } : s,
          ),
        )
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      const message = err instanceof Error ? err.message : "Error al generar"
      setErrorMessage(message)
      setSections((current) => (current.length > 0 ? current : backup))
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
    if (
      fetcher.state !== "idle" ||
      !fetcher.data ||
      fetcher.data === lastFetcherDataRef.current
    )
      return
    lastFetcherDataRef.current = fetcher.data
    const data = fetcher.data as { ok?: boolean; error?: string }

    if (isSavingRef.current && pendingSaveRef.current) {
      if (data.error) {
        setErrorMessage(data.error)
      } else if (data.ok) {
        const msg = "Sitio web actualizado"
        setSaveMessage(msg)
        setTimeout(() => setSaveMessage(null), 3000)
        if (pendingSaveRef.current.publish) {
          setHasUnpublishedChanges(false)
          setIsPublished(true)
        }
      }
      setIsSaving(false)
      pendingSaveRef.current = null
    } else if (isSavingRef.current) {
      // Unexpected response shape — reset saving state
      setIsSaving(false)
      pendingSaveRef.current = null
    }
  }, [fetcher.state, fetcher.data])

  // AI refine modal state
  const [refineModal, setRefineModal] = useState<{
    open: boolean
    action: AiAction | null
  }>({
    open: false,
    action: null,
  })
  const [refineInstruction, setRefineInstruction] = useState("")

  // AI refine handler (called from GrapesEditor toolbar) — opens custom modal instead of native prompt.
  const handleAiAction = useCallback((action: AiAction) => {
    if (action.type !== "refine-element") return
    setRefineInstruction("")
    setRefineModal({ open: true, action })
  }, [])

  const closeRefineModal = useCallback(() => {
    setRefineModal({ open: false, action: null })
    setRefineInstruction("")
  }, [])

  const runRefine = useCallback(
    async (action: AiAction, instruction: string) => {
      if (action.type !== "refine-element") return
      setIsRefining(true)
      setErrorMessage(null)

      try {
        const formData = new FormData()
        formData.append("intent", "refine")
        formData.append(
          "currentHtml",
          action.isSection ? action.html : action.sectionHtml || action.html,
        )
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
            editorRef.current.replaceComponent(
              action.sectionComponentId,
              finalHtml,
            )
          }
          setHasUnpublishedChanges(true)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al refinar"
        setErrorMessage(message)
      } finally {
        setIsRefining(false)
      }
    },
    [],
  )

  const handleRefineConfirm = useCallback(() => {
    const action = refineModal.action
    const instruction = refineInstruction.trim()
    if (!action || !instruction) return
    closeRefineModal()
    runRefine(action, instruction)
  }, [refineModal.action, refineInstruction, closeRefineModal, runRefine])

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

      if (currentSections.length === 0 && sections.length > 0) {
        setErrorMessage("Error al procesar secciones. Intenta de nuevo.")
        return
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
          chatbotEnabled: chatbotEnabled ? "true" : "false",
        },
        { method: "post", action: "/api/landing-generator" },
      )
    },
    [sections, theme, customColors, chatbotEnabled, fetcher],
  )

  // GrapesEditor onChange — sync sections state, preserving __grapes_css__ if lost.
  const handleEditorChange = useCallback((html: string) => {
    const newSections = grapesToSections(html)
    setSections((prev) => {
      const newHasCss = newSections.some((s) => s.id === "__grapes_css__")
      if (newHasCss) return newSections
      const prevCss = prev.find((s) => s.id === "__grapes_css__")
      return prevCss ? [prevCss, ...newSections] : newSections
    })
    setHasUnpublishedChanges(true)
  }, [])

  // Theme change from sidebar
  const handleThemeChange = useCallback(
    (themeId: string, colors?: Record<string, string>) => {
      setTheme(themeId)
      if (colors) setCustomColors(colors)
      setThemeVersion((v) => v + 1)
      setHasUnpublishedChanges(true)
    },
    [],
  )

  // Device switching
  const handleDeviceChange = useCallback(
    (device: "Desktop" | "Tablet" | "Mobile") => {
      setActiveDevice(device)
      const editor = editorRef.current?.getEditor()
      if (editor) editor.setDevice(device)
    },
    [],
  )

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
          cats.each(
            (
              cat: {
                get: (k: string) => unknown
                set: (k: string, v: unknown) => void
              },
              i: number,
            ) => {
              if (i > 0) cat.set("open", false)
            },
          )
          // Inject the persisted __grapes_css__ rules into the editor's CSS manager
          // so they survive editor.getCss()/save round-trips.
          const persistedCss = sectionsToCanvasStyles(sections)
            .replace(BASE_CANVAS_STYLES, "")
            .trim()
          if (persistedCss && ed.Css?.addRules) {
            try {
              ed.Css.addRules(persistedCss)
            } catch (e) {
              console.warn("addRules failed", e)
            }
          }
          // Ensure the "Powered by Denik" branding section exists and is locked
          const logoOrigin =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1")
              ? window.location.origin
              : "https://denik.me"
          const BRANDING_HTML = `<div data-denik-branding="true" data-gjs-removable="false" data-gjs-copyable="false" data-gjs-draggable="false" data-gjs-editable="false" class="w-full flex items-center justify-center gap-1 py-1"><span data-gjs-removable="false" data-gjs-editable="false" style="font-family:'Satoshi ',system-ui,sans-serif;color:#5158F6;font-size:14px">Powered by</span><img alt="Denik" src="${logoOrigin}/images/denik-logo.svg" data-gjs-removable="false" data-gjs-editable="false" data-gjs-resizable="false" style="height:32px;width:auto;display:inline-block;margin-left:4px"/></div>`
          let ensuringBranding = false
          const ensureBranding = () => {
            if (ensuringBranding) return
            ensuringBranding = true
            try {
              const wrapper = ed.DomComponents.getWrapper()
              if (!wrapper) return
              const allComps = wrapper.find(
                "[data-denik-branding], section, footer, div",
              )
              const matches = allComps.filter((comp: any) => {
                if (comp.getAttributes()?.["data-denik-branding"] === "true")
                  return true
                const html = comp.toHTML()
                return (
                  html.includes("Powered by") &&
                  html.includes("Denik") &&
                  html.length < 600
                )
              })
              // Dedupe: keep the first match, remove any extras.
              const existing = matches[0]
              if (matches.length > 1) {
                for (let i = 1; i < matches.length; i++) {
                  try {
                    matches[i].remove()
                  } catch {
                    /* noop */
                  }
                }
              }
              // If existing branding doesn't contain the Denik logo image, replace it.
              if (existing && !existing.toHTML().includes('alt="Denik"')) {
                const parent = existing.parent()
                const idx = existing.index()
                existing.remove()
                if (parent) parent.append(BRANDING_HTML, { at: idx })
                else
                  wrapper.append(BRANDING_HTML, {
                    at: wrapper.components().length,
                  })
                return ensureBranding()
              }
              // Fix logo src in case the saved/default HTML points to a stale URL
              if (existing) {
                existing.find("img").forEach((img: any) => {
                  if (img.getAttributes()?.alt === "Denik") {
                    img.setAttributes({
                      ...img.getAttributes(),
                      src: `${logoOrigin}/images/denik-logo.svg`,
                    })
                  }
                })
              }
              const target =
                existing ||
                wrapper.append(BRANDING_HTML, {
                  at: wrapper.components().length,
                })[0]
              if (!target) return
              target.set({
                removable: false,
                copyable: false,
                draggable: false,
                editable: false,
                "custom-name": "Branding (Denik)",
              })
              target.components().forEach((child: any) => {
                child.set({
                  removable: false,
                  editable: false,
                  draggable: false,
                })
              })
            } finally {
              ensuringBranding = false
            }
          }
          // Debounce so rapid edits/streamed sections don't trigger storms
          let ensureBrandingTimer: ReturnType<typeof setTimeout> | null = null
          const scheduleEnsureBranding = () => {
            if (ensureBrandingTimer) clearTimeout(ensureBrandingTimer)
            ensureBrandingTimer = setTimeout(() => {
              ensureBrandingTimer = null
              ensureBranding()
            }, 200)
          }
          ensureBranding()
          ed.on("component:remove", scheduleEnsureBranding)
          ed.on("component:add", scheduleEnsureBranding)
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
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // Build streaming preview HTML
  const streamingHtml =
    isGenerating && streamingSections.length > 0
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
/* Selection toolbar — brand_blue + rounded corners */
.gjs-toolbar { background-color: #5158F6 !important; border-radius: 8px !important; overflow: hidden !important; padding: 2px !important; display: flex !important; align-items: center !important; }
.gjs-toolbar-items { display: flex !important; align-items: center !important; }
.gjs-toolbar-item { color: white !important; border-radius: 6px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; line-height: 1 !important; padding: 4px 6px !important; }
.gjs-toolbar-item svg { display: block !important; vertical-align: middle !important; }
.gjs-toolbar-item:hover { background-color: rgba(255,255,255,0.15) !important; }
.gjs-selected { outline: 2px solid #5158F6 !important; outline-offset: -2px; border-radius: 4px; }
.gjs-highlighter { outline: 2px solid #5158F6 !important; border-radius: 4px; }
/* Device responsive: override patch's width:auto so GrapesJS can resize frame-wrapper */
[data-device="Tablet"] .gjs-frame-wrapper { width: 768px !important; left: 50% !important; right: auto !important; transform: translateX(-50%) !important; }
[data-device="Mobile"] .gjs-frame-wrapper { width: 375px !important; left: 50% !important; right: auto !important; transform: translateX(-50%) !important; }
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
          <Link
            to="/dash/website"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Sitio web
          </Link>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18L15 12L9 6" />
          </svg>
          <span className="text-white font-medium">Editor IA</span>
          {hasExistingSections &&
            (isSaving ? (
              <span className="text-xs text-gray-500 shrink-0">
                Guardando...
              </span>
            ) : isRefining ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full shrink-0 animate-pulse">
                Refinando...
              </span>
            ) : hasUnpublishedChanges ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-300 rounded-full shrink-0">
                Sin publicar
              </span>
            ) : org.landingPublished ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-300 rounded-full shrink-0 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Publicada
              </span>
            ) : null)}
        </div>

        {/* Center: Device toggle */}
        {showEditor && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <DeviceToggle
              activeDevice={activeDevice}
              onDeviceChange={handleDeviceChange}
            />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isGenerating && (
            <button
              type="button"
              onClick={() => {
                abortRef.current?.abort()
                setIsGenerating(false)
              }}
              className="px-2.5 py-1 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10"
            >
              Detener
            </button>
          )}
          {hasExistingSections && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Esto reemplazará tu landing actual con una nueva generada por IA. ¿Continuar?",
                    )
                  ) {
                    handleGenerate()
                  }
                }}
                disabled={
                  isGenerating || isLoading || usage.genUsed >= usage.genLimit
                }
                className="px-2.5 py-1 text-sm border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/10 disabled:opacity-50 inline-flex items-center gap-1.5"
                title={
                  usage.genUsed >= usage.genLimit
                    ? "Limite de generaciones alcanzado"
                    : `${usage.genLimit - usage.genUsed} restantes`
                }
              >
                <HiSparkles className="w-4 h-4 text-brand_yellow" />
                {isGenerating ? "Regenerando..." : "Generar con IA"}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${usage.genUsed >= usage.genLimit ? "bg-red-500/20 text-red-300" : "bg-purple-500/20 text-purple-300"}`}
                >
                  {usage.genLimit - usage.genUsed}/{usage.genLimit}
                </span>
              </button>
              <a
                href={getOrgPublicUrl(org.slug!)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 inline-flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Ver
              </a>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-3 py-1 text-sm rounded-lg disabled:opacity-50 bg-brand_blue text-white hover:bg-blue-700"
              >
                {isSaving && pendingSaveRef.current?.publish
                  ? "Publicando..."
                  : !isPublished
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
          <div className="flex h-full" data-device={activeDevice}>
            <div className="flex-1 overflow-hidden">
              <GrapesEditor
                ref={editorRef}
                initialHtml={sectionsToHtml(sections)}
                canvasStyles={sectionsToCanvasStyles(sections)}
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
              hasChatbot={Boolean(org.chatbotAgentId)}
              chatbotEnabled={chatbotEnabled}
              onChatbotEnabledChange={(enabled) => {
                setChatbotEnabled(enabled)
                setHasUnpublishedChanges(true)
              }}
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
                      La IA esta disenando secciones con tus servicios y datos
                      de negocio.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <span
                      className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 py-3 px-6 border-t border-gray-200 bg-white">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <p className="text-sm font-bold text-gray-500">
                Seccion {streamCount + 1} de ~8...
              </p>
              <button
                type="button"
                onClick={() => {
                  abortRef.current?.abort()
                  setIsGenerating(false)
                }}
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
                Genera una nueva landing con IA
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                Usaremos los datos de tu negocio:
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>
                  Nombre: <strong>{org.name}</strong>
                </li>
                {org.businessType && <li>Tipo: {org.businessType}</li>}
                <li>{serviceCount} servicios activos</li>
              </ul>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={
                  isGenerating || isLoading || usage.genUsed >= usage.genLimit
                }
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
              >
                {isGenerating ? "Generando..." : "Generar landing"}
                <span className="ml-2 text-xs opacity-80">
                  ({usage.genLimit - usage.genUsed}/{usage.genLimit})
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {saveMessage && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="px-5 py-3 bg-white text-brand_dark rounded-full shadow-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap pointer-events-auto">
            <svg
              className="w-5 h-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
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

      {refineModal.open && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeRefineModal()
          }}
        >
          <button
            type="button"
            onClick={closeRefineModal}
            className="absolute inset-0 bg-black/35 backdrop-blur-[16px]"
            aria-label="Cerrar"
          />
          <div className="relative w-[640px] max-w-full rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] font-satoshi">
            <div className="absolute left-1/2 -top-16 -translate-x-1/2 z-20">
              <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center">
                <div className="h-28 w-28 rounded-full bg-brand_sky flex items-center justify-center">
                  <span className="text-6xl leading-none">✨</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={closeRefineModal}
              className="absolute right-6 top-6 text-brand_gray rounded-full border border-ash h-8 w-8 flex items-center justify-center transition-all active:scale-95"
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="w-full px-12 pt-16 pb-8 flex flex-col items-center">
              <h3 className="text-center font-satoBold text-2xl leading-[32px] text-brand_dark">
                Refinar con IA
              </h3>
              <p className="mt-4 text-center font-normal font-satoshi text-base leading-[22px] text-brand_gray">
                Describe el cambio que quieres aplicar a este elemento.
              </p>
              <textarea
                autoFocus
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleRefineConfirm()
                  }
                }}
                placeholder="Ej. cambia el color de fondo a azul y agrega un titulo más grande"
                rows={4}
                className="mt-6 w-full rounded-xl border border-brand_stroke bg-white px-4 py-3 text-sm font-satoshi text-brand_dark placeholder:text-brand_gray focus:outline-none focus:border-brand_blue focus:ring-0"
              />
              <div className="mt-8 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={closeRefineModal}
                  className="px-6 py-2 rounded-full border border-brand_stroke text-brand_dark hover:bg-gray-50 transition-colors min-w-[140px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRefineConfirm}
                  disabled={!refineInstruction.trim()}
                  className="px-6 py-2 rounded-full bg-brand_blue text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
                >
                  Refinar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
