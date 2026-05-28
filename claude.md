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

## Política de iframes (CSP `frame-ancestors`)

El dashboard `/dash/website` embebe la landing pública de la org (`{slug}.denik.me`) en un iframe. Subdominio ≠ apex, así que `X-Frame-Options: SAMEORIGIN` (que no soporta múltiples orígenes) provoca "rechazó la conexión" en Chrome.

**Fuente única de verdad**: `app/root.tsx:22`
```
Content-Security-Policy: frame-ancestors 'self' https://denik.me https://www.denik.me
```

- Permite: `{slug}.denik.me` y dominios custom embebidos **solo** desde `denik.me` (apex), `www.denik.me` (dashboard de producción), o desde sí mismos.
- Bloquea: third-parties, subdominios de orgs entre sí, cualquier cross-site framing.
- `www` se lista explícitamente porque `frame-ancestors` trata `denik.me` y `www.denik.me` como orígenes distintos — sin esto el dashboard (servido desde `www`) no puede embeber la landing pública (`{slug}.denik.me`).
- `X-Frame-Options` fue **removido** de `fly.toml` — es legacy, no soporta multi-origen y conflictúa con CSP.
- Clickjacking seguro: solo Denik controla `denik.me`/`www.denik.me`, así que ningún atacante puede embeber páginas sensibles.
- Si agregas un nuevo origen propio (ej. `admin.denik.me`), añádelo a la lista del CSP.

**Sandbox en landings públicas (obligatorio):** los `<iframe srcDoc>` que renderizan AI landings en `home.tsx` y `agenda.$orgSlug._index.tsx` deben llevar `sandbox="allow-forms allow-scripts allow-popups allow-top-navigation-by-user-activation"` (sin `allow-same-origin`). Sin sandbox, el HTML generado por IA hereda el origin `denik.me` y podría aprovechar el CSP para enmarcar subdominios víctima. El preview interno del dashboard (`dash.website.tsx`) sí usa `allow-same-origin` porque solo lo ve el owner de la org.

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
- [ ] **SEC — fuga de PII en booking público (`get_times_for_selected_date`)**: en `app/routes/service.$serviceSlug.tsx:79-87` y `app/routes/agenda.$orgSlug.$serviceSlug.tsx` el `db.event.findMany` no filtra por `serviceId`/`orgId` y retorna el objeto Prisma completo (incluye `notes`, `mp_payment_id`, `customerId`, etc.) de **todos los eventos de la plataforma** en esa fecha. Cualquiera puede hacer POST al endpoint y enumerar PII. Fix: añadir `where: { serviceId: service.id }` y `select: { start: true }` (mismo patrón que ya aplicamos en `event.$eventId.reschedule.tsx`).
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

