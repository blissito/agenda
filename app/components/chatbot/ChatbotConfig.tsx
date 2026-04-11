import { useRef, useState } from "react"
import { ChatWidgetInline, type ChatConfig } from "./ChatWidget"

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
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      farewell: initialConfig?.farewell || "",
      widgetStyle: initialConfig?.widgetStyle || "bubble",
    })
  }

  // Config object for the live preview
  const previewConfig: ChatConfig = {
    name,
    avatarUrl: previewUrl || avatarUrl,
    primaryColor,
    greeting,
    farewell: "",
    widgetStyle: "bubble",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[40%,1fr] gap-8 min-h-[calc(100vh-220px)]">
      {/* Left column — Form */}
      <div className="flex flex-col bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-satoBold text-brand_dark mb-5">
          Estilo de tu chat
        </h2>

        {/* Avatar + Name + Color — side by side */}
        <div className="flex gap-6 mb-5">
          {/* Avatar dropzone */}
          <div className="flex-shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleAvatarDrop}
              className="w-[140px] h-[140px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-brand_blue/40 transition-colors overflow-hidden"
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
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-satoMedium text-brand_dark mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand_blue/20"
                placeholder="Nombre de tu chatbot"
              />
            </div>

            <div>
              <label className="block text-sm font-satoMedium text-brand_dark mb-2">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-full border border-gray-200 cursor-pointer p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 px-3 py-2 bg-white rounded-xl text-sm font-mono border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand_blue/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-5">
          <label className="block text-sm font-satoMedium text-brand_dark mb-2">
            Saludo inicial
          </label>
          <textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-white rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand_blue/20 resize-none"
            placeholder="Mensaje de bienvenida..."
          />
        </div>

        {/* Save button */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-3 bg-brand_blue text-white rounded-full font-satoMedium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Right column — Live preview */}
      <div
        className="bg-[#f0f2f8] rounded-2xl flex items-center justify-center p-3"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c8ccd8 1.5px, transparent 1.5px), radial-gradient(circle, transparent 3px, #c8ccd8 3px, #c8ccd8 4px, transparent 4px)",
          backgroundSize: "40px 40px",
        }}
      >
        {agentId ? (
          <ChatWidgetInline agentId={agentId} config={previewConfig} />
        ) : (
          <ChatWidgetInline
            agentId=""
            config={previewConfig}
          />
        )}
      </div>
    </div>
  )
}
