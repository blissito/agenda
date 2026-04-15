import { useEffect, useState } from "react"
import { useFetcher } from "react-router"
import { ChatbotConfig } from "~/components/chatbot/ChatbotConfig"
import { ConversationHistory } from "~/components/chatbot/ConversationHistory"
import { EditSquare } from "~/components/icons/EditSquare"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import type { Route } from "./+types/dash.chatbot"

export { loader, action } from "./dash.chatbot.server"

type Tab = "conversations" | "config"

export default function ChatbotPage({ loaderData }: Route.ComponentProps) {
  const {
    agentId,
    chatbotConfig,
    conversations: initialConversations,
    hasMore: initialHasMore,
    avatarPutUrl,
    avatarKey,
  } = loaderData
  const [activeTab, setActiveTab] = useState<Tab>("conversations")
  const fetcher = useFetcher()
  const saveFetcher = useFetcher()
  const messageFetcher = useFetcher()

  const isSaving = saveFetcher.state !== "idle"
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (saveFetcher.state !== "idle" || !saveFetcher.data) return
    const data = saveFetcher.data as { success?: boolean; warning?: string }
    if (data.success) {
      setSaveMessage(data.warning || "Configuracion guardada")
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [saveFetcher.state, saveFetcher.data])

  const [conversations, setConversations] = useState(initialConversations)
  useEffect(() => {
    setConversations(initialConversations)
  }, [initialConversations])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const isLoadingMessages =
    messageFetcher.state !== "idle" &&
    messageFetcher.formData?.get("intent") === "get_messages"

  useEffect(() => {
    if (messageFetcher.state !== "idle" || !messageFetcher.data) return
    const data = messageFetcher.data as { conversation?: any }
    if (data.conversation) {
      setSelectedConversation(data.conversation)
      setMessages(data.conversation.messages || [])
    }
  }, [messageFetcher.state, messageFetcher.data])
  const [searchQuery, setSearchQuery] = useState("")

  const isActivating =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "activate"

  if (!agentId) {
    return (
      <section className="flex flex-col items-center justify-center h-[calc(100svh-120px)] text-center">
        <img
          src="/images/illustrations/ghosty-puzzle.svg"
          alt="Ghosty - asistente inteligente"
          className="mb-8 w-[200px] h-auto md:w-[304px] md:h-[206px]"
        />
        <h1 className="text-xl md:text-2xl font-satoBold text-brand_dark mb-2">
          Conoce a Ghosty: tu asistente inteligente de agendamiento
        </h1>
        <p className="text-base text-brand_gray max-w-2xl">
          Deník trabaja con FormmyApp para potenciar tu agenda digital con
          Inteligencia Artificial.
        </p>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="activate" />
          <button
            type="submit"
            disabled={isActivating}
            className="mt-8 bg-brand_blue text-white font-satoMedium text-base px-6 h-12 rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isActivating ? "Activando..." : "Activar Ghosty"}
          </button>
        </fetcher.Form>
      </section>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100svh-120px)] lg:h-[calc(100svh-80px)]">
      <div className="mb-4">
        {activeTab === "config" ? (
          <Breadcrumb className="text-brand_gray">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab("conversations")
                  }}
                  className="cursor-pointer"
                >
                  Ghosty: Tu chatbot IA
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                  Configuración de Chatbot
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="text-2xl md:text-3xl font-satoBold text-brand_dark">
            Ghosty: Tu chatbot IA
          </h1>
        )}
      </div>

      {activeTab === "conversations" && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar mensaje"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3 bg-white rounded-full border-0 focus:outline-none focus:ring-0 text-sm"
            />
          </div>
          <button
            onClick={() => setActiveTab("config")}
            className="flex items-center justify-center w-11 h-11 bg-white rounded-full text-gray-600 hover:text-brand_blue transition-colors"
            aria-label="Configurar chatbot"
          >
            <EditSquare className="w-5 h-5" />
          </button>
        </div>
      )}

      {activeTab === "conversations" && (
        <ConversationHistory
          conversations={
            searchQuery
              ? conversations.filter((c: any) =>
                  (c.name || c.sessionId || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
              : conversations
          }
          isLoading={false}
          hasMore={initialHasMore}
          onLoadMore={() => {}}
          selectedConversation={selectedConversation}
          onSelectConversation={async (id) => {
            if (!id) {
              setSelectedConversation(null)
              setMessages([])
              return
            }
            // Optimistic: marcar la conversación como seleccionada ya
            const stub = conversations.find((c: any) => c.id === id)
            if (stub) {
              setSelectedConversation({ ...stub, messages: [] })
              setMessages([])
            }
            messageFetcher.submit(
              { intent: "get_messages", conversationId: id },
              { method: "post" },
            )
          }}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onDelete={async (id) => {
            fetcher.submit(
              { intent: "delete_conversation", conversationId: id },
              { method: "post" },
            )
            setConversations((prev: any[]) => prev.filter((c) => c.id !== id))
            if (selectedConversation?.id === id) {
              setSelectedConversation(null)
              setMessages([])
            }
          }}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
      )}

      {activeTab === "config" && (
        <ChatbotConfig
          initialConfig={chatbotConfig || undefined}
          agentId={agentId || undefined}
          onSave={(config) => {
            saveFetcher.submit(
              { intent: "save_config", config: JSON.stringify(config) },
              { method: "post" },
            )
          }}
          isSaving={isSaving}
          avatarPutUrl={avatarPutUrl || undefined}
          avatarKey={avatarKey}
        />
      )}

      {saveMessage && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="px-5 py-3 bg-white text-brand_dark rounded-full shadow-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap pointer-events-auto">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            {saveMessage}
          </div>
        </div>
      )}
    </div>
  )
}
