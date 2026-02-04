import type { Org } from "@prisma/client"
import { useEffect, useState } from "react"
import {
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiCopy,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi"
import { useFetcher } from "react-router"
import { twMerge } from "tailwind-merge"
import { Spinner } from "~/components/common/Spinner"

type DomainDns = {
  type: string
  name: string
  value: string
  validationHostname?: string
  validationTarget?: string
}

type DomainStatus = "pending" | "validating" | "active" | "failed" | null

type OrgWithDomain = Org & {
  customDomain?: string | null
  customDomainStatus?: string | null
  customDomainDns?: unknown
}

export function CustomDomainSection({ org }: { org: OrgWithDomain }) {
  const [domain, setDomain] = useState("")
  const [copied, setCopied] = useState(false)
  const [lastIntent, setLastIntent] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const fetcher = useFetcher<{
    success?: boolean
    error?: string
    domain?: string
    status?: DomainStatus
    dns?: DomainDns
  }>()

  const isLoading = fetcher.state !== "idle"
  const hasCustomDomain = !!org.customDomain
  const domainStatus = (fetcher.data?.status ||
    org.customDomainStatus) as DomainStatus
  const dnsInstructions =
    fetcher.data?.dns || (org.customDomainDns as DomainDns | null)

  const isAddingDomain = isLoading && lastIntent === "add_domain"
  const isCheckingDomain = isLoading && lastIntent === "check_domain"
  const _isRemovingDomain = isLoading && lastIntent === "remove_domain"

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.success &&
      lastIntent === "check_domain"
    ) {
      if (fetcher.data.status === "active") {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    }
  }, [fetcher.state, fetcher.data, lastIntent])

  const handleAddDomain = () => {
    setLastIntent("add_domain")
    fetcher.submit(
      { intent: "add_domain", domain },
      { method: "post", action: "/api/domain" },
    )
  }

  const handleCheckDomain = () => {
    setLastIntent("check_domain")
    fetcher.submit(
      { intent: "check_domain" },
      { method: "post", action: "/api/domain" },
    )
  }

  const handleRemoveDomain = () => {
    if (
      confirm(
        "¿Estás seguro de eliminar el dominio personalizado? Tu agenda seguirá funcionando en el dominio gratuito.",
      )
    ) {
      setLastIntent("remove_domain")
      fetcher.submit(
        { intent: "remove_domain" },
        { method: "post", action: "/api/domain" },
      )
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (status: DomainStatus) => {
    const configs = {
      pending: {
        icon: FiClock,
        text: "Pendiente",
        className: "bg-yellow-100 text-yellow-800",
      },
      validating: {
        icon: FiClock,
        text: "Validando DNS",
        className: "bg-blue-100 text-blue-800",
      },
      active: {
        icon: FiCheck,
        text: "Activo",
        className: "bg-green-100 text-green-800",
      },
      failed: {
        icon: FiAlertCircle,
        text: "Error",
        className: "bg-red-100 text-red-800",
      },
    }
    const config = status ? configs[status] : configs.pending
    const Icon = config.icon
    return (
      <span
        className={twMerge(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          config.className,
        )}
      >
        <Icon size={12} />
        {config.text}
      </span>
    )
  }

  return (
    <section className="space-y-4">
      <h3 className="font-satoMiddle text-brand_dark text-base">
        Dominio personalizado
      </h3>

      {fetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {fetcher.data.error}
        </div>
      )}

      {!hasCustomDomain ? (
        <div className="space-y-4">
          <p className="text-brand_gray text-sm">
            Conecta tu propio dominio para que tus clientes accedan a tu agenda
            desde una URL personalizada.
          </p>

          <div className="space-y-2">
            <label className="text-brand_dark font-satoMiddle text-sm">
              Tu dominio
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="agenda.minegocio.com"
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 focus:border-brand_blue outline-none text-sm"
              />
              <button
                onClick={handleAddDomain}
                disabled={!domain || isLoading}
                className="text-brand_blue hover:text-brand_blue/80 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isAddingDomain ? <Spinner /> : "Agregar"}
              </button>
            </div>
            <p className="text-xs text-brand_gray">
              Ingresa el subdominio o dominio que quieras usar (ej:
              citas.tuempresa.com)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-satoMiddle text-brand_dark">
                {org.customDomain}
              </span>
              <div className="flex items-center gap-2">
                {getStatusBadge(domainStatus)}
                {domainStatus !== "active" && (
                  <button
                    onClick={handleCheckDomain}
                    disabled={isLoading}
                    title="Verificar DNS"
                    className="p-1.5 rounded-lg text-brand_gray hover:text-brand_blue hover:bg-white transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw
                      size={16}
                      className={isCheckingDomain ? "animate-spin" : ""}
                    />
                  </button>
                )}
                <button
                  onClick={handleRemoveDomain}
                  disabled={isLoading}
                  title="Eliminar dominio"
                  className="p-1.5 rounded-lg text-brand_gray hover:text-red-500 hover:bg-white transition-colors disabled:opacity-50"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            {domainStatus !== "active" && dnsInstructions && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-brand_gray">
                  Configura el siguiente registro DNS en tu proveedor:
                </p>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-brand_gray text-xs">Tipo</span>
                      <p className="font-mono font-medium">
                        {dnsInstructions.type}
                      </p>
                    </div>
                    <div>
                      <span className="text-brand_gray text-xs">Nombre</span>
                      <p className="font-mono font-medium">
                        {dnsInstructions.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-brand_gray text-xs">Valor</span>
                      <div className="flex items-center gap-1">
                        <p className="font-mono font-medium text-xs truncate">
                          {dnsInstructions.value}
                        </p>
                        <button
                          onClick={() => copyToClipboard(dnsInstructions.value)}
                          className="text-brand_blue hover:text-brand_blue/80"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {copied && (
                  <p className="text-xs text-green-600">
                    Copiado al portapapeles
                  </p>
                )}

                <p className="text-xs text-brand_gray">
                  Los cambios de DNS pueden tardar hasta 48 horas en propagarse.
                </p>
              </div>
            )}

            {domainStatus === "active" && (
              <p className="text-sm text-green-600 mt-2">
                Tu dominio está configurado correctamente y listo para usar.
              </p>
            )}

            {domainStatus === "failed" && (
              <p className="text-sm text-red-600 mt-2">
                Hubo un error con el certificado SSL. Verifica tu configuración
                DNS e intenta de nuevo.
              </p>
            )}

            {showSuccess && domainStatus === "active" && (
              <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <FiCheck size={16} />
                ¡Dominio verificado correctamente!
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
