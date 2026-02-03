# Denik Agenda

**Stack**: React Router v7, TypeScript, Prisma (MongoDB), Stripe, AWS SES

## Qué es esta app

Sistema de agendamiento/citas multi-tenant donde:
- Negocios crean cuenta y servicios
- Clientes reservan citas via subdominios (ver sección URLs Públicas)
- Dashboard para gestionar agenda, clientes, servicios
- Magic link auth (sin password)
- Pagos con Stripe
- Notificaciones por email (SES)

## URLs Públicas (Subdominios)

El sistema usa **subdominios** para identificar organizaciones:

| Tipo | Formato (Producción) | Formato (Localhost) |
|------|---------------------|---------------------|
| Landing del negocio | `{orgSlug}.denik.me` | N/A (usar producción) |
| Booking de servicio | `{orgSlug}.denik.me/{serviceSlug}` | `localhost:3000/agenda/{orgSlug}/{serviceSlug}` |

**Archivos clave:**
- `app/routes/service.$serviceSlug.tsx` - Booking público (producción, usa subdominio)
- `app/routes/agenda.$orgSlug.$serviceSlug.tsx` - Booking público (localhost, ruta path-based)
- `app/utils/host.server.ts` - Resuelve org desde hostname/subdominio
- `app/utils/urls.ts` - Helpers para generar URLs:
  - `getServicePublicUrl(orgSlug, serviceSlug)` - URL del servicio (detecta localhost vs prod)
  - `getOrgPublicUrl(orgSlug)` - URL de la landing de la org (siempre producción)
  - `convertWeekDaysToEnglish(weekDays)` - Convierte días de español (DB) a inglés (UI)

**Notas importantes:**
- En producción, los links de servicios usan rutas relativas (`/{serviceSlug}`) dentro del subdominio
- En localhost, el helper `getServicePublicUrl()` genera URLs con path `/agenda/:orgSlug/:serviceSlug`
- Los `weekDays` se guardan en español en la DB pero el UI espera inglés (usa `convertWeekDaysToEnglish`)

## Estructura

```
app/
├── .server/          # Server-only code (auth, stripe)
├── routes/
│   ├── api/          # API endpoints (customers, services, events, org)
│   ├── dash/         # Dashboard
│   ├── service.$serviceSlug.tsx           # Booking público (producción, subdominio)
│   ├── agenda.$orgSlug.$serviceSlug.tsx   # Booking público (localhost, path-based)
│   └── stripe/       # Stripe endpoints + webhook
├── components/       # UI components
├── utils/            # Helpers, emails, tokens, urls
└── sessions.ts       # Session management

prisma/
└── schema.prisma     # 6 modelos: User, Org, Service, Event, Customer, Employee
```

## Estado de Features

| Feature | Estado |
|---------|--------|
| Auth (magic link) | ✅ |
| Booking público | ✅ |
| Dashboard | ✅ |
| Email notifications | ✅ |
| Stripe Connect | ✅ |
| Webhooks Stripe | ⚠️ Handler básico creado |
| Tests | ❌ 0% |

## TODO

- [ ] **Completar webhook Stripe** (`app/routes/stripe/webhook.ts`)
  - Actualizar estado de pagos en DB cuando `checkout.session.completed`
  - Manejar `payment_intent.failed` para notificar al usuario
  - Agregar `STRIPE_WEBHOOK_SECRET` a producción

## Variables de Entorno

```bash
# Requeridas
DATABASE_URL=
SESSION_SECRET=
JWT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
STRIPE_SECRET_TEST=
STRIPE_WEBHOOK_SECRET=
APP_URL=

# Opcionales
ADMIN_EMAILS=email1@x.com,email2@x.com
```

## Recursos

- **Auth**: `app/.server/userGetters.tsx`, `app/utils/tokens.ts`
- **Email**: `app/utils/emails/`
- **Stripe**: `app/.server/stripe.ts`, `app/routes/stripe/`
- **Validación**: `app/utils/zod_schemas.ts`
