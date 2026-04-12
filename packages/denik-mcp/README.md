# @denik/mcp

Servidor MCP stdio para [Denik Agenda](https://denik.me). Expone tools para operar una org desde un agente (típicamente un bot de WhatsApp de equipo).

## Instalación

```bash
npm i -g @denik/mcp
```

## Config (Claude Desktop)

```json
{
  "mcpServers": {
    "denik": {
      "command": "denik-mcp",
      "env": {
        "DENIK_API_KEY": "dk_live_...",
        "DENIK_BASE_URL": "https://www.denik.me"
      }
    }
  }
}
```

La API key se genera desde `Dashboard → Ajustes → API keys`.

## Tools (Fase 1 — read-only)

| Tool | Descripción |
|---|---|
| `get_today_summary` | Resumen del día (citas, ingresos, no-shows) |
| `list_events` | Listar citas con filtros (rango, status, etc.) |
| `get_event` | Detalle de una cita |
| `list_services` | Servicios activos |
| `get_service_public_url` | Link público de booking para compartir |
| `find_customer` | Buscar clientes |
| `get_customer_appointments` | Historial de un cliente |
| `get_customer_points` | Puntos de lealtad |
| `get_org_stats` | Stats en rango custom |

Próximas fases: mutaciones (cancel/reschedule/mark_attendance), edición de landing, cupones.
