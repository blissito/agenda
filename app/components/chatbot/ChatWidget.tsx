import { useCallback, useEffect, useRef, useState } from "react"
import {
  useFormmyChat,
  useFormmyOptional,
  getMessageText,
} from "@formmy.app/chat/react"

export interface ChatConfig {
  name: string
  avatarUrl: string
  primaryColor: string
  greeting: string
  farewell: string
  widgetStyle: "bubble" | "sidebar" | "bar"
}

interface ChatWidgetProps {
  agentId: string
  config: ChatConfig
}

interface ChatWidgetInlineProps {
  agentId: string
  config: ChatConfig
}

/**
 * Wrapper that only renders the chat if FormmyProvider is available.
 */
export function ChatWidget(props: ChatWidgetProps) {
  const formmy = useFormmyOptional()
  if (!formmy) return null
  return <ChatWidgetInner {...props} />
}

function ChatWidgetInner({ agentId, config }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useFormmyChat({
    agentId,
  })

  const isStreaming = status === "streaming"

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opening
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput("")
    await sendMessage(text)
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in"
          style={{ animationDuration: "150ms" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3 text-white"
            style={{ backgroundColor: config.primaryColor || "#5158F6" }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {config.avatarUrl ? (
                <img
                  src={config.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {config.name || "Asistente"}
              </p>
              <p className="text-xs opacity-80">
                {isStreaming ? "Escribiendo..." : "En linea"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[340px] bg-gray-50">
            {/* Greeting */}
            {config.greeting && messages.length === 0 && (
              <div className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: config.primaryColor || "#5158F6" }}
                >
                  {config.avatarUrl ? (
                    <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>
                <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2 text-sm text-gray-700 max-w-[260px]">
                  {config.greeting}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => {
              const text = getMessageText(msg)
              if (!text) return null
              const isUser = msg.role === "user"
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "gap-2"}`}
                >
                  {!isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: config.primaryColor || "#5158F6" }}
                    >
                      {config.avatarUrl ? (
                        <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )}
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 text-sm max-w-[260px] ${
                      isUser
                        ? "text-white rounded-xl rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-700 rounded-xl rounded-bl-sm"
                    }`}
                    style={isUser ? { backgroundColor: config.primaryColor || "#5158F6" } : undefined}
                  >
                    <p className="whitespace-pre-wrap break-words">{text}</p>
                  </div>
                </div>
              )
            })}

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.primaryColor || "#5158F6" }}
                />
                <div className="bg-white border border-gray-200 rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Powered by */}
          <div className="text-center py-1 bg-gray-50 border-t border-gray-100">
            <span className="text-[10px] text-gray-400">
              Powered by Formmy.app
            </span>
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand_blue/20"
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ backgroundColor: config.primaryColor || "#5158F6" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bubble trigger */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: config.primaryColor || "#5158F6" }}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </>
  )
}

/**
 * Inline (non-fixed) version for the dashboard preview.
 * Always visible, no bubble trigger, renders in document flow.
 */
export function ChatWidgetInline(props: ChatWidgetInlineProps) {
  const formmy = useFormmyOptional()
  if (!formmy) return <ChatWidgetInlineStatic config={props.config} />
  return <ChatWidgetInlineLive {...props} />
}

function ChatWidgetInlineLive({ agentId, config }: ChatWidgetInlineProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useFormmyChat({ agentId })
  const isStreaming = status === "streaming"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput("")
    await sendMessage(text)
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.05)] border border-gray-200 flex flex-col h-[560px] overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 text-white"
        style={{ backgroundColor: config.primaryColor || "#5158F6" }}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {config.avatarUrl ? (
            <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{config.name || "Asistente"}</p>
          <p className="text-xs opacity-80">{isStreaming ? "Escribiendo..." : "En linea"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {config.greeting && messages.length === 0 && (
          <div className="flex gap-2">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: config.primaryColor || "#5158F6" }}
            >
              {config.avatarUrl ? (
                <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2 text-sm text-gray-700 max-w-[250px]">
              {config.greeting}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const text = getMessageText(msg)
          if (!text) return null
          const isUser = msg.role === "user"
          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "gap-2"}`}>
              {!isUser && (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: config.primaryColor || "#5158F6" }}
                >
                  {config.avatarUrl ? (
                    <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>
              )}
              <div
                className={`px-3 py-2 text-sm max-w-[260px] ${
                  isUser
                    ? "text-white rounded-xl rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-700 rounded-xl rounded-bl-sm"
                }`}
                style={isUser ? { backgroundColor: config.primaryColor || "#5158F6" } : undefined}
              >
                <p className="whitespace-pre-wrap break-words">{text}</p>
              </div>
            </div>
          )
        })}

        {isStreaming && messages.length > 0 && !getMessageText(messages[messages.length - 1]) && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: config.primaryColor || "#5158F6" }} />
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Powered by */}
      <div className="text-center py-1 bg-gray-50 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">Powered by Formmy.app</span>
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand_blue/20"
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
          style={{ backgroundColor: config.primaryColor || "#5158F6" }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/** Static fallback when FormmyProvider is not available */
function ChatWidgetInlineStatic({ config }: { config: ChatConfig }) {
  return (
    <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.05)] border border-gray-200 flex flex-col h-[560px] overflow-hidden">
      <div
        className="px-4 py-3 flex items-center gap-3 text-white"
        style={{ backgroundColor: config.primaryColor || "#5158F6" }}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {config.avatarUrl ? (
            <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </div>
        <p className="font-semibold text-sm truncate">{config.name || "Asistente"}</p>
      </div>
      <div className="flex-1 px-4 py-3 bg-gray-50">
        <div className="flex gap-2">
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: config.primaryColor || "#5158F6" }}
          >
            {config.avatarUrl ? (
              <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2 text-sm text-gray-700 max-w-[250px]">
            {config.greeting || "¡Hola!"}
          </div>
        </div>
      </div>
      <div className="text-center py-1 bg-gray-50 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">Powered by Formmy.app</span>
      </div>
      <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center gap-2">
        <div className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-400">
          Escribe un mensaje...
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center opacity-30"
          style={{ backgroundColor: config.primaryColor || "#5158F6" }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
