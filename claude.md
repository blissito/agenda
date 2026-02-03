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

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Landing del negocio | `{orgSlug}.denik.me` | `mi-salon.denik.me` |
| Booking de servicio | `{orgSlug}.denik.me/{serviceSlug}` | `mi-salon.denik.me/corte-cabello` |

**Archivos clave:**
- `app/routes/service.$serviceSlug.tsx` - Página pública de agendamiento
- `app/utils/host.server.ts` - Resuelve org desde hostname/subdominio
- `app/utils/urls.ts` - Helper `getServicePublicUrl()` para generar URLs

**NO usar** el formato viejo `/agenda/:orgSlug/:serviceSlug` (deprecado).

## Estructura

```
app/
├── .server/          # Server-only code (auth, stripe)
├── routes/
│   ├── api/          # API endpoints (customers, services, events, org)
│   ├── dash/         # Dashboard
│   ├── service.$serviceSlug.tsx  # Booking público (usa subdominio)
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
