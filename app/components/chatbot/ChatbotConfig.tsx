import { useRef, useState } from "react";
import { WidgetSelectorModal, type WidgetStyle } from "./WidgetSelectorModal";

const WIDGET_STYLE_LABELS: Record<WidgetStyle, string> = {
  bubble: "Bubble clásico",
  sidebar: "Sidebar Push",
  bar: "Barra empresarial",
};

interface ChatbotConfigProps {
  initialConfig?: {
    name: string;
    avatarUrl: string;
    primaryColor: string;
    greeting: string;
    farewell: string;
    widgetStyle: WidgetStyle;
  };
  onSave: (config: {
    name: string;
    avatarUrl: string;
    primaryColor: string;
    greeting: string;
    farewell: string;
    widgetStyle: WidgetStyle;
  }) => void;
  isSaving?: boolean;
  avatarPutUrl?: string;
  avatarKey?: string;
}

export function ChatbotConfig({ initialConfig, onSave, isSaving, avatarPutUrl, avatarKey }: ChatbotConfigProps) {
  const [name, setName] = useState(initialConfig?.name || "Ghosty");
  const [avatarUrl, setAvatarUrl] = useState(initialConfig?.avatarUrl || "");
  const [primaryColor, setPrimaryColor] = useState(initialConfig?.primaryColor || "#5158F6");
  const [greeting, setGreeting] = useState(initialConfig?.greeting || "¡Hola! ¿En qué puedo ayudarte?");
  const [farewell, setFarewell] = useState(initialConfig?.farewell || "¡Gracias por tu visita! Hasta pronto.");
  const [widgetStyle, setWidgetStyle] = useState<WidgetStyle>(initialConfig?.widgetStyle || "bubble");
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    let finalAvatarUrl = avatarUrl;

    // Upload avatar to S3 if there's a pending file
    if (pendingFile && avatarPutUrl && avatarKey) {
      try {
        await fetch(avatarPutUrl, {
          method: "PUT",
          body: pendingFile,
          headers: { "Content-Type": pendingFile.type },
        });
        finalAvatarUrl = `/api/images?key=chatbot-avatars/${avatarKey}`;
        setPendingFile(null);
      } catch (e) {
        console.error("Error uploading avatar:", e);
      }
    }

    setAvatarUrl(finalAvatarUrl);
    onSave({ name, avatarUrl: finalAvatarUrl, primaryColor, greeting, farewell, widgetStyle });
  };

  return (
    <div className="grid grid-cols-[40%,1fr] gap-8 min-h-[calc(100vh-220px)]">
      {/* Left column — Form */}
      <div className="flex flex-col bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-satoBold text-brand_dark mb-5">Estilo de tu chat</h2>

        {/* Widget style */}
        <div className="mb-5">
          <label className="block text-sm font-satoMedium text-brand_dark mb-2">Estilo del Widget</label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand_dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-satoMedium text-brand_dark">{WIDGET_STYLE_LABELS[widgetStyle]}</span>
                <span className="w-2 h-2 rounded-full bg-brand_blue" />
              </div>
            </div>
            <button
              onClick={() => setShowWidgetModal(true)}
              className="text-sm text-brand_blue font-satoMedium hover:underline"
            >
              Cambiar
            </button>
          </div>
        </div>

        {/* Avatar + Name + Color — side by side */}
        <div className="flex gap-6 mb-5">
          {/* Avatar dropzone (left) */}
          <div className="flex-shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleAvatarDrop}
              className="w-[140px] h-[140px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-brand_blue/40 transition-colors overflow-hidden"
            >
              {(previewUrl || avatarUrl) ? (
                <img src={previewUrl || avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-brand_gray text-center px-2 leading-relaxed">Arrastra o selecciona la foto</span>
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

          {/* Name + Color (right) */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-satoMedium text-brand_dark mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand_blue/20"
                placeholder="Nombre de tu chatbot"
              />
            </div>

            <div>
              <label className="block text-sm font-satoMedium text-brand_dark mb-2">Color</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
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
          <label className="block text-sm font-satoMedium text-brand_dark mb-2">Saludo inicial</label>
          <textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-white rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand_blue/20 resize-none"
            placeholder="Mensaje de bienvenida..."
          />
        </div>

        {/* Farewell */}
        <div>
          <label className="block text-sm font-satoMedium text-brand_dark mb-2">Despedida</label>
          <textarea
            value={farewell}
            onChange={(e) => setFarewell(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-white rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand_blue/20 resize-none"
            placeholder="Mensaje de despedida..."
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
        style={{ backgroundImage: "radial-gradient(circle, #c8ccd8 1.5px, transparent 1.5px), radial-gradient(circle, transparent 3px, #c8ccd8 3px, #c8ccd8 4px, transparent 4px)", backgroundSize: "40px 40px" }}
      >
        <div className="w-full max-w-[360px] px-3">
          {/* Chat window */}
          <div className="bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.05)] border border-[#e1e3e7] overflow-hidden flex flex-col h-[560px]">
            {/* Header */}
            <div className="px-4 py-4 flex items-center gap-3 bg-[rgba(240,240,240,0.24)] border-b border-[#e1e3e7]">
              <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center overflow-hidden">
                {(previewUrl || avatarUrl) ? (
                  <img src={previewUrl || avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <img src="/images/chatbot-default-avatar.svg" alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <p className="text-brand_dark font-satoBold text-base">{name || "Chatbot"}</p>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 flex-1 bg-white">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex-shrink-0 bg-[#f0f0f0] flex items-center justify-center overflow-hidden">
                  {(previewUrl || avatarUrl) ? (
                    <img src={previewUrl || avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/images/chatbot-default-avatar.svg" alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="border border-[#f0f0f0] rounded-xl p-3 text-sm text-brand_dark max-w-[250px]">
                  {greeting || "¡Hola!"}
                </div>
              </div>
            </div>

            {/* Powered by */}
            <div className="text-center py-1.5">
              <span className="text-xs text-[#81838e]">Powered by Formmy.app</span>
            </div>

            {/* Input bar */}
            <div className="px-4 py-3 flex items-center gap-2">
              <div className="flex-1 px-3 py-3 border border-[#e1e3e7] rounded-xl text-sm text-[#b6b6ba]">
                Escribe un mensaje...
              </div>
              <img src="/images/send.svg" alt="Enviar" className="w-6 h-6 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <WidgetSelectorModal
        isOpen={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        onSelect={setWidgetStyle}
        currentStyle={widgetStyle}
      />
    </div>
  );
}
