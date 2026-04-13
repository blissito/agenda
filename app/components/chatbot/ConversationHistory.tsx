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
  onToggleFavorite: (conversationId: string) => Promise<void>
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
  onToggleFavorite,
  onSearch,
  searchQuery,
}) => {
  const fetcher = useFetcher()

  // Función para manejar la búsqueda de manera eficiente
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }, [onSearch])

  // Memoizar la lista filtrada para evitar recálculos innecesarios
  const filteredConversations = useMemo(() => {
    return conversations.filter((c: any) =>
      (c.name || c.sessionId || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  // Manejador de click en la conversación
  const handleConversationClick = useCallback(async (id: string) => {
    await onSelectConversation(id)
  }, [onSelectConversation])

  // Renderizado de una sola tarjeta de conversación
  const ConversationCard: React.FC<{ conversation: any }> = ({ conversation }) => {
    const { id, name, sessionId, isFavorite } = conversation
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
        <img
          src="/images/nik.svg"
          alt=""
          className="w-9 h-9 rounded-full bg-brand_blue/10 p-1.5 flex-shrink-0"
        />

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-satoBold text-brand_dark truncate">
              {name || `Sesión ${sessionId}`}
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
    <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 min-h-[calc(100vh-220px)]">
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
                <img
                  src="/images/nik.svg"
                  alt=""
                  className="w-9 h-9 rounded-full bg-brand_blue/10 p-1.5"
                />
                <div>
                  <p className="font-satoBold text-sm text-brand_dark">
                    {selectedConversation.name || `Sesión ${selectedConversation.sessionId}`}
                  </p>
                  <p className="text-[11px] text-brand_gray">
                    {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFavorite(selectedConversation.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-brand_blue/10 text-brand_blue hover:bg-brand_blue/20 transition-colors"
                  aria-label="Favorito"
                >
                  <svg className="w-4 h-4" fill={selectedConversation.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 hover:bg-orange-200 transition-colors"
                  aria-label="Descargar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(selectedConversation.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                  aria-label="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[calc(100vh-320px)]">
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
    </div>
  )
}

export { ConversationHistory }
export default ConversationHistory