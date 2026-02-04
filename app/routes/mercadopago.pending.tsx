import { Link } from "react-router"

export default function MPPending() {
  return (
    <article className="min-h-screen bg-yellow-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">
          Pago pendiente
        </h1>
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Te notificaremos por email cuando se
          confirme tu cita.
        </p>
        <Link
          to="/"
          className="inline-block bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </article>
  )
}
