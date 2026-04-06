import { useEffect } from "react"
import type { MetaFunction } from "react-router"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { FinalCta } from "~/components/home/FinalCta"
import {
  ExpressionEight,
  ExpressionFive,
  ExpressionFour,
  ExpressionOne,
  ExpressionSeven,
  ExpressionSix,
  ExpressionThree,
  ExpressionTwo,
} from "~/components/icons/expresion"
import { HandShake } from "~/components/icons/handshake"
import { Rocket } from "~/components/icons/rocket"
import { UserFeatures } from "~/components/icons/userFeatures"
import { AiChatIllustration } from "~/components/icons/ai-chat"
import { ClientFolderIllustration } from "~/components/icons/client-folder"
import { DashStatsIllustration } from "~/components/icons/dash-stats"
import { LaptopIllustration } from "~/components/icons/laptop"
import { OrbitingStars } from "~/components/icons/orbiting-stars"
import { LoyaltyCardsIllustration } from "~/components/icons/loyalty-cards"
import { PaymentsIllustration } from "~/components/icons/payments"
import { RemindersIllustration } from "~/components/icons/reminders"
import { SiteBuilderIllustration } from "~/components/icons/site-builder"
import { SocialPagesIllustration } from "~/components/icons/social-pages"
import { Card, Carousel } from "~/components/ui/cards-carrusel"

export const meta: MetaFunction = () => [
  { title: "Funcionalidades | Deník" },
  {
    name: "description",
    content:
      "Descubre todas las funcionalidades de Deník: agenda en línea, pagos, recordatorios, IA y más.",
  },
]

export default function Index() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }, [])
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] overflow-x-hidden">
        <TopBar />
        <Features />
        <Business />
        <FinalCta>
          <h2 className="group text-4xl xl:text-6xl	font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">No lo pienses </span>
            <Rocket className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> más.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-satoBold  text-brand_dark mb-16 mt-4 leading-normal ">
            ¡Empieza ahora!
          </h2>
        </FinalCta>
      </div>
      <Footer />
    </main>
  )
}

const Business = () => {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ))
  return (
    <section className="my-[160px] relative ">
      <div className="py-[120px] bg-[#F3F6FA] h-[1200px]  mx-auto rounded-[40px] max-w-7xl">
        <h2 className="group text-4xl lg:text-6xl	font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
          <span className="mr-4"> Para todos los negocios </span>
          <HandShake className="group-hover:animate-vibration-effect cursor-pointer w-16 h-16 md:w-20 md:h-20 mr-3" />
        </h2>
        <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full text-center mx-auto md:w-[90%]">
          Deník se adapta a cualquier tipo de negocio. Descubre cómo podemos
          ayudarte a gestionar tus citas y hacer crecer tu negocio.
        </p>
      </div>{" "}
      <div className="-mt-[900px]">
        <Carousel items={cards} />
      </div>
    </section>
  )
}

