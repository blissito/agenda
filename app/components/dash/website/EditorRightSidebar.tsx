import { LANDING_THEMES } from "@easybits.cloud/html-tailwind-generator"
import { TailwindClassEditor } from "@easybits.cloud/html-tailwind-generator/components4"
import type { Editor } from "grapesjs"
import { useEffect, useMemo, useRef, useState } from "react"

export interface EditorRightSidebarProps {
  editor: Editor | null
  theme: string
  customColors: Record<string, string>
  onThemeChange: (themeId: string, colors?: Record<string, string>) => void
  themeVersion: number
  hasChatbot?: boolean
  chatbotEnabled?: boolean
  onChatbotEnabledChange?: (enabled: boolean) => void
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
          onSelect={(themeId) => onThemeChange(themeId)}
        />
      </div>

      <div className="w-full h-px bg-gray-700" />

      {/* Estilos */}
      <div className="flex-1 overflow-auto pt-4">
        <h3 className="text-sm font-bold text-white mb-3 px-4">Estilos</h3>
        {editor ? (
          <TailwindClassEditor
            editor={editor}
            themeVersion={themeVersion}
            themeColors={resolvedColors}
          />
        ) : (
          <p className="text-xs text-gray-500">
            Selecciona un elemento en el canvas
          </p>
        )}
      </div>
    </div>
  )
}

function ThemeSelector({
  activeTheme,
  onSelect,
}: {
  activeTheme: string
  onSelect: (themeId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const active = LANDING_THEMES.find((t) => t.id === activeTheme)
  const ref = useRef<HTMLDivElement>(null)

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
        {active && (
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
        )}
        <span className="text-sm text-white flex-1 text-left">
          {active?.label ?? "Tema"}
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
          {LANDING_THEMES.map((t) => (
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
