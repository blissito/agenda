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
    <div className="flex flex-col h-full">
      {/* Input de Búsqueda */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <input
          type="text"
          placeholder="Buscar conversaciones por nombre o ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand_blue focus:border-brand_blue shadow-sm"
        />
      </div>

      {/* Lista de Conversaciones */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center p-8 text-brand_gray">Cargando conversaciones...</div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-brand_gray">
            {searchQuery ? "No se encontraron conversaciones con ese término." : "Aún no tienes conversaciones guardadas. Activa Ghosty para empezar."}
          </div>
        )}

        {/* Control de Carga Adicional */}
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full py-2 mt-4 text-brand_blue border border-brand_blue rounded-lg hover:bg-brand_blue/10 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Cargando más..." : "Cargar más conversaciones"}
          </button>
        )}
      </div>
    </div>
  )
}

export { ConversationHistory }
export default ConversationHistory