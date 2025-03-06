import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("planes", "routes/planes.tsx"),
  //login
  route("signin", "routes/login/signin.tsx"),
  route("signup/:stepSlug", "routes/login/signup.$stepSlug.tsx"),
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
          "routes/dash/servicios/dash.servicios_.$serviceId.tsx"
        ),
        route(
          ":serviceId/general",
          "routes/dash/servicios/dash.servicios_.$serviceId_.general.tsx"
        ),
        route(
          ":serviceId/agendamiento",
          "routes/dash/servicios/dash.servicios_.$serviceId_.agendamiento.tsx"
        ),
        route(
          ":serviceId/horario",
          "routes/dash/servicios/dash.servicios_.$serviceId_.horario.tsx"
        ),
        route(
          ":serviceId/cobros",
          "routes/dash/servicios/dash.servicios_.$serviceId_.cobros.tsx"
        ),
      ]),
      route("website", "routes/dash/website/dash.website.tsx"),
      route("clientes/:email", "routes/dash/dash_.clientes_.$email.tsx"),
      route("clientes", "routes/dash/dash.clientes.tsx"),
      route("lealtad", "routes/dash/dash.lealtad.tsx"),
      route("evaluaciones", "routes/dash/dash.reviews.tsx"),
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
  ]),
  // Stripe
  ...prefix("stripe", [index("routes/stripe/api.ts")]),
  // Public
  route(
    "a/:orgSlug/s/:serviceSlug",
    "routes/agenda.$orgSlug.$serviceSlug/route.tsx"
  ),
  route("a/:orgSlug", "routes/clientwebsite.tsx"),
] satisfies RouteConfig;
