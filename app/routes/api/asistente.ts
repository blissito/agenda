import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import {
  getMessagesSince,
  saveUserMessage,
  sendToNanoclaw,
} from "~/lib/nanoclaw.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  const url = new URL(request.url);
  const since = url.searchParams.get("since") || undefined;
  const messages = await getMessagesSince(org.id, since);
  return Response.json({ messages });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "send") {
    const content = String(form.get("content") || "").trim();
    if (!content) {
      return Response.json({ error: "Mensaje vacío" }, { status: 400 });
    }
    const saved = await saveUserMessage(org.id, content);
    try {
      await sendToNanoclaw({
        orgId: org.id,
        senderId: user.id,
        senderName: user.displayName || user.email || "Usuario",
        content,
      });
    } catch (err) {
      console.error("[asistente] send failed", err);
      return Response.json(
        { error: "No se pudo contactar al asistente" },
        { status: 502 },
      );
    }
    return Response.json({ ok: true, message: saved });
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 });
};
