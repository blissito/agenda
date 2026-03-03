import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Facebook } from "~/components/icons/facebook"
import { WhatsApp } from "~/components/icons/WhatsApp"
import { Linkedin } from "~/components/icons/linkedin"
import { Twitter } from "~/components/icons/twitter"
import { Copy } from "~/components/icons/Copy"

type Props = {
  open: boolean
  onClose: () => void
  url: string
  orgName?: string | null
  orgSlug?: string | null
}

function clampXText(text: string) {
  const MAX = 220
  if (text.length <= MAX) return text
  return text.slice(0, MAX - 1).trimEnd() + "…"
}

function QrIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 4h6v6H4V4Zm2 2v2h2V6H6Zm8-2h6v6h-6V4Zm2 2v2h2V6h-2ZM4 14h6v6H4v-6Zm2 2v2h2v-2H6Zm10 0h2v2h-2v-2Zm-2-2h2v2h-2v-2Zm4 4h2v2h-2v-2Zm0-4h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm4-6h2v2h-2v-2Zm-4 0h2v2h-2v-2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const ShareWebsiteModal = ({ open, onClose, url, orgName, orgSlug }: Props) => {
  const [copied, setCopied] = useState(false)
  const [downloadingQr, setDownloadingQr] = useState(false)

  const baseCopy = useMemo(() => {
    const name = (orgName ?? "").trim()
    if (name) return `Agenda tu cita con ${name} de forma rápida y sencilla aquí 👇`
    return `Agenda tu cita conmigo de forma rápida y sencilla aquí 👇`
  }, [orgName])

  const enc = encodeURIComponent

  const clipboardText = useMemo(() => `${baseCopy}\n${url}`, [baseCopy, url])
  const waText = useMemo(() => `${baseCopy} ${url}`, [baseCopy, url])
  const twText = useMemo(() => {
    const name = (orgName ?? "").trim()
    const t = name ? `Agenda tu cita con ${name} aquí 👇` : `Agenda tu cita aquí 👇`
    return clampXText(t)
  }, [orgName])

  const shareLinks = useMemo(() => {
    const encUrl = enc(url)
    const title = (orgName ?? "Agenda tu cita").trim()
    const summary = baseCopy

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
      whatsapp: `https://wa.me/?text=${enc(waText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${enc(twText)}&url=${encUrl}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encUrl}&title=${enc(
        title,
      )}&summary=${enc(summary)}`,
    }
  }, [baseCopy, orgName, url, waText, twText])

  const copyToClipboard = async () => {
    try {
      if (typeof window === "undefined") return

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clipboardText)
      } else {
        const input = document.createElement("textarea")
        input.value = clipboardText
        input.setAttribute("readonly", "true")
        input.style.position = "fixed"
        input.style.left = "-9999px"
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        document.body.removeChild(input)
      }

      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // noop
    }
  }

  const downloadQr = async () => {
    try {
      if (!url) return
      setDownloadingQr(true)

      const QR = await import("qrcode")
      const dataUrl = await QR.toDataURL(url, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "M",
      })

      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${orgSlug ?? "sitio"}-qr.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      // noop
    } finally {
      setDownloadingQr(false)
    }
  }

  useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-[608px]">
        <div className="absolute left-1/2 -top-14 -translate-x-1/2 z-20">
          <div className="h-32 w-32 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className="h-28 w-28 rounded-full bg-brand_light_gray flex items-center justify-center">
              <span role="img" aria-label="link" className="text-[64px]">
                🔗
              </span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl bg-white shadow-xl pt-20">
          {/* Close */}
          <button
            type="button"
            className="absolute right-5 top-5 h-9 w-9 rounded-full border border-brand_stroke bg-white/90 hover:bg-white flex items-center justify-center"
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
          >
            <span className="text-[20px]  text-brand_gray">×</span>
          </button>
          <div className="px-8 pb-8">
            {/* Title */}
            <h3 className="text-center text-[24px]  font-semibold text-brand_dark">
              ¡Comparte con tus clientes!
            </h3>

            <p className="mt-3 text-center text-[15px]  font-satoMedium text-brand_gray">
              Es hora de que tus clientes se enteren de que tus servicios ya están disponibles.
              <br />
              <span className="inline-block mt-1">Comparte ya en tus redes sociales.</span>
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-brand_light_gray border border-brand_stroke px-5 py-3">
              <p className='flex-1 text-center text-[14px] text-brand_gray font-satoMedium'>
                {url}
              </p>

              <button
                type="button"
                onClick={copyToClipboard}
                className="h-10 w-10 flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                title={copied ? "Copiado" : "Copiar"}
                aria-label={copied ? "Copiado" : "Copiar"}
              >
                <Copy className={copied ? "text-green-600" : "text-brand_gray"} />
              </button>
            </div>
            {/* Redes sociales */}
            <div className="mt-6 flex items-center justify-center gap-4">
            <a
               href={shareLinks.facebook}
               target="_blank"
               rel="noreferrer"
               className="h-10 w-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm"
               title="Facebook"
               aria-label="Facebook"
               onClick={onClose}
             >
               <Facebook className="fill-white text-white" />
             </a>

              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 flex items-center justify-center"
                title="Twitter"
                aria-label="Twitter"
                onClick={onClose}
              >
                <Twitter/>
              </a>

              <a
                 href={shareLinks.whatsapp}
                 target="_blank"
                 rel="noreferrer"
                 className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm"
                 title="WhatsApp"
                 aria-label="WhatsApp"
                 onClick={onClose}
               >
                 <WhatsApp />
               </a>
              <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 w-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-sm"
                  title="Linkedin"
                  aria-label="Linkedin"
                  onClick={onClose}
                >
                  <Linkedin className="fill-white text-white" />
                </a>

              {/* QR */}
              <button
                type="button"
                onClick={downloadQr}
                disabled={downloadingQr}
                className="h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-60"
                title={downloadingQr ? "Generando…" : "Descargar QR"}
                aria-label="Descargar QR"
              >
                <div className="h-10 w-10 rounded-full bg-brand_yellow flex items-center justify-center">
                  <QrIcon className="h-5 w-5 text-brand_dark" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}