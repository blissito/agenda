import { useEffect, useRef, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import { getMessagesSince } from "~/lib/nanoclaw.server";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: string | null;
  createdAt: string;
};

const SUGGESTIONS = [
  "¿Qué citas tengo hoy?",
  "Resume mis ventas de la semana",
  "Recuérdame mis próximos pendientes",
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  // Auto-limpiar pending stale (>2min): si Nanoclaw no respondió en ese
  // tiempo, el mensaje está huérfano — mejor borrarlo que mostrar duplicados.
  const staleThreshold = new Date(Date.now() - 2 * 60 * 1000);
  await db.assistantMessage.deleteMany({
    where: {
      orgId: org.id,
      role: "user",
      status: "pending",
      createdAt: { lt: staleThreshold },
    },
  });

  const messages = await getMessagesSince(org.id);
  const host = request.headers.get("host") ?? "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  return { initialMessages: messages, isLocalhost };
};

export default function AsistenteIA() {
  const { initialMessages, isLocalhost } = useLoaderData<typeof loader>();
  const [messages, setMessages] = useState<Msg[]>(
    initialMessages.map((m: any) => ({ ...m, createdAt: String(m.createdAt) })),
  );
  const [input, setInput] = useState("");
  const sendFetcher = useFetcher();
  const pollFetcher = useFetcher<{ messages: Msg[] }>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const waitingAssistant =
    !isLocalhost &&
    messages.some((m) => m.role === "user" && m.status === "pending");

  // Polling a 1s mientras haya mensaje pendiente (nunca en localhost)
  useEffect(() => {
    if (!waitingAssistant || isLocalhost) return;
    const id = setInterval(() => {
      const last = messages[messages.length - 1];
      const since = last ? new Date(last.createdAt).toISOString() : "";
      pollFetcher.load(`/api/asistente?since=${encodeURIComponent(since)}`);
    }, 1000);
    return () => clearInterval(id);
  }, [waitingAssistant, messages]);

  useEffect(() => {
    const fetched = pollFetcher.data?.messages;
    if (!fetched?.length) return;
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const incoming = fetched
        .filter((m: any) => !ids.has(m.id))
        .map((m: any) => ({ ...m, createdAt: String(m.createdAt) }));
      if (!incoming.length) return prev;
      // Reemplazar optimistic (tmp_*) por el real cuando llega del server
      const incomingUser = incoming.filter((m) => m.role === "user");
      const hasAssistant = incoming.some((m) => m.role === "assistant");
      const next = prev
        .filter(
          (m) =>
            !(
              m.id.startsWith("tmp_") &&
              incomingUser.some((inc) => inc.content === m.content)
            ),
        )
        .map((m) =>
          hasAssistant && m.role === "user" && m.status === "pending"
            ? { ...m, status: "delivered" }
            : m,
        );
      return [...next, ...incoming];
    });
  }, [pollFetcher.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, waitingAssistant]);

  useEffect(() => {
    if (sendFetcher.state === "submitting" && sendFetcher.formData) {
      const content = String(sendFetcher.formData.get("content") || "");
      if (!content) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp_${Date.now()}`,
          role: "user",
          content,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [sendFetcher.state]);

  const submit = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const fd = new FormData();
    fd.set("intent", "send");
    fd.set("content", trimmed);
    sendFetcher.submit(fd, { method: "post", action: "/api/asistente" });
    setInput("");
  };

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const isEmpty = messages.length === 0;

  const onReset = () => {
    if (!confirm("¿Borrar toda la conversación?")) return;
    const fd = new FormData();
    fd.set("intent", "reset");
    fetch("/api/asistente", { method: "POST", body: fd }).then(() => {
      setMessages([]);
    });
  };

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto px-6 pt-8 pb-4 gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-satoBold text-brand_dark">
            Enciende tu asistente IA
          </h1>
          <p className="text-sm text-brand_iron mt-1">
            Tu asistente personal conectado a tu agenda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onReset}
              className="text-xs font-satoMedium text-brand_iron hover:text-brand_dark transition px-3 py-1.5 rounded-full border border-brand_stroke bg-white"
              title="Borrar toda la conversación"
            >
              Nueva conversación
            </button>
          )}
          <WhatsAppChip />
        </div>
      </header>

      {isLocalhost && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 font-satoMedium">
          <span className="font-satoBold">Asistente no disponible en localhost.</span>{" "}
          Esta función requiere el droplet de Nanoclaw en producción. Pruébala en{" "}
          <a
            href="https://www.denik.me/dash/asistente"
            className="underline hover:text-amber-700"
          >
            denik.me
          </a>
          .
        </div>
      )}

      <section className="flex-1 overflow-auto flex flex-col gap-3 -mx-2 px-2">
        {isEmpty ? (
          <div className="m-auto flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand_blue/10 flex items-center justify-center text-2xl">
              ✨
            </div>
            <p className="text-sm text-brand_iron max-w-xs">
              Pregúntale algo a tu asistente para empezar.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left text-sm font-satoMedium text-brand_dark bg-white border border-brand_stroke rounded-full px-4 py-2.5 hover:border-brand_blue hover:text-brand_blue transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "self-end max-w-[75%] rounded-2xl rounded-br-sm bg-brand_blue text-white px-4 py-2.5 text-sm whitespace-pre-wrap font-satoMedium"
                  : "self-start max-w-[75%] rounded-2xl rounded-bl-sm bg-white text-brand_dark px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm font-satoMedium"
              }
            >
              {m.content}
            </div>
          ))
        )}
        {waitingAssistant && <TypingDots />}
        <div ref={bottomRef} />
      </section>

      <form
        onSubmit={onSend}
        className="flex items-center gap-2 bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] pl-5 pr-1.5 py-1.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isLocalhost
              ? "Disponible solo en producción…"
              : "Escribe un mensaje…"
          }
          disabled={isLocalhost}
          className="flex-1 bg-transparent text-sm outline-none border-0 ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-brand_iron font-satoMedium disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isLocalhost || !input.trim() || sendFetcher.state !== "idle"}
          className="w-10 h-10 rounded-full bg-brand_blue text-white flex items-center justify-center disabled:opacity-40 transition hover:-translate-y-0.5 active:translate-y-0"
          aria-label="Enviar"
        >
          <SendIcon />
        </button>
      </form>
    </main>
  );
}

const TypingDots = () => (
  <div className="self-start flex gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-sm shadow-sm">
    {[0, 150, 300].map((d) => (
      <span
        key={d}
        className="w-1.5 h-1.5 rounded-full bg-brand_iron animate-bounce"
        style={{ animationDelay: `${d}ms`, animationDuration: "1s" }}
      />
    ))}
  </div>
);

const SendIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2 11 13" />
    <path d="M22 2l-7 20-4-9-9-4z" />
  </svg>
);

function WhatsAppChip() {
  const [open, setOpen] = useState(false);
  const phone = "5217712412825";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-satoMedium text-brand_dark bg-white border border-brand_stroke rounded-full px-3 py-1.5 hover:border-brand_blue transition"
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366]" />
        WhatsApp
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-brand_stroke bg-white p-4 shadow-lg text-sm z-10">
          <p className="font-satoBold text-brand_dark mb-1">
            Habla con tu asistente por WhatsApp
          </p>
          <p className="text-brand_iron text-xs mb-3">
            Envía un mensaje para vincular tu conversación.
          </p>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent("Hola, soy de Denik")}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center rounded-full bg-[#25D366] text-white py-2 font-satoMedium text-sm hover:-translate-y-0.5 transition"
          >
            Abrir WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
