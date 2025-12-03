# Auditoría Denik Agenda - Resumen para Claude

**Fecha**: 2025-11-10
**Estado**: MVP funcional pero incompleto (~60-70% completitud)
**Stack**: React Router v7, TypeScript, Prisma (MongoDB), Stripe, AWS SES

## 🎯 ¿Qué es esta app?

Sistema de agendamiento/citas multi-tenant donde:
- Negocios crean cuenta y servicios
- Clientes reservan citas en `/agenda/:orgSlug/:serviceSlug`
- Dashboard para gestionar agenda, clientes, servicios
- Magic link auth (sin password)
- Pagos con Stripe (incompleto)
- Notificaciones por email (SES)

## 🔴 CRÍTICO - Resolver Primero

### 1. Secretos Hardcodeados
```
app/sessions.ts:20 → "blissm0_2024"
app/utils/tokens.ts:4,9 → "denik.me"
app/.server/userGetters.tsx:42 → emails admin hardcodeados
```
**Acción**: Mover a variables de entorno

### 2. Stripe Incompleto
- ❌ No hay webhook handler
- ❌ No hay flujo de pago real
- ❌ Faltan: `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLIC_KEY`
- País hardcodeado a "MX"

### 3. Base de Datos
- ❌ No existe `prisma/migrations/`
- Cambios de schema no trackeados
- TODO en schema.prisma:1 sobre timestamps

### 4. Validación APIs
```
app/routes/api/customers.ts:14,24 → sin validación
app/routes/api/events.ts:42 → validación comentada
app/routes/api/api.org.ts:17 → TODO validación
```

### 5. Timezone
- Múltiples TODOs en `sendAppointment.ts`
- `DateAndTimePicker.tsx` incompleto

## 🟠 Alta Prioridad

- **Testing**: 0% cobertura, sin framework configurado
- **Docs**: README minimalista, sin .env.example
- **59 console.logs**: Usar logger apropiado
- **8 @ts-ignore**: Evadiendo type safety
- **Notificaciones**: WhatsApp en schema pero no implementado

## 🟡 Media Prioridad

- **Upload archivos**: No implementado (Image.tsx:12, InputFile.tsx:10,45)
- **Seguridad**: Sin rate limiting, sin CSRF, cookies no secure
- **Performance**: Sin caching, sin paginación, sin índices DB
- **37 rutas /blissmo/**: Experimentales, documentar o remover

## 📋 Variables de Entorno Faltantes

```bash
# Faltantes
STRIPE_SECRET_TEST=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=

# Hardcodeadas (mover a .env)
SESSION_SECRET=
JWT_SECRET=

# Recomendadas
NODE_ENV=production
LOG_LEVEL=info
SENTRY_DSN=
APP_URL=
```

## 📊 Estado de Features

| Feature | Estado |
|---------|--------|
| Auth (magic link) | ✅ Funciona |
| Booking público | ✅ Funciona |
| Dashboard | ✅ Funciona |
| Email notifications | ✅ Funciona (timezone incompleto) |
| Stripe payments | ⚠️ Conexión básica |
| Stripe checkout | ❌ No implementado |
| Webhooks Stripe | ❌ No implementado |
| WhatsApp | ❌ No implementado |
| Tests | ❌ 0% |
| Docs | ❌ Mínima |

## 🗂️ Estructura Importante

```
app/
├── .server/
│   ├── userGetters.tsx (auth, TODOs en línea 42, 112, 157)
│   ├── stripe.ts (básico, 67 líneas, país hardcodeado)
├── routes/
│   ├── api/ (7 endpoints, mayoría sin validación)
│   ├── dash/ (dashboard completo)
│   ├── agenda.$orgSlug.$serviceSlug/ (booking público)
│   ├── blissmo/ (37 rutas experimentales)
├── components/
│   ├── forms/agenda/ (DateAndTimePicker con TODOs)
│   ├── common/ (Image upload pendiente)
├── utils/
│   ├── emails/ (SES, TODOs en sendAppointment.ts)
│   ├── tokens.ts (JWT secret hardcodeado)
├── sessions.ts (session secret hardcodeado)

prisma/
├── schema.prisma (TODO línea 1, sin migrations/)
```

## 📝 TODOs Principales por Archivo

1. **prisma/schema.prisma:1** - Timestamps al reiniciar DB
2. **app/.server/userGetters.tsx:42,112,157** - Auth issues
3. **app/routes/api/*.ts** - Validación faltante (5 archivos)
4. **app/utils/emails/sendAppointment.ts:35,41,78,84** - Timezone
5. **app/components/forms/agenda/DateAndTimePicker.tsx:19,49,82,95** - Lógica incompleta
6. **app/components/common/Image.tsx:12** - Upload sin implementar
7. **app/components/forms/InputFile.tsx:10,45** - Optimización imágenes

## 🚀 Plan de Acción Sugerido

### HOY
1. Crear `.env.example`
2. Mover secretos a variables de entorno
3. Agregar validación básica a APIs críticas

### ESTA SEMANA
4. Setup migraciones Prisma
5. Implementar webhooks Stripe (si se necesita)
6. Rate limiting en auth
7. Reemplazar console.logs con logger
8. Agregar tests básicos (auth + booking)

### ESTE MES
9. Completar timezone handling
10. Cola de emails con retry
11. Paginación en listas
12. Documentar API y setup
13. Auditoría seguridad completa
14. Limpiar rutas experimentales

## 💡 Notas de Contexto

- **Onboarding**: 4 pasos, Stripe step deshabilitado
- **Multi-tenant**: Basado en Org (organizaciones)
- **Admin**: Basado en emails hardcodeados (no roles)
- **I18n**: Mezcla español/inglés, no i18n formal
- **Deploy**: Dockerfile + Fly.io + GitHub Actions
- **Codebase**: 82 rutas, 15,937 líneas de componentes

## 🔍 Buscar Issues

```bash
# Encontrar TODOs
grep -r "TODO" app/

# Encontrar console.logs
grep -r "console\." app/

# Encontrar @ts-ignore
grep -r "@ts-ignore" app/

# Encontrar hardcoded secrets
grep -r "blissm0\|denik\.me" app/
```

## 📚 Recursos

- **Schema**: `prisma/schema.prisma` (6 modelos)
- **APIs**: `app/routes/api/` (customers, services, events, org, employees)
- **Auth**: `app/.server/userGetters.tsx`, `app/utils/tokens.ts`
- **Email**: `app/utils/emails/`
- **Stripe**: `app/.server/stripe.ts`, `app/routes/stripe/api.ts`

---

**Próxima sesión**: Empezar por los items CRÍTICOS antes de agregar nuevas features.
