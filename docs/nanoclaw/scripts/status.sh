#!/bin/bash
# Estado del servicio + puerto 3939 + últimas 20 líneas de log.
ssh root@143.198.149.230 '
  echo "=== systemctl ==="
  systemctl status nanoclaw --no-pager | head -10
  echo
  echo "=== puerto 3939 ==="
  ss -tlnp | grep 3939 || echo "NO está escuchando 3939"
  echo
  echo "=== últimas 20 líneas ==="
  journalctl -u nanoclaw -n 20 --no-pager
'
