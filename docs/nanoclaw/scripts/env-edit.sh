#!/bin/bash
# Edita /home/nanoclaw/app/.env en el droplet y reinicia el servicio al cerrar.
ssh -t root@143.198.149.230 'nano /home/nanoclaw/app/.env && systemctl restart nanoclaw && echo "Servicio reiniciado."'
