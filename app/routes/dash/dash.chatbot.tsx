import type { Route } from "./+types/dash.chatbot"

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {}
}

export default function ChatbotIA() {
  return (
    <section className="flex flex-col items-center justify-center h-[70vh] text-center">
      <img
        src="/images/illustrations/ghosty-puzzle.svg"
        alt="Ghosty - asistente inteligente"
        className="mb-8 w-[304px] h-[206px]"
      />
      <h1 className="text-2xl font-satoBold text-brand_dark mb-2">
        Conoce a Ghosty: tu asistente inteligente de agendamiento
      </h1>
      <p className="text-base text-brand_gray max-w-2xl">
        Denik trabaja con FormmyApp para potenciar tu agenda digital con
        Inteligencia Artificial.
      </p>
      <button className="mt-8 bg-brand_blue text-white font-satoMedium text-base px-4 h-12 rounded-full hover:opacity-90 transition-opacity cursor-pointer">
        Activar
      </button>
    </section>
  )
}
