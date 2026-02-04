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

## Patrón para Features Fullstack

Para añadir un feature nuevo (ej: loyalty, notifications, analytics):

```
app/lib/{feature}.server.ts      # TODA la lógica en UN archivo
app/routes/api/{feature}.ts      # API endpoints (glue code)
app/routes/dash/dash.{feature}.tsx  # UI del dashboard
prisma/schema.prisma             # Modelos nuevos
```

### 1. Crear `app/lib/{feature}.server.ts`

```typescript
import { db } from "~/utils/db.server";

// ==================== TYPES ====================
export type MyType = "a" | "b";
export interface MyConfig { ... }

// ==================== CONFIG ====================
export const MY_CONFIG: MyConfig = { ... };

// ==================== LOGIC ====================
export async function doSomething(params: { ... }) {
  // toda la lógica de negocio aquí
}

// ==================== QUERIES ====================
export async function getSomething(orgId: string) { ... }

// ==================== ADMIN ====================
export async function createSomething(data: { ... }) { ... }
```

### 2. Crear `app/routes/api/{feature}.ts`

```typescript
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { doSomething, getSomething } from "~/lib/{feature}.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");

  if (intent === "list") return getSomething(org.id);
  return Response.json({ error: "Unknown intent" }, { status: 400 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // similar pattern con intent para diferentes acciones
};
```

### 3. Crear UI en `app/routes/dash/dash.{feature}.tsx`

```typescript
import { useLoaderData } from "react-router";
import { getSomething, MY_CONFIG } from "~/lib/{feature}.server";
import type { Route } from "./+types/dash.{feature}";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // cargar datos para el dashboard
};

export default function Feature() {
  const data = useLoaderData<typeof loader>();
  return <main>...</main>;
}
```

### 4. Agregar modelos a Prisma

```prisma
model MyModel {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  orgId     String   @db.ObjectId
  // campos...
  createdAt DateTime @default(now()) @db.Date

  @@index([orgId])
}
```

Después de cambiar el schema: `npx prisma generate`

### Ejemplo real: Loyalty

- `app/lib/loyalty.server.ts` - Types, config, lógica de puntos/tiers/rewards
- `app/routes/api/loyalty.ts` - Endpoints: award, redeem, create-reward, etc.
- `app/routes/dash/dash.lealtad.tsx` - Dashboard de lealtad

## Estado de Features

| Feature | Estado |
|---------|--------|
| Auth (magic link) | ✅ |
| Booking público | ✅ |
| Dashboard | ✅ |
| Email notifications | ✅ |
| Stripe Connect | ✅ |
| Webhooks Stripe | ✅ idempotentes (checkout.session.completed, payment_intent.failed) |
| MercadoPago | ✅ OAuth, webhooks idempotentes, token refresh |
| Loyalty (puntos/tiers) | ✅ |
| Tests | ❌ 0% |

## Protección contra duplicados

Los webhooks verifican si ya existe un evento antes de crear:
- **Stripe**: busca por `stripe_session_id`
- **MercadoPago**: busca por `mp_payment_id`
- **DB**: unique constraint `@@unique([serviceId, start])` en modelo Event

## TODO

- [x] ~~Completar webhook Stripe~~ (implementado)
- [ ] Configurar variables de webhook en producción (ver Checklist de Producción)

## Checklist de Producción (Webhooks)

### Stripe
1. Ir a [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Crear endpoint: `https://tudominio.com/stripe/webhook`
3. Seleccionar eventos: `checkout.session.completed`, `payment_intent.payment_failed`, `account.updated`
4. Copiar "Signing secret" y agregarlo como `STRIPE_WEBHOOK_SECRET` en producción

### MercadoPago
1. Ir a [Panel MercadoPago → Configuración → Webhooks](https://www.mercadopago.com.mx/developers/panel/app)
2. Configurar URL: `https://tudominio.com/mercadopago/webhook`
3. Seleccionar eventos: `payment`
4. Copiar "Secret key" y agregarla como `MP_WEBHOOK_SECRET` en producción

### Verificar funcionamiento
```bash
# Stripe CLI (desarrollo)
stripe listen --forward-to localhost:3000/stripe/webhook
stripe trigger checkout.session.completed

# Probar webhook manualmente
curl -X POST https://tudominio.com/stripe/webhook -d '{}'  # Debe dar 400 (sin firma)
```

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

# MercadoPago
MP_CLIENT_ID=
MP_CLIENT_SECRET=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=   # Panel MP > Webhooks > Secret key

# Opcionales
ADMIN_EMAILS=email1@x.com,email2@x.com
```

## Recursos

- **Auth**: `app/.server/userGetters.tsx`, `app/utils/tokens.ts`
- **Email**: `app/utils/emails/`
- **Stripe**: `app/.server/stripe.ts`, `app/routes/stripe/`
- **MercadoPago**: `app/.server/mercadopago.ts`, `app/routes/mercadopago.*`
- **Loyalty**: `app/lib/loyalty.server.ts`, `app/routes/api/loyalty.ts`
- **Validación**: `app/utils/zod_schemas.ts`

## Herramientas de Desarrollo (DB)

Scripts CLI para manipular la base de datos durante desarrollo. Ubicados en `scripts/dev/`.

### Leer datos

```bash
# Listar modelos disponibles
npx tsx scripts/dev/db-read.ts --list-models

# Ver registros de un modelo
npx tsx scripts/dev/db-read.ts User
npx tsx scripts/dev/db-read.ts Org --limit 5

# Filtrar por campo
npx tsx scripts/dev/db-read.ts Service --where "orgId=abc123"

# Ver un registro específico
npx tsx scripts/dev/db-read.ts Customer --id "abc123"

# Contar registros
npx tsx scripts/dev/db-read.ts Event --count
```

### Crear datos de prueba

```bash
# Crear un usuario
npx tsx scripts/dev/db-create.ts User

# Crear org completa (user + org + 2 services + 3 customers + 2 events)
npx tsx scripts/dev/db-create.ts Org --full

# Crear múltiples registros
npx tsx scripts/dev/db-create.ts Customer --count 5 --orgId "ID"

# Crear evento
npx tsx scripts/dev/db-create.ts Event --orgId "ID" --serviceId "ID" --customerId "ID"
```

### Eliminar datos

```bash
# Eliminar registro específico
npx tsx scripts/dev/db-delete.ts User --id "ID"

# Eliminar org con todos sus datos relacionados
npx tsx scripts/dev/db-delete.ts Org --id "ID" --cascade
```

### Prisma Studio

Para una UI visual de la base de datos:

```bash
npx prisma studio
```

### Factories

Los generadores de datos fake están en `scripts/dev/factories.ts`:
- `generateUser(overrides?)` - Usuario con email/displayName fake
- `generateOrg(ownerId, overrides?)` - Org con slug único
- `generateService(orgId, overrides?)` - Servicio con price/duration
- `generateCustomer(orgId, overrides?)` - Cliente con tel/email
- `generateEvent(data, overrides?)` - Evento con fechas próximas
