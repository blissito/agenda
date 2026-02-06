# Denik Agenda

**Sistema de agendamiento inteligente para negocios que valoran el tiempo de sus clientes.**

Denik Agenda es una plataforma multi-tenant que permite a cualquier negocio gestionar citas, servicios y clientes desde un dashboard intuitivo. Tus clientes reservan en segundos a través de tu subdominio personalizado, reciben confirmaciones automáticas por email, y pueden pagar en línea con Stripe o MercadoPago. Sin contraseñas que recordar: usamos magic links para una experiencia de autenticación moderna y segura.

Construido con tecnologías de vanguardia —React Router v7, TypeScript, Prisma con MongoDB, y AWS SES— Denik Agenda escala desde freelancers hasta empresas con múltiples sucursales. Incluye sistema de lealtad con puntos y tiers, webhooks idempotentes para pagos confiables, y una arquitectura lista para integraciones como WhatsApp y Messenger. Cada feature está diseñado para reducir fricción: menos clics para tus clientes, menos trabajo manual para ti.

**Desarrollado por [Brenda](https://github.com/brendadenisse16) y [Héctor BlisS](https://github.com/blissito) en [Fixter.org](https://fixter.org)** — Creamos software a la medida que resuelve problemas reales. Si necesitas un sistema de reservaciones, una plataforma SaaS, o cualquier solución web moderna, [contáctanos](https://fixter.org). Transformamos ideas en productos que funcionan.

---

**Stack:** React Router v7 • TypeScript • Prisma • MongoDB • Stripe • MercadoPago • AWS SES

## Estado de Features

| Feature                | Estado |
| ---------------------- | ------ |
| Auth (magic link)      | ✅ |
| Booking publico        | ✅ |
| Dashboard              | ✅ |
| Email notifications    | ✅ |
| MercadoPago            | ✅ OAuth, webhooks idempotentes, token refresh |
| Loyalty (puntos/tiers) | ✅ |
| Stripe Connect         | ⚠️ Legacy — se oculta si faltan env vars |
| Webhooks Stripe        | ⚠️ Legacy — requiere `STRIPE_WEBHOOK_SECRET` en Fly |
| Tests                  | ❌ 0% |

## URGENTE

- [ ] **Agregar `STRIPE_WEBHOOK_SECRET` en Fly secrets** — sin esta variable el webhook Stripe rechaza todo con 400. Obtener de [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) y correr: `fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."`
- [ ] **CI/CD**: Los checks de GitHub Actions nunca pasan — investigar y arreglar el pipeline
