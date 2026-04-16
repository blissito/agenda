/**
 * @file ConversationHistory.tsx
 * @description Componente encargado de listar las conversaciones pasadas con el agente IA
 * y gestionar la selección, visualización y eliminación de estas.
 * @author Agent
 * @date 2026-04-08
 */

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { useFetcher } from "react-router"
import {
  ParticleLayer,
  playBurstSound,
  useParticleBurst,
} from "~/components/common/ParticleBurst"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { Trash } from "~/components/icons/trash"
import { Download } from "~/components/icons/download"
import { ClientFace } from "~/components/icons/clientFace"
import { Tooltip } from "~/components/common/Tooltip"
interface Conversation {
  id: string
  name?: string
  sessionId?: string
  isFavorite?: boolean
  [key: string]: any
}

interface ConversationHistoryProps {
  conversations: Conversation[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void // Función stub, puede ser implementada más tarde
  selectedConversation: Conversation | null // La conversación actualmente activa
  onSelectConversation: (conversationId: string) => Promise<void>
  messages: any[] // Array de mensajes para la conversación seleccionada
  isLoadingMessages: boolean
  onDelete: (conversationId: string) => Promise<void>
  onSearch: (query: string) => void // Callback para actualizar el estado de búsqueda
  searchQuery: string // El término de búsqueda actual
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  isLoading,
  hasMore,
  onLoadMore,
  selectedConversation,
  onSelectConversation,
  messages,
  isLoadingMessages,
  onDelete,
  onSearch,
  searchQuery,
}) => {
  const fetcher = useFetcher()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Reescribe nombres genéricos del proveedor (ej. "SDA User 1", "SDK User 1",
  // "Web User 1", "Anonymous 1") como "Usuario Web #1".
  const displayName = useCallback((conversation: any): string => {
    const raw = (conversation?.name || "").trim()
    const match = raw.match(
      /^(?:SDA|SDK|Web|Anon(?:ymous)?|Visitor|Guest|User)[\s_-]*(?:User|Visitor|Guest)?[\s#_-]*(\d+)$/i,
    )
    if (match) return `Usuario Web #${match[1]}`
    if (!raw) {
      const sid = conversation?.sessionId || ""
      return sid ? `Usuario Web #${sid.slice(-4)}` : "Usuario Web"
    }
    return raw
  }, [])

  const handleDownload = useCallback(() => {
    if (!selectedConversation) return
    const title = displayName(selectedConversation)
    const lines = messages
      .map((msg: any) => {
        const text = msg.content || msg.text || ""
        if (!text) return null
        const role = msg.role === "user" ? "Usuario" : "Asistente"
        const stamp = msg.createdAt
          ? new Date(msg.createdAt).toLocaleString("es-MX")
          : ""
        return `[${stamp}] ${role}: ${text}`
      })
      .filter(Boolean)
      .join("\n\n")
    const blob = new Blob([`${title}\n\n${lines}`], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/[^a-z0-9-_]+/gi, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [selectedConversation, messages, displayName])

  // Función para manejar la búsqueda de manera eficiente
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }, [onSearch])

  // Memoizar la lista filtrada para evitar recálculos innecesarios
  const filteredConversations = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return conversations.filter((c: any) =>
      `${displayName(c)} ${c.sessionId || ""}`.toLowerCase().includes(q),
    )
  }, [conversations, searchQuery, displayName])

  // Manejador de click en la conversación
  const handleConversationClick = useCallback(async (id: string) => {
    await onSelectConversation(id)
  }, [onSelectConversation])

  // Renderizado de una sola tarjeta de conversación
  const ConversationCard: React.FC<{ conversation: any }> = ({ conversation }) => {
    const { id, sessionId, isFavorite } = conversation
    const name = displayName(conversation)
    const { particles, burst } = useParticleBurst({ count: 10 })
    const isLoadingThis = isLoadingMessages && selectedConversation?.id === id

    return (
      <div
        className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
          selectedConversation?.id === id
            ? "bg-brand_blue/10"
            : "hover:bg-gray-50"
        }`}
        onClick={() => {
          burst()
          playBurstSound()
          handleConversationClick(id)
        }}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-brand_blue/10 flex-shrink-0">
          <ClientFace className="w-full h-full" />
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-satoBold text-brand_dark truncate">
              {name}
            </p>
            {isFavorite && (
              <svg className="w-3 h-3 text-brand_blue flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </div>
          <p className="text-xs text-brand_gray truncate">
            {sessionId ? `Con quién hablaste hace 6 d...` : "Sin mensajes"}
          </p>
        </div>

        {isLoadingThis && (
          <span className="inline-block h-3 w-3 rounded-full border-2 border-brand_blue/30 border-t-brand_blue animate-spin" />
        )}
        <ParticleLayer particles={particles} />
      </div>
    )
  }

  const isMobileDetailOpen = !!selectedConversation
  const [sheetMounted, setSheetMounted] = useState(false)
  const [sheetVisible, setSheetVisible] = useState(false)

  useEffect(() => {
    if (isMobileDetailOpen) {
      setSheetMounted(true)
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setSheetVisible(true))
      })
      document.body.style.overflow = "hidden"
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        document.body.style.overflow = ""
      }
    } else if (sheetMounted) {
      setSheetVisible(false)
      const t = setTimeout(() => setSheetMounted(false), 260)
      return () => clearTimeout(t)
    }
  }, [isMobileDetailOpen])

  const detailInner = selectedConversation ? (
    <>
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onSelectConversation("")}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-brand_gray hover:bg-gray-100 flex-shrink-0"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-brand_blue/10 flex-shrink-0">
            <ClientFace className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <p className="font-satoBold text-base text-brand_dark truncate">
              {displayName(selectedConversation)}
            </p>
            <p className="text-[11px] text-brand_gray">
              {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip label="Descargar conversación">
            <button
              onClick={handleDownload}
              disabled={messages.length === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full text-brand_gray hover:bg-gray-200 hover:text-brand_dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Descargar"
            >
              <Download className="w-8 h-8" fill="currentColor" />
            </button>
          </Tooltip>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setConfirmDeleteId(selectedConversation.id)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-brand_red hover:bg-brand_red/20 transition-colors"
            aria-label="Eliminar conversación"
            title="Eliminar conversación"
          >
            <Trash className="w-8 h-8" fill="currentColor" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
        {isLoadingMessages ? (
          <div className="text-center p-8 text-brand_gray">Cargando mensajes...</div>
        ) : messages.length > 0 ? (
          messages.map((msg: any, i: number) => {
            const isUser = msg.role === "user"
            const text = msg.content || msg.text || ""
            if (!text) return null
            return (
              <div key={msg.id || i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] shadow-sm ${
                    isUser
                      ? "bg-brand_dark text-white rounded-br-sm"
                      : "bg-white border border-gray-100 text-brand_dark rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{text}</p>
                  {msg.createdAt && (
                    <p className={`text-[10px] mt-1 ${isUser ? "text-white/60" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-8 text-brand_gray text-sm">Sin mensajes</div>
        )}
      </div>
    </>
  ) : (
    <div className="flex-1 flex items-center justify-center text-brand_gray text-sm">
      Selecciona una conversación para ver los mensajes
    </div>
  )

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[320px,1fr] gap-4 md:gap-6 flex-1 min-h-0">
      {/* Left — Conversation list */}
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden flex-1 lg:flex-initial min-h-0">
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="text-center p-8 text-brand_gray">Cargando...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))
          ) : (
            <div className="text-center p-8 text-brand_gray text-sm">
              {searchQuery ? "Sin resultados." : "No hay conversaciones aún."}
            </div>
          )}

          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full py-2 mt-2 text-brand_blue border border-brand_blue rounded-lg hover:bg-brand_blue/10 transition-colors disabled:opacity-50 text-sm"
            >
              Cargar más
            </button>
          )}
        </div>
      </div>

      {/* Right — Messages panel (desktop inline). */}
      <div
        className="hidden lg:flex bg-white rounded-2xl flex-col overflow-hidden relative"
        style={{
          backgroundImage: "url('/images/denik-pattern.svg')",
          backgroundRepeat: "repeat",
        }}
      >
        {detailInner}
      </div>

      {/* Mobile bottom sheet portal */}
      {sheetMounted && typeof document !== "undefined" &&
        createPortal(
          <div className="lg:hidden fixed inset-0" style={{ zIndex: 100 }}>
            <div
              className={`absolute inset-0 bg-black transition-opacity ease-out ${
                sheetVisible ? "opacity-50 duration-[400ms]" : "opacity-0 duration-[220ms]"
              }`}
              onClick={() => onSelectConversation("")}
            />
            <div
              className={`absolute inset-x-0 bottom-0 top-0 bg-white flex flex-col overflow-hidden will-change-transform ${
                sheetVisible ? "translate-y-0" : "translate-y-full"
              }`}
              style={{
                backgroundImage: "url('/images/denik-pattern.svg')",
                backgroundRepeat: "repeat",
                transitionProperty: "transform",
                transitionDuration: sheetVisible ? "400ms" : "260ms",
                transitionTimingFunction: sheetVisible
                  ? "cubic-bezier(0.16, 1, 0.3, 1)"
                  : "cubic-bezier(0.4, 0, 1, 1)",
                boxShadow: sheetVisible
                  ? "0 -12px 40px -8px rgba(0,0,0,0.25)"
                  : "none",
              }}
            >
              {detailInner}
            </div>
          </div>,
          document.body,
        )}

      {typeof document !== "undefined" &&
        createPortal(
          <div style={{ position: "relative", zIndex: 200 }}>
            <ConfirmModal
              isOpen={confirmDeleteId !== null}
              onClose={() => setConfirmDeleteId(null)}
              onConfirm={async () => {
                if (!confirmDeleteId) return
                const id = confirmDeleteId
                setConfirmDeleteId(null)
                await onDelete(id)
              }}
              title="¿Eliminar conversación?"
              description="Se borrará el historial de mensajes de esta conversación. Esta acción no se puede deshacer."
              confirmText="Eliminar"
              variant="danger"
              emoji="🗑️"
            />
          </div>,
          document.body,
        )}
    </div>
  )
}

export { ConversationHistory }
export default ConversationHistory