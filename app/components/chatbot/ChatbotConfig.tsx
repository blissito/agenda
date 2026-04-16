import { useRef, useState } from "react"
import { createPortal } from "react-dom"
import { IoClose } from "react-icons/io5"
import { BasicInput } from "~/components/forms/BasicInput"
import { ChatWidgetInline, type ChatConfig } from "./ChatWidget"
import { WhatsAppAd } from "./WhatsAppAd"

interface ChatbotConfigProps {
  initialConfig?: ChatConfig
  onSave: (config: ChatConfig) => void
  isSaving?: boolean
  avatarPutUrl?: string
  avatarKey?: string
  agentId?: string
}

export function ChatbotConfig({
  initialConfig,
  onSave,
  isSaving,
  avatarPutUrl,
  avatarKey,
  agentId,
}: ChatbotConfigProps) {
  const [name, setName] = useState(initialConfig?.name || "Ghosty")
  const [avatarUrl, setAvatarUrl] = useState(initialConfig?.avatarUrl || "")
  const [primaryColor, setPrimaryColor] = useState(
    initialConfig?.primaryColor || "#5158F6",
  )
  const [greeting, setGreeting] = useState(
    initialConfig?.greeting || "¡Hola! ¿En qué puedo ayudarte?",
  )
  const [farewell, setFarewell] = useState(
    initialConfig?.farewell ||
      "Si necesitas ayuda con algo más, escríbeme, estoy aquí para ayudarte.",
  )
  const [widgetStyle, setWidgetStyle] = useState<ChatConfig["widgetStyle"]>(
    initialConfig?.widgetStyle || "bubble",
  )
  const [showStylePicker, setShowStylePicker] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const WIDGET_STYLES: { value: ChatConfig["widgetStyle"]; label: string }[] = [
    { value: "bubble", label: "Bubble clásico" },
    { value: "sidebar", label: "Sidebar" },
    { value: "bar", label: "Barra inferior" },
  ]
  const currentStyleLabel =
    WIDGET_STYLES.find((s) => s.value === widgetStyle)?.label || "Bubble clásico"

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) {
      setPendingFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    let finalAvatarUrl = avatarUrl

    if (pendingFile && avatarPutUrl && avatarKey) {
      try {
        await fetch(avatarPutUrl, {
          method: "PUT",
          body: pendingFile,
          headers: { "Content-Type": pendingFile.type },
        })
        finalAvatarUrl = `/api/images?key=chatbot-avatars/${avatarKey}`
        setPendingFile(null)
      } catch (e) {
        console.error("Error uploading avatar:", e)
      }
    }

    setAvatarUrl(finalAvatarUrl)
    onSave({
      name,
      avatarUrl: finalAvatarUrl,
      primaryColor,
      greeting,
      farewell,
      widgetStyle,
    })
  }

  // Config object for the live preview
  const previewConfig: ChatConfig = {
    name,
    avatarUrl: previewUrl || avatarUrl,
    primaryColor,
    greeting,
    farewell,
    widgetStyle,
  }

  return (
    <div
      className="bg-white rounded-2xl p-4 md:p-6 flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-[40%,1fr] gap-8"
      style={{ gridTemplateRows: "1fr" }}
    >
      {/* Left column — Form */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl md:text-2xl font-satoBold text-brand_dark">
            Estilo de tu chat
          </h2>
          <button
            type="button"
            onClick={() => setShowFullPreview(true)}
            className="flex items-center justify-center w-11 h-11 bg-transparent border border-brand_stroke rounded-full text-gray-600 hover:text-brand_blue transition-colors shrink-0"
            aria-label="Ver preview del chat"
            title="Ver preview del chat"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {/* Widget style selector — deshabilitado hasta que el SDK de Formmy soporte variantes (sidebar/bar). Hoy widgetStyle se guarda pero no afecta el render. */}
        {/*
        <div className="mb-4 relative">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-brand_blue">
                <span className="w-2 h-2 rounded-full bg-brand_blue" />
              </span>
              <div>
                <p className="text-xs text-brand_gray">Estilo del Widget</p>
                <p className="text-sm font-satoMedium text-brand_dark">
                  {currentStyleLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowStylePicker((v) => !v)}
              className="text-sm text-brand_blue font-satoMedium hover:underline"
            >
              Cambiar
            </button>
          </div>
          {showStylePicker && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              {WIDGET_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setWidgetStyle(s.value)
                    setShowStylePicker(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    widgetStyle === s.value ? "bg-brand_blue/5" : ""
                  }`}
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-brand_blue">
                    {widgetStyle === s.value && (
                      <span className="w-2 h-2 rounded-full bg-brand_blue" />
                    )}
                  </span>
                  <span className="text-sm font-satoMedium text-brand_dark">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        */}

        {/* Avatar + Name + Color — side by side */}
        <div className="flex gap-3 md:gap-6 mb-4 items-stretch">
          {/* Avatar dropzone */}
          <div className="flex-shrink-0 self-stretch">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleAvatarDrop}
              className="w-[108px] md:w-[140px] h-full min-h-[108px] md:min-h-[140px] border border-dashed border-gray-200 bg-[#81838E]/5 rounded-xl flex items-center justify-center cursor-pointer hover:border-brand_blue/40 transition-colors overflow-hidden"
            >
              {previewUrl || avatarUrl ? (
                <img
                  src={previewUrl || avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-brand_gray text-center px-2 leading-relaxed">
                  Arrastra o selecciona la foto
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>

          {/* Name + Color */}
          <div className="flex-1 min-w-0 space-y-4">
            <BasicInput
              name="name"
              label="Nombre"
              placeholder="Nombre de tu chatbot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block font-satoMedium text-brand_dark mb-1">
                Color
              </label>
              <div className="flex items-center gap-2 md:gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 shrink-0 rounded-2xl border border-gray-200 cursor-pointer p-0 overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-2xl [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-2xl"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 min-w-0 md:flex-none md:w-32 h-12 px-4 bg-white rounded-2xl text-sm font-mono border border-gray-200 text-brand_gray focus:border-brand_blue focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-4">
          <BasicInput
            as="textarea"
            name="greeting"
            label="Saludo inicial"
            placeholder="Mensaje de bienvenida..."
            value={greeting}
            onChange={(e) => setGreeting(e.target.value as any)}
          />
        </div>

        {/* Farewell */}
        <div className="mb-4">
          <BasicInput
            as="textarea"
            name="farewell"
            label="Despedida"
            placeholder="Mensaje de despedida..."
            value={farewell}
            onChange={(e) => setFarewell(e.target.value as any)}
          />
        </div>

        {/* WhatsApp Ad — pushed to bottom above Save */}
        <div className="mt-auto pt-10 hidden md:block">
          <WhatsAppAd />
        </div>

        {/* Save button */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 h-12 bg-brand_blue text-white rounded-full font-satoMedium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Right column — Live preview (oculto en mobile, se abre fullscreen desde el botón) */}
      <div
        className="hidden lg:flex bg-[#F0F5FC] rounded-2xl w-full items-center justify-center p-3"
        style={{
          backgroundImage:
            "radial-gradient(circle, transparent 3px, #c8ccd8 3px, #c8ccd8 4px, transparent 4px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="w-full flex justify-center">
          <ChatWidgetInline agentId={agentId ?? ""} config={previewConfig} />
        </div>
      </div>

      {showFullPreview && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-[#F0F5FC] p-4 md:p-8"
            style={{
              backgroundImage:
                "radial-gradient(circle, transparent 3px, #c8ccd8 3px, #c8ccd8 4px, transparent 4px)",
              backgroundSize: "40px 40px",
            }}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={() => setShowFullPreview(false)}
              className="absolute right-6 top-6 z-10 text-brand_gray rounded-full border border-ash bg-white h-10 w-10 flex items-center justify-center transition-all active:scale-95 hover:bg-gray-50"
              aria-label="Cerrar preview"
            >
              <IoClose className="text-2xl" />
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <ChatWidgetInline agentId={agentId ?? ""} config={previewConfig} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
