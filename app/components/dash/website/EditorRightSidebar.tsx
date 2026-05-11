import { LANDING_THEMES } from "@easybits.cloud/html-tailwind-generator"
import { TailwindClassEditor } from "@easybits.cloud/html-tailwind-generator/components4"
import type { Component, Editor } from "grapesjs"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type Brandkit = {
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  surfaceColor?: string | null
  fontHeading?: string | null
  fontBody?: string | null
  logoUrl?: string | null
}

export interface EditorRightSidebarProps {
  editor: Editor | null
  theme: string
  customColors: Record<string, string>
  onThemeChange: (themeId: string, colors?: Record<string, string>) => void
  themeVersion: number
  hasChatbot?: boolean
  chatbotEnabled?: boolean
  onChatbotEnabledChange?: (enabled: boolean) => void
  brandkit?: Brandkit
  onBrandkitChange?: (next: Brandkit) => void
}

export function EditorRightSidebar({
  editor,
  theme,
  customColors,
  onThemeChange,
  themeVersion,
  hasChatbot = false,
  chatbotEnabled = false,
  onChatbotEnabledChange,
  brandkit,
  onBrandkitChange,
}: EditorRightSidebarProps) {
  const resolvedColors = useMemo(() => {
    const base = LANDING_THEMES.find((t) => t.id === theme)?.colors ?? {}
    return { ...base, ...customColors }
  }, [theme, customColors])

  return (
    <div className="w-72 shrink-0 bg-brand_dark border-l border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Chatbot */}
      {hasChatbot && (
        <>
          <div className="px-4 pt-5 pb-3 flex items-center justify-between select-none">
            <span className="text-sm font-bold text-white">Chatbot</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                  chatbotEnabled ? "text-brand_blue" : "text-gray-500"
                }`}
              >
                {chatbotEnabled ? "Activo" : "Inactivo"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={chatbotEnabled}
                onClick={() => onChatbotEnabledChange?.(!chatbotEnabled)}
                className="chatbot-toggle relative flex items-center w-9 h-5 rounded-full p-0 cursor-pointer"
                style={{
                  background: chatbotEnabled ? "#5158F6" : "#4B5563",
                  backgroundImage: "none",
                  border: "none",
                  outline: "none",
                  transition: "background 0.2s",
                }}
              >
                <span
                  className="rounded-full block"
                  style={{
                    width: "12px",
                    height: "12px",
                    marginLeft: "4px",
                    background: "#ffffff",
                    transform: chatbotEnabled
                      ? "translateX(16px)"
                      : "translateX(0)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            </div>
          </div>
          <div className="w-full h-px bg-gray-700" />
        </>
      )}

      {/* Temas */}
      <div className="px-4 pt-5 pb-3">
        <h3 className="text-sm font-bold text-white mb-3">Temas</h3>
        <ThemeSelector
          activeTheme={theme}
          customColors={customColors}
          onSelect={(themeId) => onThemeChange(themeId)}
        />
      </div>

      <div className="w-full h-px bg-gray-700" />

      {onBrandkitChange && theme === "custom" && (
        <>
          <BrandkitPanel
            brandkit={brandkit ?? {}}
            onChange={onBrandkitChange}
            onApply={(next) => {
              onBrandkitChange(next)
              const colors: Record<string, string> = {}
              if (next.primaryColor) colors.primary = next.primaryColor
              if (next.secondaryColor) colors.secondary = next.secondaryColor
              if (next.accentColor) colors.accent = next.accentColor
              if (next.surfaceColor) colors.surface = next.surfaceColor
              onThemeChange("custom", colors)
            }}
          />
          <div className="w-full h-px bg-gray-700" />
        </>
      )}

      {/* Estilos */}
      <div className="flex-1 overflow-auto pt-4">
        <h3 className="text-sm font-bold text-white mb-3 px-4">Estilos</h3>
        {editor ? (
          <>
            <ImagePanel editor={editor} />
            <TailwindClassEditor
              editor={editor}
              themeVersion={themeVersion}
              themeColors={resolvedColors}
            />
          </>
        ) : (
          <p className="text-xs text-gray-500">
            Selecciona un elemento en el canvas
          </p>
        )}
      </div>
    </div>
  )
}

function BrandkitPanel({
  brandkit,
  onChange,
  onApply,
}: {
  brandkit: Brandkit
  onChange: (next: Brandkit) => void
  onApply: (next: Brandkit) => void
}) {
  const [open, setOpen] = useState(true)
  const [draft, setDraft] = useState<Brandkit>(brandkit)

  // Re-sync the draft if the parent brandkit changes (e.g. after save/reload).
  useEffect(() => {
    setDraft(brandkit)
  }, [brandkit])

  const update = (key: keyof Brandkit, value: string) => {
    setDraft((d) => ({ ...d, [key]: value || null }))
  }

  const isDirty = useMemo(() => {
    const keys: Array<keyof Brandkit> = [
      "primaryColor",
      "secondaryColor",
      "accentColor",
      "surfaceColor",
      "logoUrl",
      "fontHeading",
      "fontBody",
    ]
    return keys.some((k) => (draft[k] || null) !== (brandkit[k] || null))
  }, [draft, brandkit])

  const colorRows: Array<{ key: keyof Brandkit; label: string }> = [
    { key: "primaryColor", label: "Primario" },
    { key: "secondaryColor", label: "Secundario" },
    { key: "accentColor", label: "Acento" },
    { key: "surfaceColor", label: "Fondo" },
  ]

  return (
    <div className="px-4 pt-5 pb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between mb-3 text-sm font-bold text-white"
      >
        <span>Brandkit</span>
        <span className="text-xs text-gray-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-3">
          <div className="space-y-2">
            {colorRows.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="text-xs text-gray-400 w-20">{label}</label>
                <input
                  type="color"
                  value={(draft[key] as string) || "#ffffff"}
                  onChange={(e) => update(key, e.target.value)}
                  className="h-7 w-10 rounded cursor-pointer bg-transparent border border-gray-600"
                />
                <input
                  type="text"
                  value={(draft[key] as string) || ""}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder="#5158F6"
                  className="flex-1 text-xs px-2 py-1 rounded bg-[#2A2B31] text-white border-none outline-none placeholder:text-gray-500"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Logo URL</label>
            <input
              type="url"
              value={draft.logoUrl || ""}
              onChange={(e) => update("logoUrl", e.target.value)}
              placeholder="https://…/logo.svg"
              className="w-full text-xs px-2 py-1.5 rounded bg-[#2A2B31] text-white border-none outline-none placeholder:text-gray-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Fuente títulos
              </label>
              <input
                type="text"
                value={draft.fontHeading || ""}
                onChange={(e) => update("fontHeading", e.target.value)}
                placeholder="Inter"
                className="w-full text-xs px-2 py-1.5 rounded bg-[#2A2B31] text-white border-none outline-none placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Fuente cuerpo
              </label>
              <input
                type="text"
                value={draft.fontBody || ""}
                onChange={(e) => update("fontBody", e.target.value)}
                placeholder="Satoshi"
                className="w-full text-xs px-2 py-1.5 rounded bg-[#2A2B31] text-white border-none outline-none placeholder:text-gray-500"
              />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-tight">
            La IA usará estos valores como referencia al generar y refinar.
          </p>
          <button
            type="button"
            onClick={() => {
              onChange(draft)
              onApply(draft)
            }}
            disabled={!isDirty}
            className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-semibold bg-brand_blue text-white disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Aplicar cambios
          </button>
        </div>
      )}
    </div>
  )
}

type ThemeOption = {
  id: string
  label: string
  colors: { primary: string; surface: string; accent: string }
}

function ThemeSelector({
  activeTheme,
  customColors,
  onSelect,
}: {
  activeTheme: string
  customColors: Record<string, string>
  onSelect: (themeId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const customOption: ThemeOption = {
    id: "custom",
    label: "Personalizado",
    colors: {
      primary: customColors.primary || "#5158F6",
      surface: customColors.surface || "#ffffff",
      accent: customColors.accent || "#06b6d4",
    },
  }
  const options: ThemeOption[] = [customOption, ...LANDING_THEMES]
  const active =
    options.find((t) => t.id === activeTheme) ?? customOption

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 bg-[#2A2B31] rounded-lg px-3 py-2.5 border-none outline-none focus:outline-none"
      >
        <div className="flex -space-x-1">
          <span
            className="w-4 h-4 rounded-full border border-black/20"
            style={{ backgroundColor: active.colors.primary }}
          />
          <span
            className="w-4 h-4 rounded-full border border-black/20"
            style={{ backgroundColor: active.colors.surface }}
          />
          <span
            className="w-4 h-4 rounded-full border border-black/20"
            style={{ backgroundColor: active.colors.accent }}
          />
        </div>
        <span className="text-sm text-white flex-1 text-left">
          {active.label}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#2A2B31] border border-gray-600 rounded-lg py-1 max-h-60 overflow-auto shadow-xl">
          {options.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelect(t.id)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 transition-colors ${t.id === activeTheme ? "bg-white/5" : ""}`}
            >
              <div className="flex -space-x-1">
                <span
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{ backgroundColor: t.colors.primary }}
                />
                <span
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{ backgroundColor: t.colors.surface }}
                />
                <span
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{ backgroundColor: t.colors.accent }}
                />
              </div>
              <span className="text-sm text-gray-200">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function isImageComponent(component: Component | null): boolean {
  if (!component) return false
  if (component.get?.("type") === "image") return true
  const el = component.getEl?.()
  return el?.tagName === "IMG"
}