- [ ] **TRIAL → PRO (suscripciones + promo 80% off primeros 3 meses)**: La ruta `/planes` y el checkout de suscripción ya están cableados en código (`app/.server/stripe-subscriptions.ts`, `app/routes/api/stripe-checkout.ts`, webhook en `app/lib/stripe/subscription-webhook.server.ts`). El email `trialWarningTemplate.ts` apunta a `/planes?promo=welcome` y el form en `planes.tsx:391` inyecta `promo=welcome3m80`, que `stripe-subscriptions.ts:146` lee como `applyWelcomePromo` y aplica `discounts: [{ coupon: WELCOME_PROMO_COUPON_ID }]`. **Falta solo configuración Stripe + 1 cambio de código para anti-abuso**:

  **Pendiente con Brenda — credenciales Stripe (test primero, luego prod):**
  ```bash
  STRIPE_SECRET_TEST=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PRO_MONTHLY_PRICE_ID=price_...
  STRIPE_PRO_ANNUAL_PRICE_ID=price_...
  STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
  STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...
  STRIPE_WELCOME_PROMO_CODE_ID=promo_...   # ver paso 2
  ```

  **Paso 1 — Crear Products + Prices en Stripe** (Dashboard → Products):
  - Producto "Denik Pro" con dos precios: mensual + anual (precios de `app/routes/planes.tsx`).
  - Producto "Denik Enterprise" con mensual + anual.
  - Copiar los 4 `price_...` IDs y setearlos en Fly secrets + `.env` local.

  **Paso 2 — Crear Coupon + Promotion Code (no solo Coupon)**: para que el descuento sea **once-per-customer** y bloquee el abuso de cancelar/resuscribirse, necesitamos `PromotionCode.restrictions.first_time_transaction: true`. Eso vive en `PromotionCode`, no en `Coupon`. Pasos:
  ```bash
  # 1. Crear el cupón base
  stripe coupons create \
    --id=welcome3m80 \
    --name="Welcome 80% off 3m" \
    --percent-off=80 \
    --duration=repeating \
    --duration-in-months=3 \
    --max-redemptions=1000 \
    --redeem-by=$(date -v+6m +%s) \
    --applies-to[products][]=$STRIPE_PRO_PRODUCT_ID

  # 2. Envolverlo en un promotion code con first-time restriction
  stripe promotion_codes create \
    --coupon=welcome3m80 \
    --code=WELCOME3M80 \
    --restrictions[first_time_transaction]=true \
    --max-redemptions=1000
  ```
  El `id` del promotion code (formato `promo_...`) es el valor para `STRIPE_WELCOME_PROMO_CODE_ID`.

  **Paso 3 — Cambio de código (5 líneas)** en `app/.server/stripe-subscriptions.ts`:
  - Renombrar `WELCOME_PROMO_COUPON_ID` → `WELCOME_PROMO_CODE_ID` (env var nueva).
  - Cambiar línea 147 de:
    ```ts
    sessionConfig.discounts = [{ coupon: WELCOME_PROMO_COUPON_ID }]
    ```
    a:
    ```ts
    sessionConfig.discounts = [{ promotion_code: WELCOME_PROMO_CODE_ID }]
    ```
  - Actualizar el comentario del bloque (líneas 35-40) que documenta cómo crearlo.

  **Paso 4 — Webhook (ya existe)**: `app/lib/stripe/subscription-webhook.server.ts` ya flippea `User.plan` de `TRIAL`/`EXPIRED` a `PRO` al primer cobro exitoso. Solo verificar que `STRIPE_WEBHOOK_SECRET` esté en Fly y el endpoint registrado en Stripe Dashboard → Webhooks (URL: `https://denik.me/stripe/webhook`, eventos: `customer.subscription.created/updated/deleted`, `invoice.paid`).

  **Paso 5 — (opcional, futuro) Firmar el link del email**: hoy `${APP_URL}/planes?promo=welcome` es público. El `first_time_transaction` del paso 2 ya bloquea abuso por customer, pero si querés que solo users con trial expirando vean el descuento, generar JWT en `sendTrialWarning.ts` via `~/utils/tokens.ts` con `{userId, promo:"welcome3m80", exp:+10d}` y validar en el loader de `planes.tsx`.

  **Comportamiento esperado**:
  - 3 ciclos al 20% del precio (ej. Pro $499 → $99.80 los primeros 3 meses), luego precio normal automático (Stripe lo maneja por `duration: repeating, duration_in_months: 3`).
  - Si user cancela y vuelve a suscribirse: el `first_time_transaction` lo bloquea, paga precio normal.
