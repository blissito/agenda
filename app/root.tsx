import { FormmyProvider } from "@formmy.app/chat/react"
import type { ReactNode } from "react"
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  useLoaderData,
  useRouteError,
} from "react-router"
import { ParallaxProvider } from "react-scroll-parallax"
import { isOrgDomain, isRouteAllowedOnOrgDomain } from "~/utils/host.server"
import type { Route } from "./+types/root"
import stylesheet from "./app.css?url"
import { getMetaTags } from "./utils/getMetaTags"

export const headers = () => ({
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "frame-ancestors 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
})

export const meta = () => getMetaTags({})

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

  return {
    formmyPublishableKey: process.env.FORMMY_PUBLISHABLE_KEY || null,
  }
}

export function Layout({ children }: { children: ReactNode }) {
  // useGoogleTM();
  // useHotjar();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="zoom-domain-verification"
          content="ZOOM_verify_57e48124bb5a490c8caea186034dd160"
        />
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
  const data = useLoaderData<typeof loader>()
  const content = (
    <ParallaxProvider>
      <Outlet />
    </ParallaxProvider>
  )

  if (data?.formmyPublishableKey) {
    return (
      <FormmyProvider publishableKey={data.formmyPublishableKey}>
        {content}
      </FormmyProvider>
    )
  }

  return content
}

export function ErrorBoundary() {
  const error = useRouteError()
  const isDev = process.env.NODE_ENV === "development"

  const is404 = isRouteErrorResponse(error)
  const isError = error instanceof Error

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center px-6">
      {/* 404 background text */}
      <div className="relative flex items-center justify-center">
        <span className="text-[200px] md:text-[280px] font-satoBold text-gray-200 select-none leading-none">
          {is404 ? error.status : "Error"}
        </span>
        <img
          src="/images/nik.svg"
          alt=""
          className="absolute w-[180px] md:w-[260px] bottom-4"
        />
      </div>

      <h1 className="text-2xl md:text-4xl font-satoBold text-brand_dark text-center mt-6">
        {is404
          ? "Ups, \u00a1Esta p\u00e1gina no existe!"
          : "Ha ocurrido un error"}
      </h1>

      {isError && isDev && (
        <details className="mt-4 max-w-xl w-full">
          <summary className="cursor-pointer text-gray-400 text-sm">
            Detalles del error (solo en desarrollo)
          </summary>
          <pre className="mt-2 text-sm bg-gray-900 text-white p-4 rounded overflow-auto">
            {error.message}
            {"\n\n"}
            {error.stack}
          </pre>
        </details>
      )}

      <a
        href="/"
        className="mt-8 bg-brand_blue text-white px-8 py-3 rounded-full text-base font-satoMedium hover:opacity-90 transition-opacity"
      >
        Volver a la pagina principal
      </a>
    </div>
  )
}
