import { Link } from "react-router";

export default function MPSuccess() {
  return (
    <article className="min-h-screen bg-green-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-600 mb-6">
          Tu cita ha sido agendada. Recibirás un email de confirmación en breve.
        </p>
        <Link
          to="/"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </article>
  );
}
