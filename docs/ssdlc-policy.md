# Denik Agenda — Secure Software Development Lifecycle (SSDLC)

**Company:** Denik / Easybits LLC
**Last Updated:** April 2026

---

## 1. Secure Design

- All features follow a defined architecture pattern with server-side logic isolated in `.server.ts` files, ensuring sensitive code never reaches the client.
- OAuth 2.0 is used for all third-party integrations (Zoom, Google, MercadoPago, Stripe) with token refresh and secure storage in the database.
- Authentication uses magic links (passwordless) to eliminate password-related vulnerabilities.

## 2. Secure Coding Practices

- **Framework-level protections:** Built on React Router v7 (Remix) which provides CSRF protection via form actions, automatic output encoding, and server/client code separation.
- **Input validation:** Zod schemas validate all user input on the server side (`app/utils/zod_schemas.ts`).
- **SQL/NoSQL injection prevention:** Prisma ORM is used for all database operations, preventing injection attacks.
- **XSS prevention:** React's default escaping and Content Security Policy headers are in place.
- **OWASP security headers:** Implemented via `entry.server.tsx` including `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`.

## 3. Secret Management

- All secrets (API keys, database credentials, OAuth secrets) are stored as environment variables in Fly.io's encrypted secrets store.
- No secrets are committed to source code — `.env` files are in `.gitignore`.
- Webhook signatures are verified for Stripe (`STRIPE_WEBHOOK_SECRET`) and MercadoPago (`MP_WEBHOOK_SECRET`) to ensure authenticity.

## 4. Dependency Management

- Dependencies are managed via `package.json` with lock files for reproducible builds.
- npm audit is used to check for known vulnerabilities in dependencies.

## 5. Code Review & Version Control

- All code is managed in a private Git repository (GitHub).
- Changes go through pull request review before merging to main.
- Branch protections are enabled on the main branch.

## 6. Deployment & Infrastructure

- Application is deployed on **Fly.io** with TLS termination (HTTPS enforced).
- Database hosted on **MongoDB Atlas** with network-level access controls and encryption at rest.
- File storage on **Tigris (S3-compatible)** with presigned URLs for secure access.

## 7. Incident Response

- Application logs are monitored via Fly.io's logging infrastructure.
- Webhook idempotency checks prevent duplicate processing of payments.
- Token refresh mechanisms handle expired credentials gracefully.

## 8. Data Protection

- Passwords are never stored (magic link authentication).
- OAuth tokens are stored encrypted in the database with expiration tracking.
- Customer PII is scoped per organization (multi-tenant isolation via `orgId`).
- Privacy policy available at `/avisodeprivacidad`.
