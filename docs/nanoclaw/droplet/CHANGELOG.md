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
