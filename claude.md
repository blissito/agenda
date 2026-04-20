# Denik Agenda

**Stack**: React Router v7, TypeScript, Prisma (MongoDB), MercadoPago, AWS SES

## Qué es esta app

Sistema de agendamiento/citas multi-tenant donde:

- Negocios crean cuenta y servicios
- Clientes reservan citas via subdominios (ver sección URLs Públicas)
- Dashboard para gestionar agenda, clientes, servicios
- Magic link auth (sin password)
- Pagos con MercadoPago
- Notificaciones por email (SES)

## URLs Públicas (Subdominios)

El sistema usa **subdominios** para identificar organizaciones:

| Tipo                | Formato (Producción)               | Formato (Localhost)                             |
| ------------------- | ---------------------------------- | ----------------------------------------------- |
| Landing del negocio | `{orgSlug}.denik.me`               | N/A (usar producción)                           |
| Booking de servicio | `{orgSlug}.denik.me/{serviceSlug}` | `localhost:3000/agenda/{orgSlug}/{serviceSlug}` |

**Archivos clave:**

- `app/routes/service.$serviceSlug.tsx` - Booking público (producción, usa subdominio)
- `app/routes/agenda.$orgSlug.$serviceSlug.tsx` - Booking público (localhost, ruta path-based)
- `app/utils/host.server.ts` - Resuelve org desde hostname/subdominio
- `app/utils/urls.ts` - Helpers para generar URLs:
  - `getServicePublicUrl(orgSlug, serviceSlug)` - URL del servicio (detecta localhost vs prod)
  - `getOrgPublicUrl(orgSlug)` - URL de la landing de la org (siempre producción)
- `app/utils/weekDays.ts` - Diccionario i18n de días de la semana:
  - `WEEK_DAYS`, `DAY_LABELS`, `DAY_LABELS_SHORT` - Constantes
  - `DEFAULT_WEEK_DAYS` - Lun-Vie 9:00-18:00
  - `normalizeWeekDays(weekDays)` - Normaliza cualquier formato a inglés (idempotente)

**Notas importantes:**

- En producción, los links de servicios usan rutas relativas (`/{serviceSlug}`) dentro del subdominio
- En localhost, el helper `getServicePublicUrl()` genera URLs con path `/agenda/:orgSlug/:serviceSlug`
- Los `weekDays` se guardan en inglés en la DB (`monday`, `tuesday`, etc.). Español solo en la capa UI via `DAY_LABELS`

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

| Feature                | Estado                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| Auth (magic link)      | ✅                                                                  |
| Booking público        | ✅                                                                  |
| Dashboard              | ✅                                                                  |
| Email notifications    | ✅                                                                  |
| Stripe Connect         | ⚠️ Legacy (no usado en booking, solo backend)                       |
| Webhooks Stripe        | ⚠️ Legacy (ruta registrada, pero booking usa MP)                    |
| MercadoPago            | ✅ OAuth, webhooks idempotentes, token refresh                      |
| Loyalty (puntos/tiers) | ✅ (DB unificada, awardPoints en webhooks MP/Stripe)                |
| Google Calendar/Meet   | ✅ OAuth, crear/borrar eventos, Meet automático                     |
| Zoom                   | ✅ OAuth, crear/borrar meetings (falta webhook para asistencia)     |
| Asistente IA (nanoclaw)| ✅ droplet propio en fixter, canal webhook, chat en `/dash/asistente` — ver `docs/nanoclaw/README.md` |
| Nik MCP (`@denik.me/mcp`) | ✅ stdio MCP, 15 tools (lectura + mutaciones + landing), scoped por `Org.apiKey` — ver sección abajo |
| Nik por WhatsApp       | ✅ grupos provisionados al click (avatar Denik), usan fork `blissito/nanoclaw-denik` en el droplet |
| Tests                  | ❌ 0%                                                               |

## Nik — Asistente IA por WhatsApp

E2E end-to-end: cada org tiene un agente **Nik** accesible por un grupo privado de WhatsApp.

