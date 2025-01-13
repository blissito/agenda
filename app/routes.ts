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
      route("agenda", "routes/dash/dash.agenda.tsx"),
    ]),
    // api
    ...prefix("api", [route("customers", "routes/api/customers.ts")]),
  ]),
] satisfies RouteConfig;
