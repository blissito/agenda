# Release Checklist — `@denik.me/mcp`

> **Por qué existe este doc**: cada release nueva nos ha costado horas porque olvidamos un paso. Esta lista es el contrato. Si la sigues en orden, Nik ve la tool nueva en WhatsApp en <10 min. Si te saltas un paso, Nik responderá "aún no tengo esa función" aunque publiques el paquete.
>
> **Regla de oro**: publicar a npm NO es suficiente. Hay **4 superficies** que deben estar alineadas: (1) el paquete MCP, (2) el backend `/api/mcp/*`, (3) el pin del Dockerfile del fork, (4) el system prompt de Nik. Si cualquiera queda atrás, la tool no existe para el agente.

## Las 4 superficies (debugging rápido)

| Síntoma en WhatsApp | Superficie rota |
|---|---|
| "No tengo esa función" | **#4** System prompt `nik.CLAUDE.md` no lista la tool |
| Tool se llama pero responde 404/500 | **#2** Backend `/api/mcp/*` no implementa el intent |
| Agente no ve la tool aunque está en npm | **#3** Droplet sigue con pin viejo — rebuild pendiente |
| `npm view` no muestra la versión nueva | **#1** No publicaste, solo bumpeaste `package.json` |

## Checklist completo (en orden)

### 1. Backend (`app/routes/api/mcp.*.ts`)
- [ ] Intent implementado en el `action` o `loader` correspondiente
- [ ] Auth via `requireApiKey()` → scoped a `org.id`
- [ ] Probado local con `curl -H "X-Denik-Api-Key: ..."`
- [ ] Commit pushed a `main`
- [ ] Deploy a Fly (`fly deploy`) — sin esto el backend en prod no tiene el intent

### 2. Paquete MCP (`packages/denik-mcp/src/index.ts`)
- [ ] Tool agregada al array `TOOLS` con `name`, `description` (clara, en español si es user-facing), `inputSchema`
- [ ] Handler agregado en el `switch` dentro de `CallToolRequestSchema`
- [ ] Handler llama a `denikPost`/`denikGet` al endpoint correcto
- [ ] Version en `Server` constructor (línea ~12 de `src/index.ts`) coincide con `package.json`

### 3. Publish a npm
```bash
cd packages/denik-mcp
npm version minor   # tool nueva = minor. patch solo si es fix interno.
# ⚠️ editar a mano src/index.ts línea 12 para que coincida
npm publish --access public
npm view @denik.me/mcp version   # verificar
```

### 4. Dockerfile del fork (`blissito/nanoclaw-denik`)
- [ ] `container/Dockerfile` pin bumpeado (ej. `@denik.me/mcp@^0.6.0` → `^0.7.0` si cambió la línea major/minor del pin)
- [ ] Comentario `VERSION POLICY` actualizado
- [ ] Commit + push a `main` del fork

> **Nota**: si solo publicaste un patch (0.6.0 → 0.6.1) y el pin ya es `^0.6.0`, el `npm install -g` dentro del build ya lo toma. Aun así necesitas **rebuild** del contenedor (paso 5) para que el droplet re-descargue.

### 5. Deploy al droplet
```bash
ssh root@143.198.149.230 'cd /opt/nanoclaw && git pull && npm run build && systemctl restart nanoclaw'
```
- [ ] `git pull` trae el Dockerfile nuevo
- [ ] `npm run build` reconstruye el contenedor con `npm install -g @denik.me/mcp@...`
- [ ] `systemctl restart` levanta con la imagen nueva

Verificar:
```bash
ssh root@143.198.149.230 'docker exec <container> npm list -g @denik.me/mcp'
```

### 6. System prompt de Nik (`docs/nanoclaw/droplet/templates/nik.CLAUDE.md`)
- [ ] Tool nueva agregada a la sección "Tools disponibles"
- [ ] Si es mutación destructiva: agregada a la regla de confirmación
- [ ] Re-deployed al grupo del droplet:
```bash
ORG_NAME="..."; ORG_ID="..."
GROUP_FOLDER="webhook_denik_${ORG_ID}"
sed -e "s/{{ORG_NAME}}/$ORG_NAME/g" -e "s/{{ORG_ID}}/$ORG_ID/g" \
  docs/nanoclaw/droplet/templates/nik.CLAUDE.md | \
  ssh root@143.198.149.230 "cat > /home/nanoclaw/app/groups/$GROUP_FOLDER/CLAUDE.md"
ssh root@143.198.149.230 "chown -R nanoclaw:nanoclaw /home/nanoclaw/app/groups/$GROUP_FOLDER"
```
- [ ] Para **todas** las orgs activas, no solo la que estás probando

### 7. Changelog
- [ ] `docs/nanoclaw/droplet/CHANGELOG.md` entry con fecha, motivo, tools nuevas

### 8. Smoke test
- [ ] Mensaje al grupo WA: "pudes usar <tool>?" → Nik debe responder afirmativo
- [ ] Ejecutar la tool con caso real
- [ ] Verificar efecto en dashboard Denik

## Anti-patrones comunes

- ❌ **Publicar sin deployar Fly**: el paquete llama a un endpoint que no existe en prod.
- ❌ **Bumpear solo `package.json` sin `npm publish`**: nada cambió en npm.
- ❌ **Rebuild del droplet sin bump del pin**: `npm install -g @denik.me/mcp@^0.5.0` sigue trayendo la misma versión cacheada.
- ❌ **Olvidar actualizar `nik.CLAUDE.md`**: la tool está cargada pero el agente no sabe que puede usarla — responde "no tengo esa función" aunque el MCP la exponga.
- ❌ **Actualizar solo el template sin propagar a los grupos existentes**: el template es para orgs nuevas; los grupos activos tienen una copia estática.
- ❌ **Olvidar `chown nanoclaw:nanoclaw`** después de escribir archivos por SSH como root.
