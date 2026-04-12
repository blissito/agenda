#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"
import { denikGet, denikPost } from "./client.js"

const server = new Server(
  { name: "denik-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
)

// ==================== Tool definitions ====================

const tools = [
  {
    name: "list_events",
    description:
      "Lista citas del negocio. Útil para '¿qué tengo hoy?', '¿qué hay mañana?'. Acepta rango de fechas ISO y filtros.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "ISO date inicio (inclusive)" },
        to: { type: "string", description: "ISO date fin (inclusive)" },
        status: { type: "string", enum: ["CONFIRMED", "pending", "CANCELLED"] },
        serviceId: { type: "string" },
        customerId: { type: "string" },
        attended: { type: "boolean" },
        limit: { type: "number", default: 50 },
      },
    },
    handler: async (args: any) =>
      denikGet("events", { intent: "list", ...args }),
  },
  {
    name: "get_event",
    description: "Devuelve el detalle de una cita por ID (incluye customer, service, meetingLink).",
    inputSchema: {
      type: "object",
      required: ["eventId"],
      properties: { eventId: { type: "string" } },
    },
    handler: async (args: any) =>
      denikGet("events", { intent: "get", eventId: args.eventId }),
  },
  {
    name: "list_services",
    description: "Lista los servicios activos de la org. Úsalo para resolver IDs antes de agendar.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => denikGet("services", { intent: "list" }),
  },
  {
    name: "get_service_public_url",
    description: "Devuelve el link público de booking de un servicio para compartir.",
    inputSchema: {
      type: "object",
      required: ["serviceId"],
      properties: { serviceId: { type: "string" } },
    },
    handler: async (args: any) =>
      denikGet("services", { intent: "public_url", serviceId: args.serviceId }),
  },
  {
    name: "list_customers",
    description:
      "Lista los clientes de la org paginado (primeros 20 por default, orden alfabético). Útil para dar overview cuando el usuario pregunta '¿qué clientes tengo?' sin especificar. Retorna {total, hasMore, customers}.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 20, description: "Máximo 100" },
        offset: { type: "number", default: 0 },
      },
    },
    handler: async (args: any) =>
      denikGet("customers", { intent: "list", ...args }),
  },
  {
    name: "find_customer",
    description: "Busca clientes por nombre, email o teléfono. Hasta 20 resultados.",
    inputSchema: {
      type: "object",
      required: ["q"],
      properties: { q: { type: "string" } },
    },
    handler: async (args: any) => denikGet("customers", { intent: "find", q: args.q }),
  },
  {
    name: "get_customer_appointments",
    description: "Historial de citas de un cliente (últimas 50, más recientes primero).",
    inputSchema: {
      type: "object",
      required: ["customerId"],
      properties: { customerId: { type: "string" } },
    },
    handler: async (args: any) =>
      denikGet("customers", { intent: "appointments", customerId: args.customerId }),
  },
  {
    name: "get_customer_points",
    description: "Puntos de lealtad acumulados de un cliente (cálculo en vivo sobre citas asistidas).",
    inputSchema: {
      type: "object",
      required: ["customerId"],
      properties: { customerId: { type: "string" } },
    },
    handler: async (args: any) =>
      denikGet("customers", { intent: "points", customerId: args.customerId }),
  },
  {
    name: "get_today_summary",
    description:
      "Resumen del día: total de citas, confirmadas, canceladas, no-shows, ingresos. La tool 'estrella' del grupo.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => denikGet("org", { intent: "today" }),
  },
  // ==================== Mutations (Phase 2) ====================
  {
    name: "cancel_event",
    description: "Cancela una cita (borra Meet/Zoom, jobs, marca CANCELLED).",
    inputSchema: {
      type: "object",
      required: ["eventId"],
      properties: { eventId: { type: "string" } },
    },
    handler: async (args: any) =>
      denikPost("events", { intent: "cancel", eventId: args.eventId }),
  },
  {
    name: "reschedule_event",
    description:
      "Mueve una cita a un nuevo horario. Si no se pasa `end`, mantiene la duración original.",
    inputSchema: {
      type: "object",
      required: ["eventId", "start"],
      properties: {
        eventId: { type: "string" },
        start: { type: "string", description: "Nuevo inicio ISO" },
        end: { type: "string", description: "Nuevo fin ISO (opcional)" },
      },
    },
    handler: async (args: any) =>
      denikPost("events", { intent: "reschedule", ...args }),
  },
  {
    name: "mark_attendance",
    description: "Marca si el cliente asistió a la cita (true/false) o limpia (null).",
    inputSchema: {
      type: "object",
      required: ["eventId", "attended"],
      properties: {
        eventId: { type: "string" },
        attended: { type: ["boolean", "null"] },
      },
    },
    handler: async (args: any) =>
      denikPost("events", { intent: "mark_attendance", ...args }),
  },
  {
    name: "create_event",
    description: "Agenda una cita manual. Requiere serviceId, customerId, start ISO.",
    inputSchema: {
      type: "object",
      required: ["serviceId", "customerId", "start"],
      properties: {
        serviceId: { type: "string" },
        customerId: { type: "string" },
        start: { type: "string" },
        notes: { type: "string" },
      },
    },
    handler: async (args: any) => denikPost("events", { intent: "create", ...args }),
  },
  {
    name: "create_customer",
    description:
      "Da de alta un cliente nuevo en la org. Si ya existe uno con ese email, devuelve el existente.",
    inputSchema: {
      type: "object",
      required: ["displayName"],
      properties: {
        displayName: { type: "string" },
        email: { type: "string" },
        tel: { type: "string" },
        notes: { type: "string" },
      },
    },
    handler: async (args: any) =>
      denikPost("customers", { intent: "create", ...args }),
  },
  {
    name: "send_appointment_reminder",
    description: "Envía email de recordatorio manual al cliente de una cita.",
    inputSchema: {
      type: "object",
      required: ["eventId"],
      properties: { eventId: { type: "string" } },
    },
    handler: async (args: any) =>
      denikPost("events", { intent: "send_reminder", eventId: args.eventId }),
  },
  // ==================== Landing (Phase 3) ====================
  {
    name: "get_landing",
    description:
      "Devuelve las secciones actuales de la landing de la org (id, label, tipo, preview). Útil antes de editar.",
    inputSchema: {
      type: "object",
      properties: {
        includeHtml: {
          type: "boolean",
          description: "true para devolver HTML completo (muy verboso). Default false.",
        },
      },
    },
    handler: async (args: any) =>
      denikGet("landing", { intent: "get", includeHtml: args.includeHtml }),
  },
  {
    name: "update_landing_section",
    description:
      "Modifica una sección de la landing con una instrucción en lenguaje natural (ej: 'hazla más formal', 'añade testimonios', 'aplica descuento NAVIDAD2026 en el CTA'). Preserva el estado de publicación actual: si la landing ya estaba live, los cambios quedan live; si era borrador, sigue como borrador.",
    inputSchema: {
      type: "object",
      required: ["sectionId", "instruction"],
      properties: {
        sectionId: { type: "string" },
        instruction: { type: "string" },
      },
    },
    handler: async (args: any) =>
      denikPost("landing", { intent: "update_section", ...args }),
  },
  {
    name: "unpublish_landing",
    description:
      "Despublica la landing (la quita del sitio público). Úsalo solo si algo salió mal; los cambios normales preservan el estado.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => denikPost("landing", { intent: "unpublish" }),
  },
  {
    name: "get_org_stats",
    description: "Estadísticas de la org en un rango custom (from/to ISO).",
    inputSchema: {
      type: "object",
      required: ["from", "to"],
      properties: {
        from: { type: "string" },
        to: { type: "string" },
      },
    },
    handler: async (args: any) =>
      denikGet("org", { intent: "stats", from: args.from, to: args.to }),
  },
] as const

// ==================== MCP handlers ====================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = tools.find((t) => t.name === req.params.name)
  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }],
      isError: true,
    }
  }
  try {
    const result = await tool.handler(req.params.arguments ?? {})
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    }
  }
})

// ==================== Start ====================

const transport = new StdioServerTransport()
await server.connect(transport)
console.error("[denik-mcp] server ready on stdio")
