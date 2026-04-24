# Droplet Changelog

Log cronológico de cambios aplicados al droplet `nanoclaw-denik` (143.198.149.230). Formato más reciente arriba.

## Convenciones

- **Fecha**: YYYY-MM-DD HH:MM UTC
- **Archivo**: ruta en el droplet
- **Backup**: si existe, en `backup/<fecha>-<basename>`
- **Comando aplicado**: exactamente lo que se corrió
- **Motivo**: qué se quería lograr
- **Reversión**: cómo deshacer

---

## Políticas

### MCP `@denik.me/mcp` — pinned a `^0.7.0`

Solo aceptamos **patches/minors dentro de la línea 7.x** (0.7.1, 0.8.0, ...). Cualquier bump a 1.0+ requiere:
1. Revisar CHANGELOG del MCP
2. Validar breaking changes contra Nik persona y agent-runner
3. Decisión explícita antes de cambiar el Dockerfile del fork

Enforcement: `container/Dockerfile` pinea `'@denik.me/mcp@^0.7.0'` en el `npm install -g`.

Proceso de publish: ver `packages/denik-mcp/PUBLISH.md`.

---

## 2026-04-23

### `@denik.me/mcp@0.7.0` publicado — CRUD gaps (customer/event/org)

- **Motivo**: cerrar gaps CRUD del MCP — Nik puede ahora consultar/editar cliente, evento y org desde WhatsApp.
- **Tools nuevas (5)**: `get_customer`, `update_customer`, `update_event`, `get_org`, `update_org`.
- **Backend**: `app/routes/api/mcp.customers.ts` agregó `intent: update` en action; `mcp.events.ts` agregó `intent: update` (whitelist: notes, paid, payment_method, title, status); `mcp.org.ts` agregó `intent: get` en loader y action con `intent: update` (whitelist: name, description, email, tel, address, timezone, weekDays, logo).
- **npm**: publicado `@denik.me/mcp@0.7.0` (verificar con `npm view @denik.me/mcp version`).
- **Pendiente en droplet**: actualizar `container/Dockerfile` del fork `blissito/nanoclaw-denik` al pin `^0.7.0`, rebuild + restart. Propagar tools nuevas a `nik.CLAUDE.md` de orgs activas.
- **Reversión**: pin a `^0.6.0` en Dockerfile → rebuild nanoclaw. Backend es aditivo (safe rollback si algo falla).

## 2026-04-12

### `@denik.me/mcp@0.6.0` publicado — Services CRUD

- **Motivo**: Nik ahora puede crear/editar servicios, horarios e imágenes desde WhatsApp.
- **Tools nuevas** (8): `create_service`, `update_service`, `update_service_hours`, `archive_service`, `unarchive_service`, `toggle_service_active`, `remove_service_image`, `reorder_service_gallery`.
- **Backend**: `app/routes/api/mcp.services.ts` agregó `action` con intents correspondientes (commit `798de51`).
- **Pendiente en droplet**: actualizar `container/Dockerfile` del fork `blissito/nanoclaw-denik` al pin `^0.6.0`, hacer pull + restart.
- **Reversión**: pin a `^0.5.0` en Dockerfile → rebuild nanoclaw.

## 2026-04-12

### Remote cambiado a fork privado `blissito/nanoclaw-denik`

- **Motivo**: separar changes Denik-specific del upstream Ghosty-0.
- **Pre**: `/root/.ssh/` solo tenía `authorized_keys`, sin llave privada.
- **Comandos**:
  ```bash
  ssh root@143.198.149.230 'ssh-keygen -t ed25519 -N "" -f /root/.ssh/id_ed25519 -C droplet-nanoclaw-denik'
  # pub key añadida como Deploy Key (read-only) en github.com/blissito/nanoclaw-denik
  gh repo deploy-key add ... --repo blissito/nanoclaw-denik --title droplet-nanoclaw-denik
  # remote switch
  ssh root@143.198.149.230 'cd /home/nanoclaw/app && git remote set-url origin git@github.com:blissito/nanoclaw-denik.git && git fetch origin'
  ```
- **Reversión**: `git remote set-url origin https://github.com/blissito/nanoclaw.git`

### Build inicial de `nanoclaw-agent:latest` en el droplet

- **Motivo**: `docker images` estaba vacío — sin la imagen, Nanoclaw recibe mensajes (HTTP 200) pero no puede spawnar container del agente → silencio en el chat.
- **Comando**: `ssh root@143.198.149.230 'cd /home/nanoclaw/app/container && ./build.sh'` (corriendo ahora, job ID `brhrkq81e`).

### Re-pareo WhatsApp (Baileys 401)

- **Motivo**: Baileys se desconectó con `reason: 401`, Nanoclaw en loop de activación.
- **Comando**: `./docs/nanoclaw/scripts/wa-repair.sh` — generó pairing code `8YF4K2HN`, se metió en WhatsApp > Dispositivos vinculados.
- **Post**: `./docs/nanoclaw/scripts/restart.sh` — servicio `active`.

---

<!-- Añade entradas nuevas arriba, bajo ## <fecha> -->
