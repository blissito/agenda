import { useEffect, useState } from "react"
import { useFetcher } from "react-router"
import { ChatbotConfig } from "~/components/chatbot/ChatbotConfig"
import { ConversationHistory } from "~/components/chatbot/ConversationHistory"
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
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const isActivating =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "activate"

  if (!agentId) {
    return (
      <section className="flex flex-col items-center justify-center h-[calc(100svh-120px)] text-center">
        <img
          src="/images/illustrations/ghosty-puzzle.svg"
          alt="Ghosty - asistente inteligente"
          className="mb-8 w-[304px] h-[206px]"
        />
        <h1 className="text-2xl font-satoBold text-brand_dark mb-2">
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "conversations", label: "Conversaciones" },
    { id: "config", label: "Configuración" },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-satoBold text-brand_dark">Chatbot</h1>
        <p className="text-sm text-brand_gray mt-1">
          Gestiona las conversaciones y configura tu asistente.
        </p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-satoMedium transition-all ${
              activeTab === tab.id
                ? "bg-white text-brand_dark shadow-sm"
                : "text-gray-500 hover:text-brand_dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
            setIsLoadingMessages(true)
            try {
              const formData = new FormData()
              formData.set("intent", "get_messages")
              formData.set("conversationId", id)
              const response = await fetch("/dash/chatbot", {
                method: "POST",
                body: formData,
              })
              const data = await response.json()
              if (data.conversation) {
                setSelectedConversation(data.conversation)
                setMessages(data.conversation.messages || [])
              }
            } catch (e) {
              console.error("Error fetching messages:", e)
            } finally {
              setIsLoadingMessages(false)
            }
          }}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onDelete={async (id) => {
            const formData = new FormData()
            formData.set("intent", "delete_conversation")
            formData.set("conversationId", id)
            await fetch("/dash/chatbot", { method: "POST", body: formData })
            setConversations((prev: any[]) => prev.filter((c) => c.id !== id))
            if (selectedConversation?.id === id) {
              setSelectedConversation(null)
              setMessages([])
            }
          }}
          onToggleFavorite={async (id) => {
            const formData = new FormData()
            formData.set("intent", "toggle_favorite")
            formData.set("conversationId", id)
            const response = await fetch("/dash/chatbot", {
              method: "POST",
              body: formData,
            })
            const data = await response.json()
            setConversations((prev: any[]) =>
              prev.map((c) =>
                c.id === id ? { ...c, isFavorite: data.isFavorite } : c,
              ),
            )
            if (selectedConversation?.id === id) {
              setSelectedConversation((prev: any) =>
                prev ? { ...prev, isFavorite: data.isFavorite } : null,
              )
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {saveMessage}
        </div>
      )}
    </div>
  )
}
