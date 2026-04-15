import { useState } from "react"
import { FaWhatsapp } from "react-icons/fa6"

// Meta Embedded Signup (coexistence) — requiere META_APP_ID y config_id
// configurados en Meta for Developers. Ver:
// https://developers.facebook.com/docs/whatsapp/embedded-signup
//
// TODO: cuando esté la app de Meta aprobada, reemplazar `null` por los valores
// reales (vía window.ENV o loader). Mientras, el CTA muestra un aviso.
const META_APP_ID: string | null = null
const META_CONFIG_ID: string | null = null

declare global {
  interface Window {
    FB?: any
    fbAsyncInit?: () => void
  }
}

const loadFacebookSdk = (appId: string) =>
  new Promise<void>((resolve) => {
    if (window.FB) return resolve()
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, xfbml: false, version: "v20.0" })
      resolve()
    }
    const s = document.createElement("script")
    s.src = "https://connect.facebook.net/en_US/sdk.js"
    s.async = true
    document.body.appendChild(s)
  })

export const WhatsAppAd = () => {
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const handleConnect = async () => {
    if (!META_APP_ID || !META_CONFIG_ID) {
      setNotice("Integración con WhatsApp en camino. ¡Muy pronto!")
      setTimeout(() => setNotice(null), 2500)
      return
    }
    setLoading(true)
    try {
      await loadFacebookSdk(META_APP_ID)
      window.FB?.login(
        (response: any) => {
          console.log("[WhatsApp ES]", response)
          // TODO: POST code a /api/whatsapp/exchange con exchange_code flow
        },
        {
          config_id: META_CONFIG_ID,
          response_type: "code",
          override_default_response_type: true,
          extras: { feature: "whatsapp_embedded_signup" },
        },
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#25D366] via-[#1faa54] to-[#128C7E] p-6 shadow-xl">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#DCF8C6]/30 blur-xl" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src="/images/nik-white.svg"
            alt="Nik"
            className="h-16 w-16 md:h-20 md:w-20 shrink-0 drop-shadow-md animate-[nikWobble_3s_ease-in-out_infinite]"
          />
          <div className="flex-1 text-white min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FaWhatsapp className="text-white text-xl" />
              <span className="text-[11px] uppercase tracking-wide font-satoBold bg-white/20 rounded-full px-2 py-0.5">
                Nuevo
              </span>
            </div>
            <h3 className="font-satoBold text-white text-base md:text-[18px] leading-tight">
              Conecta tu chatbot a WhatsApp
            </h3>
            <p className="text-white/90 text-[13px] mt-1 leading-snug">
              Atiende a tus clientes desde donde ya están chateando.
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="shrink-0 w-full md:w-auto flex items-center justify-center gap-2 rounded-full bg-white text-[#128C7E] font-satoBold px-5 py-3 text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
        >
          <FaWhatsapp className="text-lg" />
          {loading ? "Cargando…" : "Conectar WhatsApp"}
        </button>
      </div>

      {notice && (
        <div className="relative mt-3 rounded-xl bg-white/95 text-[#128C7E] text-center text-[13px] font-satoMedium px-3 py-2">
          {notice}
        </div>
      )}

      <style>{`
        @keyframes nikWobble {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
      `}</style>
    </div>
  )
}
