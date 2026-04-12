#!/bin/bash
# Elimina COMPLETAMENTE un grupo Denik-Nik de ambos sistemas.
# Uso: ./cleanup-denik-group.sh <orgId>
#
# Borra:
#   - Denik DB: WhatsAppLink rows de esa org
#   - Nanoclaw SQLite: registered_groups + sessions filas
#   - Droplet FS: /home/nanoclaw/app/groups/webhook_denik_<orgId>/
#   - Droplet FS: /home/nanoclaw/app/data/sessions/webhook_denik_<orgId>/
#
# NOTA: NO abandona el grupo en WhatsApp (el bot sigue como admin). Si
# quieres que el bot salga, hazlo manualmente desde WhatsApp Web o
# añade esa lógica a futuro via sock.groupLeave().

set -e

ORG_ID="${1}"
if [ -z "$ORG_ID" ]; then
  echo "Uso: $0 <orgId>"
  echo "Ejemplo: $0 698a3dca1903400d6ad2e5c9"
  exit 1
fi

FOLDER="webhook_denik_${ORG_ID}"
DROPLET="root@143.198.149.230"
DROPLET_DB="/home/nanoclaw/app/store/messages.db"

echo "=== Cleanup de grupo Denik — orgId=${ORG_ID} ==="
echo

echo "1. Denik DB (WhatsAppLink):"
cd "$(dirname "$0")/../../.." && node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const r = await db.whatsAppLink.deleteMany({ where: { orgId: '${ORG_ID}' } });
  console.log('   ✓ eliminados:', r.count);
  await db.\$disconnect();
})();
"

echo
echo "2. Nanoclaw droplet (SQLite + FS):"
ssh "$DROPLET" "
  # JID del grupo WhatsApp (columna jid empieza con 120... para grupos)
  GROUP_JID=\$(sqlite3 ${DROPLET_DB} \"SELECT jid FROM registered_groups WHERE folder='${FOLDER}' LIMIT 1;\")
  echo \"   groupJid: \${GROUP_JID:-'(no encontrado)'}\"

  sqlite3 ${DROPLET_DB} \"DELETE FROM registered_groups WHERE folder='${FOLDER}';\"
  sqlite3 ${DROPLET_DB} \"DELETE FROM sessions WHERE group_folder='${FOLDER}';\"
  echo '   ✓ registered_groups + sessions filas eliminadas'

  rm -rf /home/nanoclaw/app/groups/${FOLDER}
  rm -rf /home/nanoclaw/app/data/sessions/${FOLDER}
  echo '   ✓ directorios de grupo y sesión borrados'

  # FIX recurrente: rm ejecutado como root no afecta al parent dir, pero
  # si en un build anterior se creó con root:root, nanoclaw user no puede
  # mkdir subdirs → EACCES al provisionar. Forzamos ownership.
  chown -R nanoclaw:nanoclaw /home/nanoclaw/app/groups /home/nanoclaw/app/data/sessions
  echo '   ✓ permisos restaurados a nanoclaw:nanoclaw'

  systemctl restart nanoclaw
  sleep 2
  systemctl is-active nanoclaw
"

echo
echo "=== Cleanup completo ==="
echo "Nota: el grupo WhatsApp sigue existiendo (el bot quedó adentro). Si"
echo "quieres cerrarlo, abre WhatsApp Web → el grupo → salir manualmente."