const Features = () => {
  return (
    <section className=" flex flex-col  justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto pt-[200px] lg:pt-[24%] xl:pt-[16%]">
      <h2 className="group text-4xl lg:text-6xl	font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4"> Funcionalidades </span>
        <UserFeatures className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] md:w-16 md:h-16 mr-3" />
      </h2>
      <p className="text-xl lg:text-2xl text-brand_gray font-satoshi mt-6 w-full mx-auto md:w-[90%]">
        Prueba todo lo que Deník tiene para ti y tu negocio
      </p>
      <div className="mt-20 flex flex-col gap-8">
        {/* Row 1: 5+3 */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
          <div className="md:col-span-5 min-h-[240px] md:h-[480px] p-8 text-left rounded-2xl border border-[#EFEFEF] relative group transition-all cursor-pointer hover:-translate-x-1 hover:-translate-y-1">
            <ExpressionOne className="opacity-0 absolute w-20 rotate-[270deg] -left-12 -top-12 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Agenda en línea
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Permite a tus clientes reservar citas desde cualquier dispositivo, las 24 horas del día. Tú defines los horarios, la duración y la disponibilidad de cada servicio. Sin llamadas, sin mensajes, sin confusiones.
            </p>
            <LaptopIllustration className="mt-12" />
          </div>
          <div className="md:col-span-3 min-h-[240px] md:h-[480px] rounded-2xl border p-8 text-left border-[#EFEFEF] relative group transition-all cursor-pointer hover:translate-x-1 hover:-translate-y-1">
            <ExpressionTwo className="opacity-0 absolute w-20 -right-14 -top-16 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Recibe pagos en línea
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Cobra por tus servicios al momento de la reserva con MercadoPago. Reduce cancelaciones, asegura tu ingreso y ofrece una experiencia de pago rápida y segura para tus clientes.
            </p>
            <PaymentsIllustration className="mt-10" />
          </div>
        </div>
        {/* Row 2: full width */}
        <div className="grid grid-cols-1 gap-8 group transition-all cursor-pointer hover:-translate-y-1 relative">
          <ExpressionFour className="opacity-0 absolute w-20 -right-14 bottom-16 group-hover:opacity-100 transition-all" />
          <div className="min-h-[240px] md:h-[360px] p-8 text-left rounded-2xl border border-[#EFEFEF]">
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Obtén tu propio sitio web de reservas y personalizalo
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Tu negocio merece su propia presencia en línea. Con Deník obtienes un sitio web con tu nombre, logo, colores y catálogo de servicios listo para compartir con tus clientes. Sin necesidad de saber programar ni contratar a un diseñador.
            </p>
            <SiteBuilderIllustration className="mt-6" />
          </div>
        </div>
        {/* Row 3: 3+5 */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
          <div className="md:col-span-3 min-h-[240px] md:h-[480px] p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1 relative">
            <ExpressionFive className="opacity-0 absolute w-20 -left-14 rotate-[180deg] -bottom-14 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Envía recordatorios automatizados
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Olvídate de las inasistencias. Deník envía recordatorios por correo electrónico antes de cada cita para que tus clientes no olviden su reserva. Menos cancelaciones, más ingresos.
            </p>
            <RemindersIllustration className="mt-16" />
          </div>
          <div className="md:col-span-5 min-h-[240px] md:h-[480px] p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1 relative">
            <ExpressionThree className="opacity-0 absolute w-20 -right-14 top-28 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Ofrece descuentos o promociones por nivel de lealtad
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Premia la lealtad de tus clientes con un programa de puntos y recompensas. Cada visita suma puntos que pueden desbloquear descuentos o promociones especiales. Haz que regresen una y otra vez.
            </p>
            <LoyaltyCardsIllustration className="mt-4" />
          </div>
        </div>
        {/* Row AI: full width highlight */}
        <div className="min-h-[320px] p-8 md:p-12 rounded-2xl bg-brand_dark relative group transition-all cursor-pointer hover:-translate-y-1 overflow-hidden">
          <OrbitingStars />
          <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1 text-left">
              <div className="flex items-center gap-3 mb-4">
                <svg width="64" height="64" viewBox="0 0 512 512" fill="none" className="w-16 h-16 md:w-20 md:h-20">
                  <path d="M486.983 383.795H471.651V364.195C471.651 325.192 439.904 293.477 400.9 293.477H380.348C380.808 289.669 381.267 285.827 381.628 281.953C395.614 274.501 405.102 265.144 407.663 253.751C408.517 249.844 409.173 245.937 409.666 241.997H421.452C433.205 241.997 442.759 232.443 442.759 220.69V179.619C442.759 167.898 433.205 158.345 421.452 158.345H414.557V73.8388C426.869 72.0328 436.39 61.4288 436.39 48.5918C436.39 34.5068 424.932 23.0488 410.88 23.0488C396.763 23.0488 385.305 34.5068 385.305 48.5918C385.305 61.3958 394.826 72.0328 407.17 73.8388V158.346C401.983 158.608 397.977 157.492 391.937 160.086C364.031 114.024 311.994 89.1708 255.985 89.1708C200.107 89.1708 148.037 113.958 120.065 160.053C114.188 157.525 109.92 158.576 104.831 158.346V73.8388C117.175 72.0328 126.696 61.4288 126.696 48.5918C126.696 34.5068 115.238 23.0488 101.154 23.0488C87.0692 23.0488 75.6112 34.5068 75.6112 48.5918C75.6112 61.3958 85.0992 72.0328 97.4442 73.8388V158.346H90.5492C78.7962 158.346 69.2422 167.9 69.2422 179.62V220.691C69.2422 232.445 78.7962 241.998 90.5492 241.998H102.335C102.828 245.938 103.451 249.845 104.338 253.752C106.899 265.144 116.387 274.501 130.34 281.954C130.734 285.828 131.161 289.669 131.653 293.478H111.101C72.0982 293.478 40.3502 325.193 40.3502 364.196V383.796H25.0192C14.5792 383.796 6.07617 392.299 6.07617 402.74V434.159C6.07617 444.599 14.5792 453.103 25.0192 453.103C35.4592 453.103 43.9622 444.6 43.9622 434.159V421.683H75.0212V434.159C75.0212 444.599 83.5242 453.103 93.9642 453.103C104.437 453.103 112.907 444.6 112.907 434.159L112.94 402.74C112.94 392.3 104.437 383.796 93.9642 383.796H78.2382V364.196C78.2382 346.073 92.9792 331.365 111.102 331.365H137.925C157.426 423.85 202.996 488.953 255.985 488.953C309.007 488.953 354.576 423.849 374.045 331.365H400.901C419.024 331.365 433.765 346.073 433.765 364.196V383.796H418.006C407.566 383.796 399.063 392.299 399.063 402.74V434.159C399.063 444.599 407.566 453.103 418.006 453.103C428.479 453.103 436.949 444.6 436.949 434.159V421.683H468.04V434.159C468.04 444.599 476.543 453.103 486.983 453.103C497.423 453.103 505.926 444.6 505.926 434.159V402.74C505.926 392.298 497.423 383.795 486.983 383.795ZM421.452 165.733C429.134 165.733 435.372 171.971 435.372 179.62V220.691C435.372 228.373 429.134 234.611 421.452 234.611H410.388C411.931 211.137 406.842 187.663 395.614 166.585C399.685 165.076 400.802 165.995 421.452 165.733ZM101.614 234.612H90.5502C82.8682 234.612 76.6302 228.374 76.6302 220.692V179.621C76.6302 171.971 82.8682 165.734 90.5502 165.734C111.365 165.996 112.35 165.077 116.355 166.587C105.159 187.664 100.071 211.138 101.614 234.612ZM255.985 481.566C198.433 481.566 150.171 397.618 138.155 285.697C167.867 298.731 212.747 304.805 255.985 304.805C299.256 304.805 344.103 298.731 373.848 285.697C361.798 397.617 313.57 481.566 255.985 481.566ZM255.985 297.417C176.928 297.417 117.537 278.802 111.562 252.143C94.3582 175.68 155.719 96.5578 255.985 96.5578C356.546 96.5578 417.579 175.877 400.441 252.144C394.465 278.802 335.074 297.417 255.985 297.417Z" fill="white"/>
                  <path d="M255.984 319.84C229.489 319.84 207.887 341.41 207.887 367.937C207.887 394.464 229.49 416.034 255.984 416.034C282.511 416.034 304.114 394.464 304.114 367.937C304.114 341.41 282.511 319.84 255.984 319.84ZM255.984 380.281C249.188 380.281 243.672 374.733 243.672 367.937C243.672 361.141 249.188 355.625 255.984 355.625C262.813 355.625 268.328 361.141 268.328 367.937C268.328 374.733 262.812 380.281 255.984 380.281ZM255.984 119.67C171.379 119.67 120.524 184.183 133.919 246.299C134.018 246.792 134.247 247.218 134.51 247.645C142.028 258.381 185.825 274.304 255.984 274.304C326.176 274.304 369.973 258.381 377.491 247.645C377.754 247.218 377.951 246.792 378.082 246.299C391.345 184.839 341.377 119.67 255.984 119.67ZM371.023 243.902C365.245 250.337 328.638 266.916 255.983 266.916C183.361 266.916 146.755 250.336 140.976 243.902C129.288 187.104 175.941 127.057 255.983 127.057C336.321 127.057 382.645 187.301 371.023 243.902Z" fill="#5158F6"/>
                  <path d="M326.079 193.342C326.079 209.002 315.967 221.741 303.59 221.741C291.213 221.741 281.134 209.003 281.134 193.342C281.134 177.681 291.213 164.943 303.59 164.943C315.967 164.943 326.079 177.682 326.079 193.342ZM230.869 193.342C230.869 209.002 220.79 221.741 208.38 221.741C196.003 221.741 185.924 209.003 185.924 193.342C185.924 177.681 196.003 164.943 208.38 164.943C220.79 164.943 230.869 177.682 230.869 193.342ZM288.308 235.777C288.308 233.738 286.654 232.084 284.615 232.084C282.576 232.084 280.922 233.738 280.922 235.777C280.922 241.827 270.686 248.57 256.001 248.57C241.314 248.57 231.078 241.827 231.078 235.777C231.078 233.738 229.424 232.084 227.385 232.084C225.346 232.084 223.692 233.738 223.692 235.777C223.692 247.091 237.884 255.956 256.002 255.956C274.116 255.957 288.308 247.092 288.308 235.777Z" fill="#5158F6"/>
                </svg>
                <span className="bg-white/20 text-white text-xs font-satoshi_bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Nuevo
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-satoBold text-white text-left">
                Tu propio agente de IA
              </h3>
              <p className="mt-4 text-brand_ash text-base md:text-lg max-w-lg leading-relaxed text-left">
                Deja que la inteligencia artificial trabaje por ti. Nuestro agente responde a tus clientes, agenda citas y actualiza tu sitio web las 24 horas, incluso cuando no estás. Atiende más, sin esfuerzo extra.
              </p>
            </div>
            <AiChatIllustration className="md:w-[320px] mr-[10%] shrink-0" />
          </div>
        </div>
        {/* Row 4: 2+4+2 */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
          <div className="md:col-span-2 min-h-[240px] md:h-[840px] p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1 relative">
            <ExpressionSix className="opacity-0 absolute w-20 -left-16 rotate-[-120deg] top-36 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Dashboard de administración
            </h3>
            <p className="mt-3 text-brand_gray">
              Visualiza todas tus citas, clientes e ingresos en un solo lugar. Un panel intuitivo para gestionar tu negocio día a día sin complicaciones.
            </p>
            <DashStatsIllustration className="mt-10" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="min-h-[240px] flex-1 p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1 relative">
              <ExpressionEight className="opacity-0 absolute w-20 -right-10 bottom-1 group-hover:opacity-100 transition-all" />
              <h3 className="text-2xl font-satoBold text-brand_dark">
                Integra tu agenda con tu fanpage en redes sociales
              </h3>
              <p className="mt-3 text-brand_gray">
                Comparte el link de tu agenda directamente en Instagram, Facebook o WhatsApp. Tus seguidores podrán reservar con un solo clic sin salir de sus redes favoritas.
              </p>
              <SocialPagesIllustration className="mt-5" />
            </div>
            <div className="min-h-[240px] flex-1 p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1">
              <h3 className="text-2xl font-satoBold text-brand_dark">
                Crea expedientes para tus clientes
              </h3>
              <p className="mt-3 text-brand_gray">
                Guarda el historial de citas, notas y preferencias de cada cliente. Ofrece un servicio personalizado y profesional con toda la información a la mano.
              </p>
              <ClientFolderIllustration className="mt-5" />
            </div>
          </div>
          <div className="md:col-span-2 min-h-[240px] md:h-[840px] p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1 relative">
            <ExpressionSeven className="opacity-0 rotate-90 absolute w-20 -right-16 -bottom-16 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Recibe soporte prioritario
            </h3>
            <p className="mt-3 text-brand_gray">
              ¿Tienes dudas o necesitas ayuda? Nuestro equipo está listo para asistirte por correo o chat. Tu negocio no puede esperar y nosotros tampoco.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

const data = [
  {
    category: "Clases de idiomas",
    title: "Clases de idiomas",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Estudio de belleza",
    title: "Estudio de belleza",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Gimnasios",
    title: "Gimnasios",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },

  {
    category: "Centros deportivos",
    title: "Centros deportivos",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Spas",
    title: "Spas",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
  {
    category: "Experiencias turísticas",
    title: "Experiencias turísticas",
    src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "You can do more with AI.",
  },
]