/** Selection might land on an <a> or <div> wrapping the <img>. Look down a few levels for an image. */
function findImageInside(
  component: Component | null,
  depth = 3,
): Component | null {
  if (!component || depth < 0) return null
  if (isImageComponent(component)) return component
  const children = component.components?.()
  if (!children) return null
  for (let i = 0; i < children.length; i++) {
    const found = findImageInside(children.at(i), depth - 1)
    if (found) return found
  }
  return null
}

function findImageAncestor(component: Component | null): Component | null {
  let cur: Component | null | undefined = component
  for (let i = 0; cur && i < 5; i++) {
    if (isImageComponent(cur)) return cur
    cur = cur.parent?.() as Component | null
  }
  return null
}

function resolveImageComponent(
  component: Component | null,
): Component | null {
  if (!component) return null
  return (
    (isImageComponent(component) ? component : null) ||
    findImageInside(component) ||
    findImageAncestor(component)
  )
}

function ImagePanel({ editor }: { editor: Editor }) {
  const [imgComponent, setImgComponent] = useState<Component | null>(null)
  const [src, setSrc] = useState("")
  const [alt, setAlt] = useState("")
  const [previewError, setPreviewError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const applyAttrs = useCallback(
    (next: { src?: string; alt?: string }) => {
      if (!imgComponent) return
      imgComponent.addAttributes?.(next)
      if (next.src !== undefined) imgComponent.set?.("src", next.src)
      const el = imgComponent.getEl?.()
      if (el) {
        if (next.src !== undefined) el.setAttribute("src", next.src)
        if (next.alt !== undefined) el.setAttribute("alt", next.alt)
      }
      editor.trigger("sidebar:change")
    },
    [editor, imgComponent],
  )

  const isValidUrl = (v: string) => {
    if (!v) return false
    try {
      const u = new URL(v)
      return u.protocol === "http:" || u.protocol === "https:"
    } catch {
      return false
    }
  }

  const applySrc = useCallback(() => {
    if (!isValidUrl(src)) return
    applyAttrs({ src })
  }, [applyAttrs, src])

  const applyAlt = useCallback(() => {
    applyAttrs({ alt })
  }, [applyAttrs, alt])

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true)
      setUploadError(null)
      try {
        const fd = new FormData()
        fd.append("intent", "image_upload")
        fd.append("file", file)
        const res = await fetch("/api/landing-generator", {
          method: "POST",
          body: fd,
        })
        const data = await res.json()
        if (!res.ok || !data?.url) {
          throw new Error(data?.error || "Error al subir")
        }
        setSrc(data.url)
        setPreviewError(false)

        // Try <img> first, then fall back to setting background-image on the
        // currently-selected element (common for hero sections with bg images).
        const cur = editor.getSelected() as Component | undefined
        const imgTarget = imgComponent ?? resolveImageComponent(cur ?? null)
        if (imgTarget) {
          imgTarget.addAttributes?.({ src: data.url })
          imgTarget.set?.("src", data.url)
          const el = imgTarget.getEl?.()
          if (el) el.setAttribute("src", data.url)
          editor.trigger("sidebar:change")
          setImgComponent(imgTarget)
        } else if (cur) {
          // Set background-image on the selected component
          const styles = (cur.getStyle?.() ?? {}) as Record<string, string>
          cur.setStyle?.({
            ...styles,
            "background-image": `url('${data.url}')`,
            "background-size": styles["background-size"] || "cover",
            "background-position":
              styles["background-position"] || "center center",
          })
          editor.trigger("sidebar:change")
        } else {
          setUploadError(
            "Imagen subida — selecciona un elemento en el canvas y reintenta.",
          )
          try {
            await navigator.clipboard?.writeText(data.url)
          } catch {}
        }
      } catch (e: any) {
        setUploadError(e?.message || "Error al subir")
      } finally {
        setUploading(false)
      }
    },
    [editor, imgComponent],
  )

  useEffect(() => {
    const onSelected = (component: Component) => {
      const img = resolveImageComponent(component)
      setImgComponent(img)
      setPreviewError(false)
      setUploadError(null)
      if (img) {
        const attrs = img.getAttributes?.() || {}
        setSrc(attrs.src || "")
        setAlt(attrs.alt || "")
      } else {
        setSrc("")
        setAlt("")
      }
    }
    editor.on("component:selected", onSelected)
    editor.on("component:deselected", onSelected as never)
    const current = editor.getSelected()
    if (current) onSelected(current as Component)
    return () => {
      editor.off("component:selected", onSelected)
      editor.off("component:deselected", onSelected as never)
    }
  }, [editor])

  const urlValid = isValidUrl(src)
  const hasImg = imgComponent !== null

  return (
    <div className="px-4 pb-3 mb-3 border-b border-gray-700">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
        Imagen
      </p>

      {!hasImg && (
        <p className="text-[11px] text-gray-500 mb-2">
          Selecciona una imagen o un fondo del canvas; la imagen que subas
          reemplazará el `src` o el `background-image` del elemento.
        </p>
      )}

      {hasImg && src && !previewError && (
        <div
          className="mb-2 rounded-md overflow-hidden border border-gray-700 bg-gray-950"
          style={{ aspectRatio: "16 / 9" }}
        >
          <img
            src={src}
            alt={alt || "preview"}
            className="w-full h-full object-cover"
            onError={() => setPreviewError(true)}
            onLoad={() => setPreviewError(false)}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full mb-2 px-3 py-2 rounded-lg text-xs font-semibold bg-brand_blue text-white disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Subiendo…" : "Subir imagen"}
      </button>
      {uploadError && (
        <p className="text-[10px] text-red-400 mb-2">{uploadError}</p>
      )}

      {hasImg && (
        <>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            URL
          </label>
          <div className="flex items-center gap-1 mb-2">
            <input
              type="text"
              value={src}
              onChange={(e) => {
                setSrc(e.target.value)
                setPreviewError(false)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySrc()
              }}
              placeholder="https://..."
              className="flex-1 bg-[#2A2B31] text-xs text-white rounded px-2 py-1.5 outline-none border border-transparent focus:border-brand_blue min-w-0"
            />
            <button
              type="button"
              onClick={applySrc}
              disabled={!urlValid}
              title="Aplicar URL"
              className="w-7 h-7 flex items-center justify-center rounded bg-brand_blue text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✓
            </button>
          </div>
          {src && !urlValid && (
            <p className="text-[10px] text-amber-500 mb-2">
              URL inválida — debe empezar con http:// o https://
            </p>
          )}
          {previewError && urlValid && (
            <p className="text-[10px] text-red-400 mb-2">
              No se pudo cargar la imagen desde esa URL.
            </p>
          )}

          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Alt
          </label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyAlt()
              }}
              placeholder="Descripción..."
              className="flex-1 bg-[#2A2B31] text-xs text-white rounded px-2 py-1.5 outline-none border border-transparent focus:border-brand_blue min-w-0"
            />
            <button
              type="button"
              onClick={applyAlt}
              title="Aplicar alt"
              className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 text-white shrink-0"
            >
              ✓
            </button>
          </div>
        </>
      )}
    </div>
  )
}
