import { Link } from "react-router";

export default function MPFailure() {
  return (
    <article className="min-h-screen bg-red-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Pago rechazado
        </h1>
        <p className="text-gray-600 mb-6">
          El pago no pudo ser procesado. Por favor intenta de nuevo o usa otro
          método de pago.
        </p>
        <Link
          to="/"
          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
        >
          Volver a intentar
        </Link>
      </div>
    </article>
  );
}
