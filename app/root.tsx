import type { ReactNode } from "react"
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  useRouteError,
} from "react-router"
import { ParallaxProvider } from "react-scroll-parallax"
import { isOrgDomain, isRouteAllowedOnOrgDomain } from "~/utils/host.server"
import type { Route } from "./+types/root"
import stylesheet from "./app.css?url"
import { getMetaTags } from "./utils/getMetaTags"

export const meta = () =>
  getMetaTags({
    title: "Tienes un mensaje sorpresa esperandote 🎁",
    description: `Te han dejado un mensaje`,
    image: "/xmas/message-alert.png",
  })

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
  {
    rel: "icon",
    href: "/images/agenda-dash.svg",
    type: "image/svg+xml",
  },
]

export const loader = async ({ request }: Route.LoaderArgs) => {
  const isOrg = isOrgDomain(request)
  const url = new URL(request.url)

  // Block app routes on subdomains/custom domains
  if (isOrg && !isRouteAllowedOnOrgDomain(url.pathname)) {
    throw redirect("/")
  }

  return null
}

export function Layout({ children }: { children: ReactNode }) {
  // useGoogleTM();
  // useHotjar();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        {/* <ScrollRestoration  /> */}
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <ParallaxProvider>
      <Outlet />
    </ParallaxProvider>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const isDev = process.env.NODE_ENV === "development"

  const is404 = isRouteErrorResponse(error)
  const isError = error instanceof Error

  return (
    <div className="text-white pt-20 p-8">
      <h1 className="text-2xl font-bold mb-4">
        {is404 ? (
          <>
            {error.status} {error.statusText}
          </>
        ) : (
          "Ha ocurrido un error"
        )}
      </h1>
      {is404 && <p>{error.data}</p>}
      {isError && isDev && (
        <details className="mt-4">
          <summary className="cursor-pointer text-gray-400">
            Detalles del error (solo en desarrollo)
          </summary>
          <pre className="mt-2 text-sm bg-gray-900 p-4 rounded overflow-auto">
            {error.message}
            {"\n\n"}
            {error.stack}
          </pre>
        </details>
      )}
      {!isDev && isError && (
        <p className="text-gray-400">
          Por favor intenta de nuevo o contacta soporte si el problema persiste.
        </p>
      )}
    </div>
  )
}
