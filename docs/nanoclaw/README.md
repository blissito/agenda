# Nanoclaw — Asistente IA de Denik

Droplet DO con [nanoclaw](https://github.com/blissito/nanoclaw) (Claude Agent SDK + canales) que sirve al chat de `/dash/asistente`. Denik habla con él vía el `WebhookChannel` HTTP (request/response asíncrono con callback).

```
Denik UI  ─POST→  /api/asistente  ─POST→  nanoclaw:3939/message
                                                │
                                                ▼
                                        [container Claude + skills]
                                                │
Denik UI ←─poll─ /api/asistente  ←DB← /whatsapp/webhook ←POST─ nanoclaw
```

## Datos de infra

| Campo | Valor |
|---|---|
| Nombre | `nanoclaw-denik` |
| IP | `143.198.149.230` |
| Team DO | **fixter** |
| Región | `sfo3` |
| Size | `s-1vcpu-2gb` ($12/mo) |
| OS | Ubuntu 22.04 |
| SSH | `ssh root@143.198.149.230` |
| App dir | `/home/nanoclaw/app` |
| Systemd unit | `nanoclaw.service` |
| User del servicio | `nanoclaw` |
| Puerto webhook | `3939` (TCP, Bearer auth) |
| Snapshot origen | `nanoclaw-denik-2026-04-12` (ID 224398646, team fixter) |
| Upstream repo | https://github.com/blissito/nanoclaw |
| Local clone | `/Users/bliss/nanoclaw` |

## Variables de entorno

Archivo `/home/nanoclaw/app/.env` (perms `600`, owner `nanoclaw`).

| Var | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic (fallback si OAuth se rate-limita) |
| `CLAUDE_CODE_OAUTH_TOKEN` | Token del Max plan — preferido, sin costo por mensaje |
| `ASSISTANT_NAME` | Nombre del asistente (default `Denik`) |
| `OPENAI_API_KEY` | Opcional, para skills con DALL-E |
| `EASYBITS_API_KEY` | MCP de almacenamiento (imágenes/docs) |
| `BRIGHTDATA_API_TOKEN` | MCP de web scraping |
| `WEBHOOK_CHANNEL_PORT` | `3939` |
| `WEBHOOK_CHANNEL_SECRET` | `Pelusina69@` — **DEBE coincidir con Fly secret `NANOCLAW_SECRET`** |
| `WEBHOOK_CALLBACK_URL` | `https://www.denik.me/whatsapp/webhook` |
| `WHATSAPP_PHONE_NUMBER` | `5217712412825` — solo si se quiere WA activo |

**Rotar un secret**:
1. `ssh root@143.198.149.230` → editar `.env` (`nano /home/nanoclaw/app/.env`)
2. `systemctl restart nanoclaw`
3. Actualizar Fly: `fly secrets set NANOCLAW_SECRET="<nuevo>"` (desde `/Users/bliss/agenda`)

## Fly secrets requeridos en Denik

```bash
fly secrets set \
  NANOCLAW_URL="http://143.198.149.230:3939" \
  NANOCLAW_SECRET="Pelusina69@"
```

En localhost, mismas vars en `.env` del proyecto.

## Código de la integración (Denik)

| Archivo | Rol |
|---|---|
| `app/lib/nanoclaw.server.ts` | Cliente HTTP + helpers JID (`webhook_denik_{orgId}`) + persistencia |
| `app/routes/api/asistente.ts` | Endpoint del chat UI (`send`, polling) |
| `app/routes/whatsapp.webhook.ts` | Recibe callbacks de nanoclaw |
| `app/routes/dash/dash.asistente.tsx` | UI del chat minimalista |
| `prisma/schema.prisma` | Modelo `AssistantMessage` |

---

## MCP `@denik.me/mcp` — operar la org desde el chat

Cada mensaje que Denik envía a Nanoclaw (`POST /message`) ahora incluye un bloque `mcp`:

```json
{
  "jid": "webhook_denik_<orgId>",
  "sender": "<userId>",
  "sender_name": "Héctor",
  "content": "¿Qué tengo hoy?",
  "mcp": {
    "package": "@denik.me/mcp",
    "env": {
      "DENIK_API_KEY": "dk_<...>",
      "DENIK_BASE_URL": "https://www.denik.me"
    }
  }
}
```

`DENIK_API_KEY` viene de `Org.apiKey` (autogenerada al crear la org, backfill via `scripts/dev/backfill-api-keys.ts`). Autentica todas las tool calls del MCP contra `/api/mcp/*` y los aísla al scope de esa org.

**Lado Nanoclaw** (pendiente, fuera de este repo): al recibir el payload, arrancar el MCP stdio con `npx -y @denik.me/mcp` y los env vars del bloque `mcp`. El agente de Claude en el contenedor tendrá acceso a tools como `get_today_summary`, `cancel_event`, `update_landing_section`, etc.

---

## Administración diaria

Scripts útiles en `docs/nanoclaw/scripts/` (todos reciben SSH directo, sin wrappers exóticos).

### Ver estado

```bash
./docs/nanoclaw/scripts/status.sh
```

o manual:
```bash
ssh root@143.198.149.230 'systemctl status nanoclaw --no-pager; ss -tlnp | grep 3939'
```

### Logs en vivo

```bash
./docs/nanoclaw/scripts/logs.sh
```

o manual:
```bash
ssh root@143.198.149.230 'journalctl -u nanoclaw -f'
```

### Reiniciar

```bash
./docs/nanoclaw/scripts/restart.sh
```

o manual:
```bash
ssh root@143.198.149.230 'systemctl restart nanoclaw'
```

### Parar / arrancar

```bash
ssh root@143.198.149.230 'systemctl stop nanoclaw'
ssh root@143.198.149.230 'systemctl start nanoclaw'
```

### Editar `.env`

```bash
./docs/nanoclaw/scripts/env-edit.sh
```

Edita remotamente con nano y reinicia el servicio al salir.

### Actualizar código

**⚠️ CRÍTICO**: el proceso principal de nanoclaw corre desde `dist/` (TypeScript compilado). `systemctl restart` **no recompila nada** — si no haces `npm run build` antes, queda corriendo el `dist/` viejo y tu cambio no existe en prod aunque el `src/` esté actualizado. Síntoma clásico: POST a `/message` devuelve 200 pero ningún log del handler aparece.

Además, `git pull` vía `ssh root@...` deja archivos como `root:root` — `npm run build` falla silencioso o escribe `dist/` con owner equivocado. Siempre `chown -R nanoclaw:nanoclaw` después del pull.

Solo cambios de TS (no Dockerfile):
```bash
ssh root@143.198.149.230 '
  cd /home/nanoclaw/app &&
  git pull &&
  chown -R nanoclaw:nanoclaw /home/nanoclaw/app/src /home/nanoclaw/app/dist /home/nanoclaw/app/package*.json &&
  sudo -u nanoclaw npm run build &&
  systemctl restart nanoclaw'
```

Cambios en Dockerfile / deps del agent-runner (imagen docker que spawnea el agente, NO el proceso principal):
```bash
ssh root@143.198.149.230 '
  cd /home/nanoclaw/app &&
  git pull &&
  chown -R nanoclaw:nanoclaw src dist package*.json &&
  sudo -u nanoclaw npm run build &&           # compila el main process
  ./container/build.sh &&                     # reconstruye la imagen del agent
  chown -R nanoclaw:nanoclaw /home/nanoclaw/app/data/sessions/ &&
  systemctl restart nanoclaw'
```

**Verificar que el deploy tomó**: `grep -c "<símbolo-de-tu-fix>" /home/nanoclaw/app/dist/**/archivo.js` debe ser > 0.

---

## Reset / cleanup

### Limpiar auth de WhatsApp (401 Logged out)

```bash
./docs/nanoclaw/scripts/wa-repair.sh
```

Hace: stop → borrar creds → start en modo pairing → imprime el código.

Manual:
```bash
ssh root@143.198.149.230 '
  systemctl stop nanoclaw
  rm -rf /home/nanoclaw/app/store/auth/* /home/nanoclaw/app/store/pairing-code.txt
  systemctl start nanoclaw'
```

### Matar containers Docker stale

Los containers quedan detached al reiniciar el servicio.

```bash
ssh root@143.198.149.230 'docker ps -q | xargs -r docker kill; docker container prune -f'
```

### Reset total (⚠️ pierde toda la memoria/historial)

```bash
ssh root@143.198.149.230 '
  systemctl stop nanoclaw
  rm -rf /home/nanoclaw/app/store/auth/*
  rm -f  /home/nanoclaw/app/store/messages.db
  rm -rf /home/nanoclaw/app/data/sessions/*
  rm -rf /home/nanoclaw/app/groups/*
  systemctl start nanoclaw'
```

### Rotar journal logs (si el disco se llena)

```bash
ssh root@143.198.149.230 'journalctl --vacuum-time=7d'
```

---

## Probar sin UI

### Callback público de Denik (desde tu máquina)

```bash
./docs/nanoclaw/scripts/test-webhook.sh
```

Hace dos curls: uno sin auth (debe dar 401) y otro con Bearer (debe dar 200).

### Inyectar mensaje al nanoclaw directo

```bash
curl -i -X POST http://143.198.149.230:3939/message \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer Pelusina69@' \
  -d '{"jid":"webhook_denik_<ORG_ID>","sender":"test","sender_name":"Test","content":"hola"}'
```

---

## Snapshots / backup

### Snapshot manual (DO UI)

Panel fixter → Droplets → `nanoclaw-denik` → Snapshots → **Take Snapshot**. Live snapshot, no apaga el droplet.

### Snapshot con doctl

```bash
DIGITALOCEAN_ACCESS_TOKEN="<token de fixter>" \
  doctl compute droplet-action snapshot 564548922 \
  --snapshot-name "nanoclaw-denik-backup-$(date +%Y-%m-%d)" --wait
```

### Restaurar desde snapshot

```bash
DIGITALOCEAN_ACCESS_TOKEN="<token>" \
  doctl compute droplet create nanoclaw-denik-restored \
  --image <snapshot-id> --size s-1vcpu-2gb --region sfo3 \
  --ssh-keys <key-id> --wait
```

El `.env` se preserva dentro del snapshot.

---

## Costos

| Concepto | $/mes |
|---|---|
| Droplet `s-1vcpu-2gb` | $12 |
| Snapshot 50GB | ~$3 |
| Tráfico (2TB incluidos) | $0 |
| **Total fijo** | **~$15** |
| Anthropic API | variable — ver dashboard |

---

## Troubleshooting

Ver [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md).
