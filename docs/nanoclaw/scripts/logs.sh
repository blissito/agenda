#!/bin/bash
# Tail -f de los logs de nanoclaw. Ctrl+C para salir.
ssh root@143.198.149.230 'journalctl -u nanoclaw -f'
