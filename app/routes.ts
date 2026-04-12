import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("planes", "routes/planes.tsx"),
  route("funcionalidades", "routes/features.tsx"),
  route("negocios", "routes/como-funciona.tsx"),
  route("community", "routes/Community/Community.tsx"),
  route("terminosycondiciones", "routes/terminosycondiciones.tsx"),
  route("avisodeprivacidad", "routes/avisodeprivacidad.tsx"),
  route("privacidad", "routes/privacidad.tsx"),
  route("blog", "routes/help.tsx"),
  //login
  route("signin", "routes/login/signin.tsx"),
  route("signup", "routes/login/signup._index.tsx"),
  route("signup/:stepSlug", "routes/login/signup.$stepSlug.tsx"),
  // OAuth
  route("auth/:provider", "routes/auth.$provider.tsx"),
  route("auth/callback/:provider", "routes/auth.callback.$provider.tsx"),
  // dashboard
  ...prefix("dash", [
    layout("routes/dash/dash_layout.tsx", [
      index("routes/dash/dash._index.tsx"),
      route("asistente", "routes/dash/dash.asistente.tsx"),
      route("perfil", "routes/dash/dash.profile.tsx"),
      route("agenda", "routes/dash/dash.agenda.tsx"),
      route("agenda/citas", "routes/dash/dash.agenda.citas.tsx"),
      route("onboarding", "routes/dash/dash.onboarding.tsx"),
      ...prefix("servicios", [
        index("routes/dash/servicios/index.tsx"),
        route("nuevo", "routes/dash/servicios/new.tsx"),
        route(
          ":serviceId",
          "routes/dash/servicios/dash.servicios_.$serviceId.tsx",
        ),
        route(
          ":serviceId/general",
          "routes/dash/servicios/dash.servicios_.$serviceId_.general.tsx",
        ),
        route(
          ":serviceId/agendamiento",
          "routes/dash/servicios/dash.servicios_.$serviceId_.agendamiento.tsx",
        ),
        route(
          ":serviceId/horario",
          "routes/dash/servicios/dash.servicios_.$serviceId_.horario.tsx",
        ),
        route(
          ":serviceId/cobros",
          "routes/dash/servicios/dash.servicios_.$serviceId_.cobros.tsx",
        ),
        route(
          ":serviceId/acciones",
          "routes/dash/servicios/dash.servicios_.$serviceId_.acciones.tsx",
        ),
      ]),
      route("chatbot", "routes/dash/dash.chatbot.tsx"),
      route("website", "routes/dash/website/dash.website.tsx"),
      route("website/ai", "routes/dash/dash.website_.ai.tsx"),
      route("clientes/:email", "routes/dash/dash_.clientes_.$email.tsx"),
      route("clientes", "routes/dash/dash.clientes.tsx"),
      route("lealtad", "routes/dash/dash.lealtad.tsx"),
      route("evaluaciones", "routes/dash/dash.reviews.tsx"),
      route(
        "evaluaciones/:serviceId",
        "routes/dash/dash.reviews_.$serviceId.tsx",
      ),
      route("ajustes", "routes/dash/dash.ajustes.tsx"),
      route("google-calendar/connect", "routes/dash/dash.google-calendar-connect.tsx"),
      route("google-calendar/callback", "routes/dash/dash.google-calendar-callback.tsx"),
      route("zoom/connect", "routes/dash/dash.zoom-connect.tsx"),
      route("zoom/callback", "routes/dash/dash.zoom-callback.tsx"),

      route("ventas", "routes/dash/pagos.tsx"),
    ]),
  ]),
  // api
  ...prefix("api", [
    route("customers", "routes/api/customers.ts"),
    route("services", "routes/api/services.ts"),
    route("employees", "routes/api/employees.ts"),
    route("events", "routes/api/events.ts"),
    route("org", "routes/api/api.org.ts"),
    route("domain", "routes/api/api.domain.ts"),
    route("loyalty", "routes/api/loyalty.ts"),
    route("images", "routes/api/api.images.ts"),
    route("landing-generator", "routes/api/landing-generator.ts"),
    route("asistente", "routes/api/asistente.ts"),
    // MCP (stdio server @denik/mcp) — auth via X-Denik-Api-Key
    route("mcp/events", "routes/api/mcp.events.ts"),
    route("mcp/services", "routes/api/mcp.services.ts"),
    route("mcp/customers", "routes/api/mcp.customers.ts"),
    route("mcp/org", "routes/api/mcp.org.ts"),
    route("mcp/landing", "routes/api/mcp.landing.ts"),
    // WhatsApp group provisioning (Nik)
    route("whatsapp/link", "routes/api/whatsapp.link.ts"),
  ]),
  // Stripe
  ...prefix("stripe", [
    index("routes/stripe/api.ts"),
    route("webhook", "routes/stripe/webhook.ts"),
  ]),
  // MercadoPago
  ...prefix("mercadopago", [
    route("oauth", "routes/mercadopago.oauth.tsx"),
    route("webhook", "routes/mercadopago.webhook.ts"),
    route("success", "routes/mercadopago.success.tsx"),
    route("pending", "routes/mercadopago.pending.tsx"),
    route("failure", "routes/mercadopago.failure.tsx"),
  ]),
  // Zoom webhook
  route("zoom/webhook", "routes/zoom.webhook.ts"),
  // Nanoclaw callback (respuestas del asistente)
  route("whatsapp/webhook", "routes/whatsapp.webhook.ts"),
  route("whatsapp/link/callback", "routes/whatsapp.link.callback.ts"),
  // Demo
  route("demo/smatch", "routes/demo.smatch.tsx"),
  // Public org landing (works on localhost): /agenda/:orgSlug
  route("agenda/:orgSlug", "routes/agenda.$orgSlug._index.tsx"),
  // Public booking route (works on localhost): /agenda/:orgSlug/:serviceSlug
  route(
    "agenda/:orgSlug/:serviceSlug",
    "routes/agenda.$orgSlug.$serviceSlug.tsx",
  ),
  // Error page
  route("error", "routes/error.tsx"),
  // Event actions from email links
  route("event/action", "routes/event.action.tsx"),
  route("event/:eventId/confirm", "routes/event.$eventId.confirm.tsx"),
  route("event/:eventId/modify", "routes/event.$eventId.modify.tsx"),
  route("event/:eventId/cancel", "routes/event.$eventId.cancel.tsx"),
  // Survey from email links
  route("survey", "routes/survey.tsx"),
  // Review page for a specific appointment
  route("mi-cuenta/perfil/resena/:eventId", "routes/mi-cuenta.perfil.resena.$eventId.tsx"),
  // Customer portal
  route("mi-cuenta", "routes/mi-cuenta._index.tsx"),
  route("mi-cuenta/perfil", "routes/mi-cuenta.perfil.tsx"),
  // Clean URL for subdomains/custom domains: /:serviceSlug
  route(":serviceSlug", "routes/service.$serviceSlug.tsx"),
] satisfies RouteConfig
