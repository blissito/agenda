/**
 * @file ConversationHistory.tsx
 * @description Componente encargado de listar las conversaciones pasadas con el agente IA
 * y gestionar la selección, visualización y eliminación de estas.
 * @author Agent
 * @date 2026-04-08
 */

import React, { useState, useCallback, useMemo } from "react"
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 md:gap-6 flex-1 min-h-0">
      {/* Left — Conversation list */}
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden">
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

      {/* Right — Messages panel */}
      <div
        className="bg-white rounded-2xl flex flex-col overflow-hidden relative"
        style={{
          backgroundImage: "url('/images/denik-pattern.svg')",
          backgroundRepeat: "repeat",
        }}
      >
        {selectedConversation ? (
          <>
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-brand_blue/10">
                  <ClientFace className="w-full h-full" />
                </div>
                <div>
                  <p className="font-satoBold text-base text-brand_dark">
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
                <Tooltip label="Eliminar conversación">
                  <button
                    onClick={() => setConfirmDeleteId(selectedConversation.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-brand_red hover:bg-brand_red/20 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash className="w-8 h-8" fill="currentColor" />
                  </button>
                </Tooltip>
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
        )}
      </div>

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
    </div>
  )
}

export { ConversationHistory }
export default ConversationHistory