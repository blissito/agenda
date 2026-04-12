#!/bin/bash
# Limpia auth de WhatsApp y genera un pairing code nuevo.
# Uso: ./wa-repair.sh [numero-con-lada]    (default: 5217712412825)
set -e

PHONE="${1:-5217712412825}"

ssh root@143.198.149.230 "
  set -e
  systemctl stop nanoclaw
  pkill -u nanoclaw -f 'node dist' 2>/dev/null || true
  sleep 2
  rm -rf /home/nanoclaw/app/store/auth/* /home/nanoclaw/app/store/pairing-code.txt 2>/dev/null
  cd /home/nanoclaw/app
  sudo -u nanoclaw WHATSAPP_PHONE_NUMBER=$PHONE WHATSAPP_RECONNECT_MODE=1 nohup node dist/index.js > /tmp/wa-pair.log 2>&1 &
  echo 'Esperando pairing code...'
  for i in \$(seq 1 30); do
    if [ -f /home/nanoclaw/app/store/pairing-code.txt ]; then
      echo '=== PAIRING CODE ==='
      cat /home/nanoclaw/app/store/pairing-code.txt
      echo
      echo '===================='
      echo 'Ingresa el código en WhatsApp > Dispositivos vinculados > Vincular con número.'
      echo 'Cuando la vinculación termine, corre: ./scripts/restart.sh'
      exit 0
    fi
    sleep 2
  done
  echo 'TIMEOUT. Tail del log:'
  tail -30 /tmp/wa-pair.log
  exit 1
"
