/**
 * Route: /error?reason=xxx
 * Generic error page for event action errors
 */
import type { Route } from "./+types/error"

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  missing_token: {
    title: "Link inválido",
    message: "El link que usaste no contiene un token válido.",
  },
  invalid_token: {
    title: "Link expirado o inválido",
    message:
      "El link que usaste ha expirado o no es válido. Los links de citas expiran después de 7 días.",
  },
  event_not_found: {
    title: "Cita no encontrada",
    message: "No pudimos encontrar la cita asociada a este link.",
  },
  unauthorized: {
    title: "No autorizado",
    message: "No tienes permiso para acceder a esta cita.",
  },
  session_expired: {
    title: "Sesión expirada",
    message:
      "Tu sesión ha expirado. Por favor usa el link del email nuevamente.",
  },
  invalid_action: {
    title: "Acción no válida",
    message: "La acción solicitada no es válida.",
  },
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const reason = url.searchParams.get("reason") || "unknown"

  const errorInfo = ERROR_MESSAGES[reason] || {
    title: "Error",
    message: "Ha ocurrido un error inesperado.",
  }

  return { reason, ...errorInfo }
}

export default function ErrorPage({ loaderData }: Route.ComponentProps) {
  const { title, message } = loaderData

  return (
    <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>

        <a
          href="/"
          className="inline-block bg-brand_blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Ir al inicio
        </a>
      </div>
    </main>
  )
}
