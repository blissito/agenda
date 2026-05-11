# Denik Agenda

**Sistema de agendamiento inteligente para negocios que valoran el tiempo de sus clientes.**

Denik Agenda es una plataforma multi-tenant que permite a cualquier negocio gestionar citas, servicios y clientes desde un dashboard intuitivo. Tus clientes reservan en segundos a través de tu subdominio personalizado, reciben confirmaciones automáticas por email, y pueden pagar en línea con Stripe o MercadoPago. Sin contraseñas que recordar: usamos magic links para una experiencia de autenticación moderna y segura.

Construido con tecnologías de vanguardia —React Router v7, TypeScript, Prisma con MongoDB, y AWS SES— Denik Agenda escala desde freelancers hasta empresas con múltiples sucursales. Incluye sistema de lealtad con puntos y tiers, webhooks idempotentes para pagos confiables, y una arquitectura lista para integraciones como WhatsApp y Messenger. Cada feature está diseñado para reducir fricción: menos clics para tus clientes, menos trabajo manual para ti.

**Desarrollado por [Brenda](https://github.com/brendadenisse16) y [Héctor BlisS](https://github.com/blissito) en [Fixter.org](https://fixter.org)** — Creamos software a la medida que resuelve problemas reales. Si necesitas un sistema de reservaciones, una plataforma SaaS, o cualquier solución web moderna, [contáctanos](https://fixter.org). Transformamos ideas en productos que funcionan.

---

**Stack:** React Router v7 • TypeScript • Prisma • MongoDB • Stripe • MercadoPago • AWS SES • Gemini 2.5 Pro • DALL-E 3

## ⚠️ Billing de IA — quién paga qué

> **Denik paga directo a los proveedores de IA con sus propias API keys.** Easybits **no** intermedia ni cobra por uso — sólo publica el SDK de generación (`@easybits.cloud/html-tailwind-generator`) como código que corre en nuestro servidor. No hay cuenta, saldo, ni recargas con Easybits.

| Proveedor | Para qué | Variable de entorno (Fly secrets) | Requerida |
|---|---|---|---|
| **Google** (Gemini 2.5 Pro) | Generación y refine de landings | `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ sí |
| **Anthropic** (Claude) | SVG charts dentro de landings (`data-svg-chart`) | `ANTHROPIC_API_KEY` | opcional |
| **OpenAI** (DALL-E 3) | Imágenes generadas para landings (fallback de Pexels) | `OPENAI_API_KEY` | opcional |
| **Pexels** | Banco de imágenes (default, gratis) | `PEXELS_API_KEY` | opcional |

**Costos típicos por operación** — Gemini 2.5 Pro pricing: $1.25/M input · $10/M output (≤200K context). Constantes en `COST_USD` (`app/lib/landing-generator.server.ts`):

| Operación | USD aprox por op |
|---|---|
| Generar landing | ~$0.13 |
| Refine | ~$0.06 |
| Imagen DALL-E (si configurada) | $0.04–0.08 |

**Tracking de costo en DB** (campos en `Org`, lifetime — no se resetean):
- `landingTotalCostUsd: Float` — USD acumulado por org.
- `landingTotalGens: Int` — total de generaciones lifetime.
- `landingTotalRefines: Int` — total de refines lifetime.

Estos campos los suma `incrementLandingUsage()` en cada operación con las constantes de `COST_USD`. La pantalla de admin lee directamente esos campos. (Cuando el SDK exponga un callback de `usage` en el stream, podremos sustituir las constantes por tokens reales.)

**Cuotas internas (no son saldo, son contadores mensuales):** `Org.landingGenCount` y `Org.landingRefineCount` reseteados cada mes. Default: 5 gens + 20 refines/mes por org. Definidos en `LIMITS` (`app/lib/landing-generator.server.ts:20`). Cuando se exceden el endpoint regresa 429 — pero el costo ya se cobró si la generación llegó a correr.

**Si la `GOOGLE_GENERATIVE_AI_API_KEY` falta o se queda sin saldo en Google:** todas las generaciones fallan inmediatamente. La cuota de Denik no protege contra eso — sólo limita cuántas requests se permiten por org.

**El cliente nunca ve la API key**: el flujo de generación es SSE proxy server-side. Browser → `/api/landing-generator` (servidor) → SDK → Gemini. Si alguien inspecciona el bundle no encuentra credenciales.

## Estado de Features

| Feature                | Estado |
| ---------------------- | ------ |
| Auth (magic link)      | ✅ |
| Booking publico        | ✅ |
| Dashboard              | ✅ |
| Email notifications    | ✅ |
| MercadoPago            | ✅ OAuth, webhooks idempotentes, token refresh |
| AI Landing pages       | ✅ Generación con Claude AI + DALL-E, editor canvas, deploy a subdominio. Usa [`@easybits.cloud/html-tailwind-generator`](https://www.npmjs.com/package/@easybits.cloud/html-tailwind-generator) |
| Loyalty (puntos/tiers) | ✅ |
| Stripe Connect         | ⚠️ Legacy — se oculta si faltan env vars |
| Webhooks Stripe        | ⚠️ Legacy — requiere `STRIPE_WEBHOOK_SECRET` en Fly |
| Tests                  | ❌ 0% |

## URGENTE

- [ ] **Agregar `STRIPE_WEBHOOK_SECRET` en Fly secrets** — sin esta variable el webhook Stripe rechaza todo con 400. Obtener de [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) y correr: `fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."`
- [ ] **CI/CD**: Los checks de GitHub Actions nunca pasan — investigar y arreglar el pipeline
