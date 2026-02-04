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
      route("perfil", "routes/dash/dash.profile.tsx"),
      route("agenda", "routes/dash/dash.agenda.tsx"),
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
      route("website", "routes/dash/website/dash.website.tsx"),
      route("clientes/:email", "routes/dash/dash_.clientes_.$email.tsx"),
      route("clientes", "routes/dash/dash.clientes.tsx"),
      route("lealtad", "routes/dash/dash.lealtad.tsx"),
      route("evaluaciones", "routes/dash/dash.reviews.tsx"),
      route(
        "evaluaciones/:serviceId",
        "routes/dash/dash.reviews_.$serviceId.tsx",
      ),
      route("ajustes", "routes/dash/dash.ajustes.tsx"),
      route("pagos", "routes/dash/pagos.tsx"),
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
  ]),
  // Stripe
  ...prefix("stripe", [index("routes/stripe/api.ts")]),
  // MercadoPago
  ...prefix("mercadopago", [
    route("oauth", "routes/mercadopago.oauth.tsx"),
    route("webhook", "routes/mercadopago.webhook.ts"),
    route("success", "routes/mercadopago.success.tsx"),
    route("pending", "routes/mercadopago.pending.tsx"),
    route("failure", "routes/mercadopago.failure.tsx"),
  ]),
  // Demo
  route("demo/smatch", "routes/demo.smatch.tsx"),
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
  // Clean URL for subdomains/custom domains: /:serviceSlug
  route(":serviceSlug", "routes/service.$serviceSlug.tsx"),
] satisfies RouteConfig