- [ ] **PWA (Progressive Web App)**: Denik hoy no tiene nada de PWA (no `manifest.webmanifest`, no service worker, no íconos PWA). Plan en 4 fases. **Solo aplicar al dashboard (`www.denik.me/dash/*`)**, no al booking público ni a las landings de orgs (cliente final agenda 1 vez, no vuelve — instalar PWA ahí es fricción sin payoff). Multi-subdomain caveat: `{slug}.denik.me` y `www.denik.me` son orígenes distintos para SW; el SW vive solo en `www`.

  **Estimación total: ~5-7 días de trabajo enfocado para fases 1-3. Fase 4 probablemente skip.**

  ### Fase 1 — Instalable (3-4 horas)
  Lo mínimo para que Chrome/Safari muestren "Instalar app".
  1. `public/manifest.webmanifest` con `name: "Denik"`, `short_name: "Denik"`, `start_url: "/dash"`, `scope: "/dash"`, `display: "standalone"`, `theme_color: "#5158F6"` (morado Nik), `background_color: "#ffffff"`.
  2. Set de íconos en `public/icons/`: `192x192.png`, `512x512.png`, `512x512-maskable.png`, `apple-touch-icon-180.png`. Generar desde el logo de Denik (o desde `nik.svg`). Herramienta: [realfavicongenerator.net](https://realfavicongenerator.net) o `pwa-asset-generator`.
  3. Meta tags en `app/root.tsx`: `<link rel="manifest" href="/manifest.webmanifest">`, `<meta name="theme-color" content="#5158F6">`, `<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="default">`.
  4. Verificar en Lighthouse → PWA tab: debe pasar todos los checks de "Installable".

  ### Fase 2 — Cache del shell del dashboard (1-1.5 días)
  Service Worker que cachea assets estáticos + shell del dash para carga rápida en mala red.
  1. Instalar `vite-plugin-pwa` (auto-genera SW + manifest, registra cliente, soporta auto-update).
  2. Configurar en `vite.config.ts`:
     - `registerType: "autoUpdate"` (actualiza SW al recargar).
     - `workbox.globPatterns`: `['**/*.{js,css,html,ico,png,svg,woff2}']`.
     - `workbox.runtimeCaching`:
       - Assets de Tigris/S3 (`landings/*`, `services/*`): `CacheFirst`, expiration 30d.
       - Fuentes: `CacheFirst`, expiration 1yr.
       - Loaders del dash (`/dash/*`): `NetworkFirst`, timeout 3s, fallback al cache.
       - **NO cachear**: `/api/*`, `/magic-link/*`, `/auth/*`, `/stripe/*`, `/mercadopago/*`, cualquier respuesta con `Set-Cookie`.
     - `workbox.navigateFallbackDenylist`: `[/^\/api\//, /^\/magic-link\//, /^\/auth\//]`.
  3. Registrar SW solo en cliente del dash (scope `/dash`) para evitar interferir con booking público y landings.
  4. UI: banner "Nueva versión disponible — recargar" cuando `vite-plugin-pwa` detecte update (hook `useRegisterSW`).
  5. Testing: Chrome DevTools → Application → Service Workers; modo offline → verificar que el shell carga; verificar que loaders devuelvan datos frescos cuando hay red.

  ### Fase 3 — Push notifications (2-3 días)
  El verdadero ROI de PWA para Denik. Owners reciben notif inmediata de nuevas reservas/pagos sin tener el dash abierto. Hoy esto va por email/WhatsApp; push es complementario y más rápido.
  1. **DB**: modelo `PushSubscription { id, userId, endpoint, p256dh, auth, userAgent, createdAt }` en `prisma/schema.prisma`. Index por `userId`.
  2. **VAPID keys**: generar con `npx web-push generate-vapid-keys`. Setear `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT="mailto:hola@denik.me"` en Fly secrets y `.env`.
  3. **Endpoints nuevos**:
     - `POST /api/push/subscribe` — recibe `PushSubscriptionJSON`, guarda en DB para el `userId` autenticado.
     - `POST /api/push/unsubscribe` — elimina por `endpoint`.
     - `POST /api/push/test` (solo admin/dev) — manda push de prueba.
  4. **Cliente**: hook `usePushSubscription()` en `app/hooks/` que:
     - Verifica `'serviceWorker' in navigator && 'PushManager' in window`.
     - Pide permiso `Notification.requestPermission()`.
     - Llama `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`.
     - POST al endpoint con el sub.
  5. **UI**: prompt opt-in en `/dash` (modal o banner persistente "Activa notificaciones para no perderte reservas"). Esconder si ya está suscrito o si denegó.
  6. **SW handler** (`public/sw-push.js` o inline en vite-plugin-pwa): listener `push` que muestra `self.registration.showNotification(title, { body, icon, badge, data: { url } })`. Listener `notificationclick` que abre `event.notification.data.url`.
  7. **Disparar push desde webhooks/eventos** — helper `sendPushToOwner(orgId, payload)` en `app/lib/push.server.ts` usando `web-push`. Llamar desde:
     - `app/routes/mercadopago.webhook.tsx` cuando se crea Event → "Nueva reserva confirmada: {customer} para {service}".
     - `app/routes/service.$serviceSlug.tsx` action cuando se crea Event gratis → mismo mensaje.
     - `app/lib/event-cancel.server.ts` cuando cliente cancela → "Cancelación: {customer}".
     - Webhook Stripe `invoice.paid` → "Pago de suscripción recibido".
  8. **iOS caveat**: web push solo funciona si la PWA está instalada desde Safari (iOS 16.4+). Documentar en `/dash/asistente` un mini-tutorial "Add to Home Screen" para owners en iPhone.
  9. **Limpieza**: cuando `web-push` devuelva 410/404 en un endpoint (sub expirada), borrar de DB automáticamente.

  ### Fase 4 — Offline parcial (1-2 días, probable SKIP)
  Baja prioridad: el dash es 90% datos en vivo. Sin red, casi no hay valor.
  - Si se hace: cachear última versión de loaders de `/dash/citas`, `/dash/clientes`, `/dash/servicios` con `StaleWhileRevalidate`. Mostrar badge "datos posiblemente desactualizados" cuando sirvió cache.
  - **No** implementar queue de mutaciones offline (crear cita offline → sync cuando vuelva red). Es overhead enorme para casi ningún caso real.
  - Decidir tras Fase 3: medir cuántos owners reportan "el dash no carga en mala red" antes de invertir aquí.

  ### Riesgos a vigilar
  - **CSP `frame-ancestors`** (root.tsx:22): SW no afecta, pero ojo si después agregás `Service-Worker-Allowed` header.
  - **Sesiones**: el SW NUNCA debe cachear respuestas con `Set-Cookie` ni rutas autenticadas mal scopadas. Configurar `workbox` con denylist explícita.
  - **Multi-subdomain**: si después se decide PWA por org (`{slug}.denik.me`), es un proyecto separado mucho mayor — cada subdominio necesita su propio SW y manifest. Por ahora: solo `www.denik.me/dash`.

  ### Recomendación de ejecución
  **Arrancar solo con Fase 1 (3-4h)**, mergear, medir adopción real (cuántos owners instalan la app) durante 2-4 semanas, y solo entonces decidir Fase 2/3. Fase 1 es bajo riesgo, alto impacto de percepción ("ya tenemos app"). Fase 3 (push) es donde está el ROI real pero requiere device iOS para QA — no arrancarla sin acceso a un iPhone físico. Fase 4 mantenerla descartada hasta que owners reporten problemas de carga en mala red.

  | Fase | Entrega | Tiempo enfocado |
  |---|---|---|
  | 1 — Instalable | Botón "Instalar app", ícono en home, splash | **3-4 horas** |
  | 2 — Cache shell | Carga rápida en mala red, banner de actualización | **1-1.5 días** |
  | 3 — Push notifs | Notif inmediata al owner de reservas/pagos | **2-3 días** |
  | 4 — Offline parcial | Cache de loaders del dash (skip recomendado) | **1-2 días** |

  Total fases 1-3: ~5-7 días de trabajo enfocado. Sin device iOS físico súmale 0.5-1 día a Fase 3.
- [x] ~~**BUG PROD**: Magic links usan `/login/signin` pero la ruta es `/signin` - 404 en prod~~ (corregido en sendAppointment.ts)
- [x] ~~**META TAGS**: Revisar y mejorar meta tags en las landings publicadas~~ (OG tags en booking público y landing de org)
- [ ] **AI Landing en S3**: Subir HTML generado a S3/CloudFront en vez de servirlo via iframe srcDoc (mejor SEO, carga directa, sin limitaciones de iframe). Actualmente se usa `<iframe srcDoc>` fullscreen en `home.tsx` como workaround porque React Router v7 no permite devolver raw HTML desde loaders.
- [x] ~~**DALL-E + S3 para landings**: Imágenes generadas con DALL-E 3, persistidas en Tigris~~ (SDK 0.2.11 con `persistImage` callback, Denik sube a `landings/{orgId}/`)
- [x] ~~**Opus para landings**: `generateOrgLanding` ahora usa `claude-sonnet-4-6`~~ (refine usa Haiku 4.5 sin imagen, Sonnet 4.6 con imagen de referencia)
- [ ] **AI Landing — Referencias visuales**: El editor ya acepta imagen de referencia (base64 upload → vision model replica el diseño). Extender para aceptar también **links de Figma** via MCP (`figma-to-code`), donde el usuario pega un share link y el sistema extrae el diseño como referencia para generar/refinar secciones. La biblioteca SDK debe exponer esto como opción (`referenceUrl?: string` además de `referenceImage?: string`).
- [x] ~~**AI Landing — Fix de contraste (texto negro sobre fondo negro)**~~ (resuelto en SDK `@easybits.cloud/html-tailwind-generator@0.2.133` — `sanitizeColors.ts` ahora tiene un pass ancestor-aware que mantiene stack de `bg-family` y reescribe cada `text-*` para que case con el ancestro. Fix en la raíz — no hace falta validador post en Denik)
- [x] ~~**AI Landing — Links de servicios no se inyectan**~~ (`buildOrgPrompt` ahora pasa slugs al modelo y `injectServiceLinks()` en `app/lib/landing-generator.server.ts` sustituye hrefs por `/{slug}` basándose en el texto del ancla; se aplica en `onSection`/`onImageUpdate`/`onDone` de generate y refine)
- [ ] **AI Landing — Validador de contraste con Vision (fase 2)**: El walker ancestor-aware en `sanitizeColors.ts` cubre los casos deterministas (text-on-X vs ancestro real, tintes `/XX` < 50%). Faltan los casos que solo un humano nota: (a) texto sobre imagen sin overlay suficiente, (b) `text-accent` cuyo hue + luminancia choca con el `bg-surface` del tema (ej. accent azul claro sobre surface blanco), (c) contraste decorativo que cumple WCAG técnico pero se ve mal. Estrategia tipo Replit/v0: renderizar la landing generada a imagen (puppeteer headless o DOM-to-canvas), mandarla a un modelo vision ("detecta texto con bajo contraste, marca cada issue con el selector CSS"), aplicar correcciones sugeridas. Costo estimado: ~$0.02/landing con GPT-4o-mini vision o Gemini Flash. Implementar como paso opcional post-generación detrás de un flag `visionContrastCheck: true` en `GenerateOptions`. Antes de construir esto: medir cuántos issues reales deja escapar el walker actual en 10-20 generaciones reales.
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
