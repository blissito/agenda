import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { X } from "~/components/icons/X"
import { Facebook } from "~/components/icons/facebook"
import { WhatsApp } from "~/components/icons/WhatsApp"
import { Linkedin } from "~/components/icons/linkedin"
import { Twitter } from "~/components/icons/twitter"
import { Copy } from "~/components/icons/Copy"
import { QrCode } from "~/components/icons/QrCode"

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

/** Reusable share button (para no repetir) */
type ShareButtonProps =
  | {
      label: string
      href: string
      onClick?: never
      bgClassName: string
      icon: ReactNode
      onAfterClick?: () => void
    }
  | {
      label: string
      href?: never
      onClick: () => void
      bgClassName: string
      icon: ReactNode
      disabled?: boolean
      title?: string
    }

const ShareButton = (props: ShareButtonProps) => {
  const base = "h-10 w-10 rounded-full flex items-center justify-center shadow-sm"

  if ("href" in props) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        aria-label={props.label}
        title={props.label}
        className={`${base} ${props.bgClassName}`}
        onClick={() => props.onAfterClick?.()}
      >
        {props.icon}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props.label}
      title={props.title ?? props.label}
      className={`${base} ${props.bgClassName} disabled:opacity-60`}
    >
      {props.icon}
    </button>
  )
}

/** Close button encapsulado (círculo + icono X) */
const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    className="absolute right-5 top-5 h-8 w-8 rounded-full border border-brand_stroke bg-white hover:bg-brand_light_gray flex items-center justify-center"
    onClick={onClick}
    aria-label="Cerrar"
    title="Cerrar"
  >
    {/* No le pasamos className: tu x.tsx ya define el tamaño/estilo */}
    <X />
  </button>
)

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

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      whatsapp: `https://wa.me/?text=${enc(waText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${enc(twText)}&url=${encUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    }
  }, [url, waText, twText])

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

      const mod: any = await import("qrcode")
      const QR = mod?.default ?? mod

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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand_gray/15 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-[608px]">
        {/* Badge */}
        <div className="absolute left-1/2 -top-14 -translate-x-1/2 z-20">
          <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center">
            <div className="h-28 w-28 rounded-full bg-brand_sky flex items-center justify-center">
              <span role="img" aria-label="link" className="text-6xl leading-none">
                🔗
              </span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl bg-white shadow-xl pt-20 border border-brand_stroke">
          <CloseButton onClick={onClose} />

          <div className="px-8 pb-8">
            <h3 className="text-center text-2xl font-satoBold">¡Comparte con tus clientes!</h3>

            <p className="mt-4 mx-auto max-w-[540px] text-center text-base font-satoMedium text-brand_gray">
              Es hora de que tus clientes se enteren de que tus servicios ya están disponibles.
              Comparte ya en tus redes sociales.
            </p>

            <div className="mt-8">
              <div className="mx-auto w-[544px] h-12 flex items-center gap-3 rounded-xl bg-brand_sky px-6">
                <p className="flex-1 truncate text-center text-sm font-satoMedium text-brand_gray">
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
            </div>

            <div className="mx-auto mt-6 w-[544px] flex items-center justify-center gap-4">
              <ShareButton
                label="Facebook"
                href={shareLinks.facebook}
                bgClassName="bg-[#1877F2] text-white"
                icon={<Facebook />}
                onAfterClick={onClose}
              />
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 flex items-center justify-center"
                title="Twitter"
                aria-label="Twitter"
                onClick={onClose}
              >
                <Twitter />
              </a>

              <ShareButton
                label="WhatsApp"
                href={shareLinks.whatsapp}
                bgClassName="bg-[#25D366] text-white"
                icon={<WhatsApp />}
                onAfterClick={onClose}
              />

              <ShareButton
                label="Linkedin"
                href={shareLinks.linkedin}
                bgClassName="bg-[#0A66C2] text-white"
                icon={<Linkedin className="fill-white text-white" />}
                onAfterClick={onClose}
              />

              <ShareButton
                label={downloadingQr ? "Generando…" : "Descargar QR"}
                onClick={downloadQr}
                disabled={downloadingQr}
                bgClassName="bg-brand_yellow text-brand_dark"
                icon={<QrCode className="h-5 w-5 text-brand_dark" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}