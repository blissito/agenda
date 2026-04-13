# Cómo publicar `@denik.me/mcp`

> TL;DR: `cd packages/denik-mcp && npm version <patch|minor|major> && npm publish --access public` — luego actualizar el pin del droplet.
>
> **⚠️ Antes de cada release seguí [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md) paso a paso.** npm publish es solo 1 de 4 superficies (backend Fly, paquete npm, Dockerfile del fork, system prompt de Nik). Saltarse cualquiera = Nik responde "no tengo esa función" aunque el paquete esté publicado.

## Contexto

- Paquete: `@denik.me/mcp` en npm (scope público `@denik.me`)
- Código: `packages/denik-mcp/` en este repo (monorepo-light)
- Es un **stdio MCP server** que proxea HTTP a `/api/mcp/*` de Denik
- Lo consume `nanoclaw-denik` (droplet `143.198.149.230`) vía `npm install -g @denik.me/mcp@<pin>`

## ¿Cuándo hay que publicar?

**Siempre que se toque `src/index.ts` o `src/client.ts`.** Específicamente:

- ➕ **Tool nueva** → `minor` bump (ej. 0.6.0 → 0.7.0). Los agentes NO la ven hasta que el droplet actualice su pin.
- ✏️ **Cambio de schema/description de tool existente** → `minor` bump.
- 🐛 **Fix interno (cliente HTTP, parsing, etc.) sin cambiar API de tools** → `patch` (0.6.0 → 0.6.1).
- 💥 **Rename/delete de tool o cambio incompatible de inputSchema** → `major`.

**NO hace falta publicar** si solo cambias el backend `/api/mcp/*` sin tocar los intents que usan las tools del paquete. Pero si agregas un intent nuevo y quieres exponerlo al agente, sí hay que registrarlo como tool → publish.

> **Regla de oro**: tools son contrato estático en el paquete. Backend-only ≠ agente lo ve.

## Pasos

```bash
cd packages/denik-mcp

# 1. Bump versión (elige uno)
npm version patch   # 0.6.0 → 0.6.1 (fix)
npm version minor   # 0.6.0 → 0.7.0 (tools nuevas, compatible)
npm version major   # 0.6.0 → 1.0.0 (breaking)

# 2. Sincronizar versión en código (Server constructor en src/index.ts)
#    — editar a mano si cambió

# 3. Build + publish (prepublishOnly corre build)
npm publish --access public

# 4. Verificar
npm view @denik.me/mcp version
```

## Post-publish: actualizar el droplet

El pin vive en `container/Dockerfile` del **fork** `blissito/nanoclaw-denik` (NO este repo):

```bash
# Editar container/Dockerfile en el fork, cambiar:
#   npm install -g '@denik.me/mcp@^0.6.0'  ← bump aquí
# Commit + push al fork
# Luego en el droplet:
ssh root@143.198.149.230 'cd /opt/nanoclaw && git pull && npm run build && systemctl restart nanoclaw'
```

También actualizar la política en `docs/nanoclaw/droplet/CHANGELOG.md` (sección "MCP `@denik.me/mcp` — pinned a `^X.Y.0`").

## Autenticación npm

Cuenta: `hectorbliss` (login con `npm login` si expira). Token persiste en `~/.npmrc`.

## Qué exponer / qué no

- **Sí**: lectura + mutaciones JSON vía `denikPost`/`denikGet`
- **No**: uploads multipart (ej. `gallery_upload` de services) — el SDK MCP transporta JSON, no files. Si se necesita, agregar un intent backend que acepte URL remota y que el endpoint haga fetch + upload.
