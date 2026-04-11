/**
 * @file ConversationHistory.tsx
 * @description Componente encargado de listar las conversaciones pasadas con el agente IA
 * y gestionar la selección, visualización y eliminación de estas.
 * @author Agent
 * @date 2026-04-08
 */

import React, { useState, useCallback, useMemo } from "react"
import { useFetcher } from "react-router"
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

    return (
      <div
        className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-all border ${
          selectedConversation?.id === id
            ? "bg-brand_blue/10 border-brand_blue shadow-md"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => handleConversationClick(id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(id)
          }}
          className="text-gray-400 hover:text-yellow-500 mr-2 transition-colors"
          aria-label="Marcar como favorito"
        >
          {isFavorite ? '⭐' : '☆'}
        </button>

        <div className="flex-grow min-w-0">
          <p className="text-sm font-semibold text-brand_dark truncate">{name || `Sesión ${sessionId}`}</p>
          <p className="text-xs text-brand_gray truncate">
            {sessionId ? `ID: ${sessionId.substring(0, 10)}...` : "Sin título"}
          </p>
        </div>

        <div className="flex space-x-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}
            className="text-red-400 hover:text-red-600 p-1 rounded-full transition-colors"
            aria-label="Eliminar conversación"
          >
            🗑️
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6 min-h-[calc(100vh-220px)]">
      {/* Left — Conversation list */}
      <div className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar conversaciones por nombre o ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand_blue focus:border-brand_blue shadow-sm text-sm"
          />
        </div>

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
      <div className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-satoBold text-brand_dark">
                  {selectedConversation.name || `Sesión ${selectedConversation.sessionId}`}
                </p>
                <p className="text-xs text-brand_gray">
                  {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => onSelectConversation("")}
                className="text-brand_gray hover:text-brand_dark text-sm lg:hidden"
              >
                ← Volver
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 max-h-[calc(100vh-320px)]">
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
                        className={`px-3 py-2 rounded-xl text-sm max-w-[75%] ${
                          isUser
                            ? "bg-brand_blue text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm"
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