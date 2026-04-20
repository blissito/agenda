import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { IoClose } from "react-icons/io5"
import { Copy } from "~/components/icons/Copy"
import { Facebook } from "~/components/icons/facebook"
import { Linkedin } from "~/components/icons/linkedin"
import { QrCode } from "~/components/icons/QrCode"
import { Twitter } from "~/components/icons/twitter"
import { WhatsApp } from "~/components/icons/WhatsApp"

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
  return `${text.slice(0, MAX - 1).trimEnd()}…`
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
      onAfterClick?: never
    }

const ShareButton = (props: ShareButtonProps) => {
  const base =
    "h-10 w-10 rounded-full flex items-center justify-center shadow-sm"

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

/** Close button homologado con ConfirmModal */
const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-6 top-6 text-brand_gray rounded-full border border-ash h-8 w-8 flex items-center justify-center transition-all active:scale-95"
    aria-label="Cerrar"
  >
    <IoClose className="text-2xl" />
  </button>
)

export const ShareWebsiteModal = ({
  open,
  onClose,
  url,
  orgName,
  orgSlug,
}: Props) => {
  const [copied, setCopied] = useState(false)
  const [downloadingQr, setDownloadingQr] = useState(false)

  const baseCopy = useMemo(() => {
    const name = (orgName ?? "").trim()
    if (name)
      return `Agenda tu cita con ${name} de forma rápida y sencilla aquí 👇`
    return `Agenda tu cita conmigo de forma rápida y sencilla aquí 👇`
  }, [orgName])

  const enc = encodeURIComponent

  const clipboardText = useMemo(() => `${baseCopy}\n${url}`, [baseCopy, url])
  const waText = useMemo(() => `${baseCopy} ${url}`, [baseCopy, url])
  const twText = useMemo(() => {
    const name = (orgName ?? "").trim()
    const t = name
      ? `Agenda tu cita con ${name} aquí 👇`
      : `Agenda tu cita aquí 👇`
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

      await navigator.clipboard.writeText(clipboardText)

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
      className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/35 backdrop-blur-[16px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[640px] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] font-satoshi">
        {/* Badge superior */}
        <div className="absolute left-1/2 -top-10 -translate-x-1/2 z-20">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-brand_sky flex items-center justify-center">
              <span
                role="img"
                aria-label="link"
                className="text-3xl leading-none"
              >
                🔗
              </span>
            </div>
          </div>
        </div>

        <CloseButton onClick={onClose} />

        <div className="w-full px-6 md:px-12 pt-12 pb-8 flex flex-col items-center">
          <h3 className="text-center font-satoBold text-[20px] leading-[28px] text-brand_dark">
            ¡Comparte con tus clientes!
          </h3>

          <p className="mt-[16px] text-center font-normal font-satoshi text-[16px] leading-[22px] text-brand_gray">
            Es hora de que tus clientes se enteren de que tus servicios ya están
            disponibles. Comparte ya en tus redes sociales.
          </p>

          <div className="mt-8 w-full">
            <div className="w-full h-12 flex items-center gap-3 rounded-xl bg-brand_sky px-4 sm:px-6">
              <p className="flex-1 truncate text-sm font-satoMedium text-brand_gray">
                {url}
              </p>

              <button
                type="button"
                onClick={copyToClipboard}
                className="h-10 w-10 flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                title={copied ? "Copiado" : "Copiar"}
                aria-label={copied ? "Copiado" : "Copiar"}
              >
                <Copy
                  className={copied ? "text-green-600" : "text-brand_gray"}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 w-full flex flex-wrap items-center justify-center gap-4">
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
  )
}
