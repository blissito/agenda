# Droplet Nanoclaw — Tracking

El droplet `nanoclaw-denik` (143.198.149.230) corre una instancia **independiente** de Nanoclaw. El código upstream vive en `github.com/blissito/nanoclaw` (proyecto Ghosty-0, separado). **Nunca** modificamos el repo upstream desde aquí — todos los cambios que hacemos son específicos al droplet de Denik y se trackean en esta carpeta.

## Estructura

```
droplet/
├── README.md          ← este archivo
├── CHANGELOG.md       ← log cronológico de cambios hechos al droplet
├── templates/         ← archivos que deployamos al droplet (ej. personas Nik, configs)
├── backup/            ← copias pre-cambio de archivos del droplet (rollback)
└── patches/           ← diffs aplicados (no forks completos)
```

## Workflow

Antes de tocar cualquier archivo en el droplet:

1. `scp root@143.198.149.230:<path> docs/nanoclaw/droplet/backup/<fecha>-<archivo>` — backup
2. Aplicar el cambio (via `ssh` + `tee`/`sed`/etc.)
3. Anotar en `CHANGELOG.md`: fecha, archivo, motivo, diff resumido
4. Si es un archivo que deployamos nosotros (ej. `templates/nik.CLAUDE.md`), guardar la versión fuente en `templates/` y el comando de deploy

## Restaurar

Si algo rompe, los archivos en `backup/` tienen los originales. Se recuperan con:

```bash
scp docs/nanoclaw/droplet/backup/<archivo> root@143.198.149.230:<path-original>
ssh root@143.198.149.230 'systemctl restart nanoclaw'
```
