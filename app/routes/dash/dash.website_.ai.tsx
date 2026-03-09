import { useCallback, useEffect, useRef, useState } from "react"
import { useFetcher, useLoaderData, Link } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import {
  Canvas,
  SectionList,
  FloatingToolbar,
  CodeEditor,
  LANDING_THEMES,
  type CanvasHandle,
  type Section3,
  type IframeMessage,
} from "@easybits.cloud/html-tailwind-generator"
import type { Route } from "./+types/dash.website_.ai"

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

  const isLoading = fetcher.state !== "idle"
  const hasExistingSections = sections.length > 0

  // Generate landing
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setSaveMessage(null)
    fetcher.submit({ intent: "generate" }, { method: "post", action: "/api/landing-generator" })
  }, [fetcher])

  // Handle fetcher data
  if (fetcher.data && isGenerating) {
    const data = fetcher.data as { sections?: Section3[]; error?: string }
    if (data.error) {
      setErrorMessage(data.error)
      setIsGenerating(false)
    } else if (data.sections) {
      setSections(data.sections)
      setIsGenerating(false)
      setErrorMessage(null)
    }
  }

  if (fetcher.data && isRefining) {
    const data = fetcher.data as { html?: string; error?: string }
    if (data.error) {
      setErrorMessage(data.error)
      setIsRefining(false)
    } else if (data.html && selectedSectionId) {
      setSections((prev) =>
        prev.map((s) => (s.id === selectedSectionId ? { ...s, html: data.html as string } : s)),
      )
      setIsRefining(false)
      setErrorMessage(null)
    }
  }

  // Refine section
  const handleRefine = useCallback(
    (instruction: string, referenceImage?: string) => {
      if (!selectedSectionId) return
      const section = sections.find((s) => s.id === selectedSectionId)
      if (!section) return
      setIsRefining(true)
      const formData: Record<string, string> = {
        intent: "refine",
        currentHtml: section.html,
        instruction,
      }
      if (referenceImage) formData.referenceImage = referenceImage
      fetcher.submit(formData, { method: "post", action: "/api/landing-generator" })
    },
    [selectedSectionId, sections, fetcher],
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

  // Handle save response
  if (fetcher.data && isSaving && pendingSaveRef.current) {
    const data = fetcher.data as { ok?: boolean; error?: string }
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
      }
    },
    [],
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
          {hasExistingSections && (
            <>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Guardar borrador
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm bg-brand_blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Publicar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          {hasExistingSections ? (
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
          ) : (
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
            </div>
          )}

          {hasExistingSections && (
            <div className="p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || isLoading}
                className="w-full px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                {isGenerating ? "Regenerando..." : "Regenerar todo"}
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          {sections.length > 0 ? (
            <Canvas
              ref={canvasRef}
              sections={sections}
              theme={theme}
              onMessage={handleIframeMessage}
              iframeRectRef={iframeRectRef}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-lg">
                {isGenerating
                  ? "Generando tu landing page..."
                  : "Genera una landing para ver la preview"}
              </p>
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
