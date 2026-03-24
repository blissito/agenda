import { type ReactElement, useState } from "react"

export type WidgetStyle = "bubble" | "sidebar" | "bar"

interface WidgetTemplate {
  id: WidgetStyle
  name: string
  description: string
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: "bubble",
    name: "Bubble Clásico",
    description:
      "Botón flotante circular con chat desplegable. Ideal para sitios modernos.",
  },
  {
    id: "sidebar",
    name: "Sidebar Push",
    description:
      "Panel lateral que empuja el contenido del sitio. Perfecto para aplicaciones empresariales.",
  },
  {
    id: "bar",
    name: "Barra empresarial",
    description:
      "Barra inferior con acciones rápidas y chat integrado. Para portales corporativos.",
  },
]

function BubbleThumbnail() {
  return (
    <svg viewBox="0 0 160 100" fill="none" className="w-full h-full">
      <rect x="12" y="16" width="80" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="28" width="60" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="40" width="70" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="52" width="50" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="64" width="65" height="6" rx="3" fill="#D1D5DB" />
      <circle cx="130" cy="74" r="16" fill="#E5E7EB" />
      <path
        d="M124 74a6 6 0 016-6h0a6 6 0 016 6v2a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2z"
        fill="#9CA3AF"
      />
      <circle cx="127" cy="74" r="1" fill="#6B7280" />
      <circle cx="130" cy="74" r="1" fill="#6B7280" />
      <circle cx="133" cy="74" r="1" fill="#6B7280" />
    </svg>
  )
}

function SidebarThumbnail() {
  return (
    <svg viewBox="0 0 160 100" fill="none" className="w-full h-full">
      <rect x="12" y="16" width="70" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="28" width="55" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="40" width="60" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="52" width="45" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="64" width="50" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="76" width="55" height="6" rx="3" fill="#D1D5DB" />
      <rect x="105" y="8" width="44" height="84" rx="4" fill="#E5E7EB" />
      <rect x="111" y="18" width="32" height="4" rx="2" fill="#9CA3AF" />
      <rect x="111" y="28" width="24" height="4" rx="2" fill="#9CA3AF" />
      <rect x="111" y="38" width="28" height="4" rx="2" fill="#9CA3AF" />
    </svg>
  )
}

function BarThumbnail() {
  return (
    <svg viewBox="0 0 160 100" fill="none" className="w-full h-full">
      <rect x="12" y="12" width="136" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="24" width="100" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="36" width="120" height="6" rx="3" fill="#D1D5DB" />
      <rect x="12" y="48" width="90" height="6" rx="3" fill="#D1D5DB" />
      <rect x="4" y="72" width="152" height="24" rx="4" fill="#E5E7EB" />
      <rect x="14" y="80" width="40" height="8" rx="4" fill="#9CA3AF" />
      <rect x="62" y="80" width="40" height="8" rx="4" fill="#9CA3AF" />
      <rect x="110" y="80" width="36" height="8" rx="4" fill="#9CA3AF" />
    </svg>
  )
}

const THUMBNAILS: Record<WidgetStyle, () => ReactElement> = {
  bubble: BubbleThumbnail,
  sidebar: SidebarThumbnail,
  bar: BarThumbnail,
}

interface WidgetSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (style: WidgetStyle) => void
  currentStyle: WidgetStyle
}

export function WidgetSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currentStyle,
}: WidgetSelectorModalProps) {
  const [selected, setSelected] = useState<WidgetStyle>(currentStyle)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-satoBold text-brand_dark">
            Elige cómo se verá tu chat
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cards - horizontal row */}
        <div className="flex gap-4">
          {WIDGET_TEMPLATES.map((template) => {
            const isSelected = selected === template.id
            const Thumb = THUMBNAILS[template.id]
            return (
              <button
                key={template.id}
                onClick={() => setSelected(template.id)}
                className={`relative flex-1 rounded-xl border-2 text-left transition-all overflow-hidden ${
                  isSelected
                    ? "border-brand_blue"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Check indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand_blue flex items-center justify-center z-10">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="bg-gray-50 p-2 h-28 flex items-center justify-center">
                  <Thumb />
                </div>

                {/* Text */}
                <div className="p-4">
                  <h3 className="font-satoBold text-sm text-brand_dark">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Actions - centered */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSelect(selected)
              onClose()
            }}
            className="px-6 py-2.5 text-sm text-white bg-brand_blue rounded-full hover:opacity-90 transition-opacity font-satoMedium"
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  )
}