**Flujo**: `/dash/asistente` → click **"Conectar WhatsApp"** → Denik llama a Nanoclaw → crea grupo WA con avatar Denik → callback con inviteUrl → user acepta → Nik responde en el grupo con tools MCP scoped a esa org.

**Componentes**:
- **Paquete npm** `@denik.me/mcp` (pinned a `^0.5.0`, policy en `docs/nanoclaw/droplet/CHANGELOG.md`) con 15 tools: agenda, clientes, servicios, landing, loyalty. Auth por `X-Denik-Api-Key` → `Org.apiKey` (auto-generada, backfill via `scripts/dev/backfill-api-keys.ts`).
- **Endpoints** `/api/mcp/{events,customers,services,org,landing}` — `app/routes/api/mcp.*.ts`. Helper `app/.server/apiKeyAuth.ts`.
- **Provisioning** `/api/whatsapp/link` (create/status) + callback `/whatsapp/link/callback`. Model `WhatsAppLink`.
- **Fork nanoclaw** `github.com/blissito/nanoclaw-denik` — droplet SSH deploy key, `git pull && npm run build && systemctl restart nanoclaw`. Toda operación con `groups/` y `data/sessions/` debe terminar en `chown -R nanoclaw:nanoclaw ...` (ver TROUBLESHOOTING.md #4).
- **Cleanup** de grupo: `./docs/nanoclaw/scripts/cleanup-denik-group.sh <orgId>` borra ambas DBs + FS + perms.

**Runbooks**: `docs/nanoclaw/README.md` (infra), `docs/nanoclaw/TROUBLESHOOTING.md` (8 casos), `docs/nanoclaw/droplet/CHANGELOG.md` (log de cambios al droplet).

## Protección contra duplicados

Los webhooks verifican si ya existe un evento antes de crear:

- **Stripe**: busca por `stripe_session_id`
- **MercadoPago**: busca por `mp_payment_id`
- **DB**: unique constraint `@@unique([serviceId, start])` en modelo Event

## TODO

- [x] ~~Completar webhook Stripe~~ (implementado)
- [x] ~~**ELMASURGENTE**: El link de pagos en el menú no funciona~~ (webhook Stripe registrado en routes.ts, loader de pagos ya no auto-crea cuenta Stripe, guard en getClient())
- [x] ~~**CI/CD**: Los checks de GitHub Actions nunca pasan~~ (ya pasan correctamente)
- [x] ~~**BUG PROD - IMÁGENES**: Las imágenes no se muestran en sitio público~~ (helper `getPublicImageUrl()` en urls.ts)
- [ ] **URGENTE**: Agregar `STRIPE_WEBHOOK_SECRET` en Fly secrets — sin esta variable el webhook Stripe rechaza todo con 400. Obtener de [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) y correr: `fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."`
- [x] ~~**URGENTE**: Arreglar link de evaluaciones (la ruta falla)~~ (índices agregados)
- [x] ~~**URGENTE**: Reevaluar sistema de integraciones y activar Messenger~~ (Descartado - email suficiente)
- [x] ~~**SIGUIENTE**: el boton de cerrar del menu queda por encima del container de la descipción del servicio~~ (z-50 agregado al modal)
- [x] ~~**SIGUIENTE**: Leamos buenas practicas de react router v7~~ (useNavigation + spinner overlay en dash_layout.tsx)
- [x] ~~**PENULTIMO**: onboarding apunta a rutas que no existen y no se calcula bien los progresos~~ (habilitado paso de pagos, barra de progreso, tracking real)
- [x] ~~**ULTIMO**: Buenos días, Héctor BlisS no corresponde al horario~~ (función getGreeting() dinámica)
- [x] ~~Mejorar UX de selección Stripe vs MercadoPago en onboarding~~ (orientado 100% a MP, Stripe removido del UI)
- [ ] Drag & drop en galería de servicio para reordenar imágenes y seleccionar la principal
- [ ] **LOYALTY POINTS**: Actualmente los puntos de lealtad se calculan en vivo sumando `service.points` de citas pasadas (tanto en `dash_.clientes_.$email.tsx` como en `customer-portal.server.ts`). Los campos `customer.loyaltyPoints` y `customer.loyaltyTotalEarned` en la DB están siempre en 0 y no se usan. Hay que implementar la escritura real de estos campos (al completar una cita o marcar asistencia) para que el sistema use `customer.loyaltyPoints` en vez del cálculo en vivo, lo cual permitiría redenciones que descuenten puntos correctamente.
- [x] ~~La página pública de org no muestra bien los horarios~~ (campos corregidos: logo, email, weekDays)
- [ ] **UX**: Selección de horarios en booking - actualmente bloquea todos los slots mientras carga. Implementar optimistic UI para respuesta inmediata
- [ ] **LÍMITES POR PLAN (gating TRIAL vs PRO vs EXPIRED)**: Hoy todas las funciones Pro están abiertas para cualquier user. Cuando se implemente billing, hay que aplicar gating en estos 3 features. Proponer matriz de límites y puntos de enforcement:

  | Feature | EXPIRED | TRIAL | PRO | Enforcement |
  |---|---|---|---|---|
  | **Asistente IA (Nik)** — WhatsApp + `/dash/asistente`, administra el negocio del owner | ❌ bloqueado | ✅ acceso completo (rate limit sugerido: 50 msgs/mes) | ✅ acceso completo (200 msgs/mes o ilimitado) | Loader `/dash/asistente` redirige si `plan === "EXPIRED"`; API `/api/mcp/*` regresa 402 si el `Org.apiKey` corresponde a owner expirado. Contador nuevo en `Org` (`aiAssistantMsgCount` + `aiAssistantUsageMonth`) reseteado mensualmente |
  | **Chatbot IA en landing pública** — `Org.landingChatbotEnabled`, atiende a clientes del negocio | ❌ forzado a `false` | ✅ habilitado (50 conversaciones/mes) | ✅ habilitado (ilimitado o N>>) | Toggle en `/dash/sitio` deshabilitado si `plan === "EXPIRED"`; loader de la landing pública (`service.$serviceSlug.tsx` / `agenda.$orgSlug.$serviceSlug.tsx`) oculta el widget si owner expirado. Contador `Org.landingChatbotMsgCount` |
  | **Regeneraciones de landing** (gen + refine) | ❌ bloqueado | 3 gen + 10 refine / mes | 10 gen + 50 refine / mes (o ilimitado) | Ya existen `Org.landingGenCount` y `Org.landingRefineCount` con reset mensual via `landingUsageMonth`. Falta: (a) leer plan del owner en `app/lib/landing-generator.server.ts:25`; (b) agregar constante `LIMITS_BY_PLAN` y validar antes de incrementar; (c) UI en editor de landing que muestre cuota restante |
  | **Colaboradores** (`Employee` + users rol `colaborador`) | ❌ solo owner | 1 colaborador | ilimitado (o N definido) | Gating en `app/routes/dash/dash.colaboradores.tsx:74` (`db.user.create` al invitar). UI del dash que oculte el CTA de invitar cuando se alcance el límite |

  **Plan de implementación:**
  1. Crear `app/lib/plan-limits.server.ts` con `PLAN_LIMITS: Record<Plan, Limits>` y helper `assertLimit(orgId, feature)` que lee `Org.owner.plan` + contadores actuales y throwea 402 si se excede.
  2. Aplicar en los 3 enforcement points de la tabla.
  3. UI: badge de "Plan" en `/dash` + componente `<PlanLimitBadge feature="landing-gen" />` que muestra `usado/total` y linkea a `/planes` si está cerca del límite.
  4. Bloqueo EXPIRED: layout del dash (`dash_layout.tsx`) muestra banner persistente "Tu trial expiró — actualiza tu plan" con CTA a `/planes`; features marcadas como ❌ redirigen ahí.

- [ ] **TRIAL → PRO (suscripciones + promo 80% off primeros 3 meses)**: El email `trialWarningTemplate.ts` promete "80% de descuento durante los primeros 3 meses" (user paga 20% de la mensualidad los primeros 3 ciclos, luego precio regular) pero no hay mecanismo para canjearlo. Bloqueado: no hay checkout de suscripciones (MP es para pagos de citas, Stripe Connect es legacy para payouts). Plan cuando se decida el proveedor de billing (MP Suscripciones / Stripe Billing):
  1. Ruta `/planes` con plan Pro mensual + checkout recurrente.
  2. Token firmado en el link del email (`~/utils/tokens.ts`) con `{userId, promo:"TRIAL_3M_80", exp:+10d}`. La ruta `/planes` valida y aplica el descuento a los primeros 3 ciclos de facturación (Stripe Billing: `coupon` con `duration:"repeating", duration_in_months:3, percent_off:80`. MP Suscripciones: crear plan dedicado de 3 cobros al 20% + swap al plan regular al 4º mes).
  3. Webhook → flip `User.plan` de `TRIAL`/`EXPIRED` a `PRO` al primer cobro exitoso; tracking de ciclos para no re-aplicar promo.
  4. Mientras tanto: la línea de la promo en el warning template prometera algo que no se puede canjear — considerar cambiar el CTA a "Escríbenos por WhatsApp" hasta que exista el checkout.
- [x] ~~**BUG PROD**: Magic links usan `/login/signin` pero la ruta es `/signin` - 404 en prod~~ (corregido en sendAppointment.ts)
- [x] ~~**META TAGS**: Revisar y mejorar meta tags en las landings publicadas~~ (OG tags en booking público y landing de org)
- [ ] **AI Landing en S3**: Subir HTML generado a S3/CloudFront en vez de servirlo via iframe srcDoc (mejor SEO, carga directa, sin limitaciones de iframe). Actualmente se usa `<iframe srcDoc>` fullscreen en `home.tsx` como workaround porque React Router v7 no permite devolver raw HTML desde loaders.
- [x] ~~**DALL-E + S3 para landings**: Imágenes generadas con DALL-E 3, persistidas en Tigris~~ (SDK 0.2.11 con `persistImage` callback, Denik sube a `landings/{orgId}/`)
- [x] ~~**Opus para landings**: `generateOrgLanding` ahora usa `claude-sonnet-4-6`~~ (refine usa Haiku 4.5 sin imagen, Sonnet 4.6 con imagen de referencia)
- [ ] **AI Landing — Referencias visuales**: El editor ya acepta imagen de referencia (base64 upload → vision model replica el diseño). Extender para aceptar también **links de Figma** via MCP (`figma-to-code`), donde el usuario pega un share link y el sistema extrae el diseño como referencia para generar/refinar secciones. La biblioteca SDK debe exponer esto como opción (`referenceUrl?: string` además de `referenceImage?: string`).
- [ ] **AI Landing — Fix de contraste (texto negro sobre fondo negro)**: Las landings generadas a veces salen con combinaciones inválidas de color (ej. `text-on-surface` dentro de `bg-primary` en temas oscuros = invisible, o `text-primary` sobre `bg-primary` = mismo color). El SDK tiene `sanitizeSemanticColors()` que reemplaza clases hardcodeadas pero **no valida** que el `text-*` de un nodo case con el `bg-*` efectivo del ancestro. Plan:
  - **Nuevo**: `app/lib/contrast-validator.server.ts` con `validateContrast(html)`, `validateSectionContrast(s)`, `validateSectionsContrast(s[])`. Tokeniza el HTML por regex (sin dependencias nuevas), mantiene un stack del `bg-family` efectivo (`primary | secondary | accent | surface`), y reescribe cada `text-*` que no case con `EXPECTED_ON[bg]`. Maneja gradientes (`from-/via-/to-<family>`), self-closing tags, `bg-[#hex]` arbitrarios (hereda del ancestro), `text-on-surface-muted` preservado en surface, clases no semánticas (`text-xl`, `text-center`) intactas. Wrap en try/catch para retornar HTML original si el tokenizador falla.
  - **Modificar**: `app/lib/landing-generator.server.ts` — envolver los callbacks `onSection`/`onImageUpdate`/`onDone` (en `generateOrgLanding`) y `onChunk`/`onDone` (en `refineOrgLanding`) con el validador. Validar también el array final retornado. No tocar `app/routes/api/landing-generator.ts` — lógica centralizada.
  - **Tests**: `app/lib/contrast-validator.test.ts` (vitest) cubriendo: parent `bg-primary` + child `text-on-surface` → fix; `text-primary` sobre `bg-primary` → `text-on-primary`; nested bgs; `text-gray-900` → `text-on-surface`; gradientes; self-closing; HTML malformado.
  - **Backfill opcional**: `scripts/dev/backfill-contrast.ts` para landings ya guardadas. Correr `--dry` primero.
  - No tocar `node_modules` ni el system prompt del SDK — fix puramente en nuestro código.
- [x] ~~**GOOGLE CAL htmlLink**~~ (campo `calendarHtmlLink` en Event, link "Ver en Google Calendar" en drawer)
- [x] ~~**ASISTENCIA**: campo `attended` + UI manual~~ (dropdown en CitasTable para citas pasadas, intent `mark_attendance` en api/events)
- [x] ~~**ZOOM WEBHOOKS**~~ (endpoint `/zoom/webhook`, marca `attended=true` en `meeting.participant_joined`, requiere `ZOOM_WEBHOOK_SECRET` en Fly + config en Zoom Marketplace app)
- [ ] **GOOGLE CALENDAR VERIFICACIÓN**: Enviar solicitud de verificación en Google Cloud Console para quitar pantalla "Google no verificó esta app". Requiere: dominio verificado (✅), política de privacidad (✅ `/avisodeprivacidad`), descripción de uso del scope `calendar.events`
- [ ] **WABA (WhatsApp Business API) para Asistente IA**: Hoy el chat `/dash/asistente` solo funciona en web (canal webhook de nanoclaw). Para que cada org pueda hablar con su asistente por WhatsApp usando un número oficial de Meta, hay que:
  1. **En nanoclaw**: implementar `src/channels/meta-waba.ts` — recibe webhooks de Meta Cloud API (verificación de challenge, validación de firma con `META_WABA_APP_SECRET`), parsea mensajes inbound (text/image/audio/location), envía outbound via Graph API. Patrón igual a `telegram.ts` (~200-300 líneas). **Copiar directamente la lógica de Formmy** (`/Users/bliss/formmy_rrv7/server/integrations/whatsapp/`) que ya resuelve Embedded Signup, firma, y routing. Env vars: `META_WABA_VERIFY_TOKEN`, `META_WABA_APP_SECRET`, `META_WABA_ACCESS_TOKEN`, `META_WABA_PHONE_NUMBER_ID`.
  2. **En Denik**: UI en `/dash/asistente` para que el owner haga Embedded Signup de Meta, reciba WABA ID + Phone Number ID, y guarde en `Org.whatsappWabaId` + `Org.whatsappPhoneNumberId`. Reusar flow existente de Formmy.
  3. **Routing**: nanoclaw recibe webhook de Meta con número destino → busca `Org` por `whatsappPhoneNumberId` → despacha al grupo `webhook_denik_{orgId}` existente. La memoria y el agente ya están configurados.
  4. Ver roadmap en `/Users/bliss/nanoclaw/CLAUDE.md` sección "Next Steps → Meta WABA direct channel" (ya está documentado ahí).
- [ ] **EVALUAR**: Eventos recurrentes - El modelo Event carece de features avanzados:
  - Repetición (cada martes 10am, cada semana, cada mes)
  - Número de repeticiones o fecha fin de recurrencia
  - Excepciones (cancelar solo una ocurrencia)
  - Posiblemente otros features pendientes de evaluar (bloqueo de horarios, eventos todo el día, etc.)

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

## Costos de AI Landing Generation (ACTUALIZAR si cambian modelos)

Config en `app/lib/landing-generator.server.ts` + SDK `@easybits.cloud/html-tailwind-generator`.

| Operación | Modelo | Costo USD | Costo MXN (~$20.50) |
|---|---|---|---|
| **Generar landing** (6-8 secciones) | Sonnet 4.6 | ~$0.15-0.25 | ~$3-5 |
| **Refine** (sin imagen) | Haiku 4.5 | ~$0.01-0.03 | ~$0.20-0.60 |
| **Refine** (con imagen referencia) | Sonnet 4.6 | ~$0.05-0.10 | ~$1-2 |
| **Imágenes Pexels** | — | Gratis | Gratis |
| **Sesión típica** (1 gen + 3-4 refines) | — | ~$0.20-0.40 | ~$5-10 |

- Generación usa ~2-4K input + 8-15K output tokens
- Refine usa ~1-3K input + 2-5K output tokens
- Imágenes: Pexels (gratis) es el default. DALL-E ($0.04-0.08/imagen) solo si `OPENAI_API_KEY` está configurado

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

# Google Calendar/Meet
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Zoom
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET=   # Zoom Marketplace > Feature > Event Subscriptions > Secret Token

# Opcionales
ADMIN_EMAILS=email1@x.com,email2@x.com
```

## Recursos

- **Auth**: `app/.server/userGetters.tsx`, `app/utils/tokens.ts`
- **Email**: `app/utils/emails/`
- **Stripe**: `app/.server/stripe.ts`, `app/routes/stripe/`
- **MercadoPago**: `app/.server/mercadopago.ts`, `app/routes/mercadopago.*`
- **Loyalty**: `app/lib/loyalty.server.ts`, `app/routes/api/loyalty.ts`
- **Google Calendar/Meet**: `app/lib/google-meet.server.ts`, `app/routes/dash/dash.google-calendar-*.tsx`
- **Zoom**: `app/lib/zoom.server.ts`, `app/routes/dash/dash.zoom-*.tsx`
- **Validación**: `app/utils/zod_schemas.ts`
- **Cancelación de citas (universal)**: `app/lib/event-cancel.server.ts` — `cancelEventFully({ eventId, orgId? })` cancela Meet + Zoom + jobs + marca `CANCELLED`/`archived`. Úsalo siempre en lugar de `db.event.update({ archived: true })`.
- **Link de llamada (video provider)**:
  - `app/utils/videoProvider.server.ts` — `resolveVideoProvider({ org, service, override })` decide "meet" | "zoom" | "none"
  - `app/components/forms/VideoProviderSelect.tsx` — dropdown custom con logos oficiales (Meet/Zoom) + "Denik Link próximamente"
  - `Service.videoProvider` (default del servicio: "auto" | "meet" | "zoom" | "none") y `Event.videoProvider` (snapshot)

## Onboarding — tamaños tipográficos

Estándares para pantallas del flujo `/signup/*`:

- **Success screen** (`LoaderScreen` en `app/routes/login/signup.$stepSlug.tsx`):
  - Título: `text-[28px] leading-[36px]` (antes `text-4xl`/36px)
  - Texto secundario: `text-base` (16px, antes `text-lg`/18px)
  - Imagen hero: `h-[240px]` (antes 312px)
- Botones "Continuar" en todo el onboarding: `w-[190px]` (ancho uniforme)

## Componentes/Assets reutilizables

- **`app/components/common/CopyLinkButton.tsx`** — Botón copiar URL con animación de partículas (14 partículas multicolor, state "¡Copiado!" por 1.5s). Uso: `<CopyLinkButton url="..." />`.
- **`app/components/common/DropDownMenu.tsx`** — Renderiza vía `createPortal` a `document.body`, nunca es clippeado por `overflow`. Reposiciona en scroll/resize.
- **`app/components/chatbot/WhatsAppAd.tsx`** — Card promocional para WhatsApp (colores Meta green, gradiente). CTA abre Meta Embedded Signup (coexistencia) — configurar `META_APP_ID` + `META_CONFIG_ID` cuando apruebe la app.
- **Assets Nik** (mascota):
  - `public/images/nik.svg` — morado (#5158F6)
  - `public/images/nik-white.svg` — variante blanca (para fondos de color), generada con `sed 's/#5158F6/white/g'` del original
  - `public/images/bg-banner.svg` — banner onboarding (tailwind class `bg-onboarding`) con Nik blanco embebido

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
