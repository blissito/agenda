import { useEffect } from "react"
import { Link, type MetaFunction } from "react-router"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"

export const meta: MetaFunction = () => [
  { title: "IA ✨ | Deník" },
  {
    name: "description",
    content:
      "Próximamente: descubre cómo la IA de Deník atiende a tus clientes y automatiza tu agenda.",
  },
]

export default function IA() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="bg-brand_dark min-h-screen flex flex-col">
      <div className="bg-white rounded-b-[40px] overflow-x-clip flex-1 flex flex-col">
        <TopBar />
        <section className="flex-1 flex flex-col items-center justify-center text-center max-w-[90%] xl:max-w-3xl mx-auto pt-40 md:pt-48 pb-20 md:pb-32">
          <div className="relative flex items-center justify-center w-full">
            <span className="text-[120px] sm:text-[180px] md:text-[240px] font-satoBold text-gray-200 select-none leading-none">
              IA
            </span>
            <img
              src="/images/nik.svg"
              alt="Nik"
              className="absolute w-[110px] sm:w-[160px] md:w-[220px] bottom-2"
            />
          </div>

          <span className="mt-6 inline-block bg-brand_blue/10 text-brand_blue text-xs md:text-sm font-satoBold uppercase tracking-widest px-4 py-2 rounded-full">
            ✨ Próximamente
          </span>

          <h1 className="text-3xl md:text-5xl font-satoBold text-brand_dark mt-4 md:mt-6 leading-tight">
            Estamos construyendo algo increíble
          </h1>

          <p className="text-base md:text-xl text-brand_gray font-satoshi mt-4 md:mt-6 max-w-xl">
            Muy pronto vas a poder conocer aquí todo sobre la IA de Deník: tu
            asistente personal por WhatsApp y el chatbot que agenda citas por
            ti 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 md:mt-10 w-full sm:w-auto">
            <Link
              to="/funcionalidades#ia"
              className="bg-brand_blue text-white px-6 md:px-8 py-3 rounded-full text-base font-satoMedium hover:opacity-90 transition-opacity"
            >
              Ver funcionalidades
            </Link>
            <Link
              to="/"
              className="bg-brand_pale text-brand_dark px-6 md:px-8 py-3 rounded-full text-base font-satoMedium hover:opacity-90 transition-opacity"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
