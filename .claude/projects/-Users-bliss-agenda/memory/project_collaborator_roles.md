---
name: Collaborator roles need proper implementation
description: User roles (GUEST/ADMIN/OWNER) exist as UI labels but lack backend logic; invitation flow has bugs with orgId overwrite and missing orgIds usage
type: project
---

El sistema de colaboradores/roles está a medias. Hallazgos (2026-03-27):

- **ROLE_LABELS** define `GUEST`, `ADMIN`, `OWNER` en `dash.ajustes.tsx:72-77` pero nunca se asignan al invitar
- Al invitar, se sobreescribe `orgId` del User — si ya tenía org, pierde acceso
- `orgIds: String[]` existe en el schema pero no se usa en la invitación
- No hay permisos diferenciados: un colaborador tiene el mismo acceso que el dueño
- No hay role column dedicada para el contexto de org (el `role` actual es global: "user" vs "customer")

**Why:** El usuario quiere implementar roles de colaborador correctamente.

**How to apply:** Próxima sesión (2026-03-28) se armará un plan completo para implementar esto. Considerar: role per-org (no global), multi-org support via `orgIds`, permisos granulares, y fix del bug de overwrite de `orgId`.
