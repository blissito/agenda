# Troubleshooting — nanoclaw-denik

Casos conocidos con síntoma → causa → fix.

## 1. Servicio en crash-loop, puerto 3939 no abre

- **Síntoma**: `systemctl status nanoclaw` muestra `Activating` cada 10s; `ss -tlnp | grep 3939` no devuelve nada.
- **Causa**: WhatsApp en estado `Logged out` (401) tira el proceso antes de que el `WebhookChannel` se registre.
- **Fix rápido**: limpiar creds WA → `./scripts/wa-repair.sh`
- **Fix alterno**: quitar `WHATSAPP_PHONE_NUMBER` del `.env`, reiniciar. WA no se inicializa y el webhook queda libre.

## 2. Chat en Denik se queda en "Pensando..." para siempre

- **Síntoma**: la UI muestra los dots animados pero nunca llega respuesta.
- **Causa A — callback no llega a Denik**:
  - Verificar que `WEBHOOK_CALLBACK_URL` en el droplet sea `https://www.denik.me/whatsapp/webhook`
  - Probar manual: `./scripts/test-webhook.sh`
- **Causa B — container del agente murió**:
  - `ssh root@143.198.149.230 'docker ps'` → matar si hay stale
  - `docker ps -q | xargs -r docker kill` y reiniciar nanoclaw
- **Causa C — rate limit Anthropic**:
  - `journalctl -u nanoclaw | grep 429`
  - Activar OAuth Max plan si está usando solo API key
- **Causa D — mensaje persistido como `pending` pero nunca se entregó**:
  - Check DB: mensaje `user` con `status: "pending"` sin assistant response posterior
  - Marcar manual o reiniciar servicio

## 3. 401 al llamar `/whatsapp/webhook`

- **Síntoma**: requests al callback devuelven 401.
- **Causa**: `NANOCLAW_SECRET` en Fly secrets ≠ `WEBHOOK_CHANNEL_SECRET` en el droplet.
- **Fix**:
  ```
  # En el droplet
  grep WEBHOOK_CHANNEL_SECRET /home/nanoclaw/app/.env

  # En Denik
  fly secrets list | grep NANOCLAW_SECRET
  fly secrets set NANOCLAW_SECRET="<valor del droplet>"
  ```

## 4. Provisión de grupo Denik-Nik falla con `EACCES: mkdir`

- **Síntoma**: logs de Nanoclaw muestran `[webhook] Denik group provisioning failed` con `EACCES: permission denied, mkdir '/home/nanoclaw/app/groups/webhook_denik_<orgId>'`. La UI queda en "Conectando WhatsApp…" para siempre, el grupo WA **sí se creó** (quedó huérfano).
- **Causa**: `/home/nanoclaw/app/groups/` quedó owned by `root:root` (típicamente tras un `rm -rf` o `scp` ejecutado como root). Nanoclaw corre como user `nanoclaw`, no puede `mkdir` subdirs.
- **Fix rápido**:
  ```bash
  ssh root@143.198.149.230 'chown -R nanoclaw:nanoclaw /home/nanoclaw/app/groups /home/nanoclaw/app/data/sessions'
  ```
- **Cleanup del link huérfano**:
  ```bash
  ./docs/nanoclaw/scripts/cleanup-denik-group.sh <orgId>
  ```
  El script ya incluye el `chown` al final para prevenir recurrencia.
- **Verificar**: `ssh root@143.198.149.230 'ls -la /home/nanoclaw/app/groups | head -3'` → owner debe ser `nanoclaw nanoclaw`.

**Por qué pasa seguido**: cualquier operación en el droplet como root sobre esos directorios (incluso `rm`, `scp`, `tee`) puede alterar ownership del parent. Ley de oro: todo trabajo con `groups/` y `data/sessions/` via `ssh root@... 'sudo -u nanoclaw <comando>'` o agregar `chown` al final.

## 5. Droplet no responde ni a SSH

1. Panel DO fixter → Droplet → **Power → Power Cycle**
2. Si persiste: **Console** desde DO UI (acceso root directo)
3. Si el FS está corrupto: restaurar desde snapshot

## 6. Mensajes duplicados en el chat

- **Síntoma**: aparece el mismo mensaje assistant dos veces.
- **Causa**: nanoclaw reintenta el callback si el primero devolvió 5xx.
- **Fix**: asegurar que `app/routes/whatsapp.webhook.ts` responda 200 aun si el mensaje ya existe (idempotencia por contenido + timestamp).

## 7. Disk full

- **Diagnóstico**: `ssh root@143.198.149.230 'df -h /'`
- **Culpables comunes**:
  - `journalctl --disk-usage` → vaciar con `journalctl --vacuum-time=7d`
  - Docker images viejas → `docker image prune -a -f`
  - `/home/nanoclaw/app/logs/` → `truncate -s 0 /home/nanoclaw/app/nanoclaw.log`
  - Container sessions viejas → `du -sh /home/nanoclaw/app/data/sessions/*`

## 8. El webhook funciona pero Denik UI no muestra la respuesta

- **Síntoma**: 200 OK en el callback, pero la UI sigue en "Pensando...".
- **Causa A**: polling frontend detenido — refrescar página.
- **Causa B**: mensaje guardado en otro `orgId` — verificar JID en el request del curl.
- **Causa C**: DB conectada a otra Mongo — verificar `DATABASE_URL` en Fly vs local.
