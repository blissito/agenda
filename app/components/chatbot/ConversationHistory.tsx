import { useEffect, useRef, useState } from "react"
import {
  formatDateSeparator,
  formatMessageTime,
  formatRelativeTime,
  groupMessagesByDate,
} from "./utils"

// Types matching the Formmy SDK shape
interface ConversationSummary {
  id: string
  sessionId: string
  name?: string
  status: string
  messageCount: number
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[]
}

interface ConversationHistoryProps {
  conversations: ConversationSummary[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  selectedConversation: ConversationDetail | null
  onSelectConversation: (id: string | null) => void
  messages: ConversationMessage[]
  isLoadingMessages: boolean
  onDelete: (id: string) => Promise<void>
  onToggleFavorite: (id: string) => Promise<void>
  onSearch: (query: string) => void
  searchQuery: string
}

function RobotIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h0m6 0h0m-5 4h4"
      />
    </svg>
  )
}

// Chat wallpaper pattern as inline SVG background
const chatPatternBg = {
  backgroundColor: "#f0f2f5",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
}

export function ConversationHistory({
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
}: ConversationHistoryProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  // Infinite scroll observer
  useEffect(() => {
    if (!listEndRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { threshold: 0.1 },
    )
    observer.observe(listEndRef.current)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      await onDelete(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const messageGroups =
    messages.length > 0 ? groupMessagesByDate(messages) : new Map()

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Left panel - Conversation list */}
      <div className="w-[278px] border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar mensaje"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand_blue/20"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-brand_blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-8">
              <RobotIcon className="w-12 h-12 mb-3" />
              <p className="text-sm text-center font-satoMedium">
                No hay conversaciones aun
              </p>
            </div>
          ) : (
            <>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full h-[72px] px-3 flex items-center gap-3 transition-colors text-left border-b border-gray-100 ${
                    selectedConversation?.id === conv.id
                      ? "bg-brand_blue/10"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <RobotIcon className="w-5 h-5 text-white" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-satoBold text-sm text-brand_dark truncate">
                        {conv.name || `Visitante ${conv.sessionId.slice(-4)}`}
                      </span>
                      <span className="text-[11px] text-brand_gray flex-shrink-0 ml-2">
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-brand_gray truncate mt-0.5">
                      {conv.messageCount} mensajes
                    </p>
                  </div>
                </button>
              ))}
              {hasMore && <div ref={listEndRef} className="h-8" />}
            </>
          )}
        </div>
      </div>

      {/* Right panel - Message thread */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div
            className="flex-1 flex flex-col items-center justify-center"
            style={chatPatternBg}
          >
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-4 shadow-sm">
              <RobotIcon className="w-8 h-8 text-brand_gray" />
            </div>
            <p className="font-satoMedium text-brand_gray">
              Selecciona una conversacion
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-[72px] px-5 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <RobotIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-satoBold text-sm text-brand_dark">
                    {selectedConversation.name ||
                      `Usuario web ${selectedConversation.sessionId.slice(-3)}`}
                  </h3>
                  <p className="text-xs text-brand_gray">
                    {new Date(
                      selectedConversation.createdAt,
                    ).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    ,{" "}
                    {new Date(
                      selectedConversation.createdAt,
                    ).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Robot / AI toggle */}
                <button
                  onClick={() => onToggleFavorite(selectedConversation.id)}
                  className="w-9 h-9 rounded-full bg-brand_blue flex items-center justify-center hover:bg-brand_blue/90 transition-colors"
                  title={
                    selectedConversation.isFavorite
                      ? "Quitar favorito"
                      : "Marcar favorito"
                  }
                >
                  <RobotIcon className="w-4 h-4 text-white" />
                </button>
                {/* Download */}
                <button
                  onClick={() => {
                    const data = messages
                      .map(
                        (m) =>
                          `[${formatMessageTime(m.createdAt)}] ${m.role}: ${m.content}`,
                      )
                      .join("\n")
                    const blob = new Blob([data], { type: "text/plain" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `conversacion-${selectedConversation.id.slice(-6)}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  title="Descargar conversacion"
                >
                  <svg
                    className="w-[18px] h-[18px] text-brand_gray"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={() => handleDelete(selectedConversation.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    confirmDelete === selectedConversation.id
                      ? "bg-red-50 text-red-500"
                      : "hover:bg-gray-100 text-brand_gray"
                  }`}
                  title={
                    confirmDelete === selectedConversation.id
                      ? "Click para confirmar"
                      : "Eliminar"
                  }
                >
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4"
              style={chatPatternBg}
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-brand_blue border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {Array.from(messageGroups.entries()).map(
                    ([dateKey, msgs]) => (
                      <div key={dateKey}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 bg-white/80 rounded-lg text-xs text-brand_gray shadow-sm font-satoMedium">
                            {formatDateSeparator(
                              (msgs as ConversationMessage[])[0].createdAt,
                            )}
                          </span>
                        </div>
                        {/* Messages */}
                        {(msgs as ConversationMessage[]).map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex mb-3 ${
                              msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                msg.role === "user"
                                  ? "bg-brand_dark text-white rounded-2xl rounded-br-md"
                                  : "bg-white text-brand_dark rounded-2xl rounded-bl-md"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
