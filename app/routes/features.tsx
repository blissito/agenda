import { useEffect } from "react"
import type { MetaFunction } from "react-router"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { FinalCta } from "~/components/home/FinalCta"
import { Integrations } from "~/components/home/Integrations"
import { AiChatIllustration } from "~/components/icons/ai-chat"
import { ClientFolderIllustration } from "~/components/icons/client-folder"
import { DashStatsIllustration } from "~/components/icons/dash-stats"
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
import { LaptopIllustration } from "~/components/icons/laptop"
import { LoyaltyCardsIllustration } from "~/components/icons/loyalty-cards"
import { OrbitingStars } from "~/components/icons/orbiting-stars"
import { PaymentsIllustration } from "~/components/icons/payments"
import { RemindersIllustration } from "~/components/icons/reminders"
import { Rocket } from "~/components/icons/rocket"
import { SiteBuilderIllustration } from "~/components/icons/site-builder"
import { SocialPagesIllustration } from "~/components/icons/social-pages"
import { SupportChatIllustration } from "~/components/icons/support-chat"
import { UserFeatures } from "~/components/icons/userFeatures"

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
        <Integrations />
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

const Features = () => {
  return (
    <section className=" flex flex-col  justify-center text-center max-w-[90%] xl:max-w-7xl mx-auto pt-40 lg:py-[24%] xl:pt-[16%] pb-0 lg:pb-[160px]">
      <h2 className="group text-3xl lg:text-6xl	font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4"> Funcionalidades </span>
        <UserFeatures className="group-hover:animate-vibration-effect cursor-pointer w-[40px] h-[40px] md:w-16 md:h-16 mr-3" />
      </h2>
      <p className="text-lg lg:text-2xl text-brand_gray font-satoshi mt-4 md:mt-6 w-full mx-auto md:w-[90%]">
        Prueba todo lo que Deník tiene para ti y tu negocio
      </p>
      <div className="mt-12 md:mt-20 flex flex-col gap-8">
        {/* Row 1: 5+3 */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
          <div className="md:col-span-5 min-h-[240px] md:h-[480px] p-8 text-left rounded-2xl border border-[#EFEFEF] relative group transition-all cursor-pointer hover:-translate-x-1 hover:-translate-y-1">
            <ExpressionOne className="opacity-0 absolute w-20 rotate-[270deg] -left-12 -top-12 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Agenda en línea
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Permite a tus clientes reservar citas desde cualquier dispositivo,
              las 24 horas del día. Tú defines los horarios, la duración y la
              disponibilidad de cada servicio. Sin llamadas, sin mensajes, sin
              confusiones.
            </p>
            <LaptopIllustration className="mt-12" />
          </div>
          <div className="md:col-span-3 min-h-[240px] md:h-[480px] rounded-2xl border p-8 text-left border-[#EFEFEF] relative group transition-all cursor-pointer hover:translate-x-1 hover:-translate-y-1">
            <ExpressionTwo className="opacity-0 absolute w-20 -right-14 -top-16 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Recibe pagos en línea
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Cobra por tus servicios al momento de la reserva con MercadoPago.
              Reduce cancelaciones, asegura tu ingreso y ofrece una experiencia
              de pago rápida y segura para tus clientes.
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
              Tu negocio merece su propia presencia en línea. Con Deník obtienes
              un sitio web con tu nombre, logo, colores y catálogo de servicios
              listo para compartir con tus clientes. Sin necesidad de saber
              programar ni contratar a un diseñador.
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
              Olvídate de las inasistencias. Deník envía recordatorios por
              correo electrónico antes de cada cita para que tus clientes no
              olviden su reserva. Menos cancelaciones, más ingresos.
            </p>
            <RemindersIllustration className="mt-16" />
          </div>
          <div className="md:col-span-5 min-h-[240px] md:h-[480px] p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1 relative">
            <ExpressionThree className="opacity-0 absolute w-20 -right-14 top-28 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Ofrece descuentos o promociones por nivel de lealtad
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Premia la lealtad de tus clientes con un programa de puntos y
              recompensas. Cada visita suma puntos que pueden desbloquear
              descuentos o promociones especiales. Haz que regresen una y otra
              vez.
            </p>
            <LoyaltyCardsIllustration className="mt-4" />
          </div>
        </div>
        {/* Row AI: full width highlight */}
        <div
          id="ia"
          className="scroll-mt-28 min-h-[320px] p-8 md:p-12 rounded-2xl bg-brand_dark relative group transition-all cursor-pointer hover:-translate-y-1 overflow-hidden"
        >
          <OrbitingStars />
          <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1 text-left">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 512 512"
                  fill="none"
                  className="w-16 h-16 md:w-20 md:h-20"
                >
                  <path
                    d="M486.983 383.795H471.651V364.195C471.651 325.192 439.904 293.477 400.9 293.477H380.348C380.808 289.669 381.267 285.827 381.628 281.953C395.614 274.501 405.102 265.144 407.663 253.751C408.517 249.844 409.173 245.937 409.666 241.997H421.452C433.205 241.997 442.759 232.443 442.759 220.69V179.619C442.759 167.898 433.205 158.345 421.452 158.345H414.557V73.8388C426.869 72.0328 436.39 61.4288 436.39 48.5918C436.39 34.5068 424.932 23.0488 410.88 23.0488C396.763 23.0488 385.305 34.5068 385.305 48.5918C385.305 61.3958 394.826 72.0328 407.17 73.8388V158.346C401.983 158.608 397.977 157.492 391.937 160.086C364.031 114.024 311.994 89.1708 255.985 89.1708C200.107 89.1708 148.037 113.958 120.065 160.053C114.188 157.525 109.92 158.576 104.831 158.346V73.8388C117.175 72.0328 126.696 61.4288 126.696 48.5918C126.696 34.5068 115.238 23.0488 101.154 23.0488C87.0692 23.0488 75.6112 34.5068 75.6112 48.5918C75.6112 61.3958 85.0992 72.0328 97.4442 73.8388V158.346H90.5492C78.7962 158.346 69.2422 167.9 69.2422 179.62V220.691C69.2422 232.445 78.7962 241.998 90.5492 241.998H102.335C102.828 245.938 103.451 249.845 104.338 253.752C106.899 265.144 116.387 274.501 130.34 281.954C130.734 285.828 131.161 289.669 131.653 293.478H111.101C72.0982 293.478 40.3502 325.193 40.3502 364.196V383.796H25.0192C14.5792 383.796 6.07617 392.299 6.07617 402.74V434.159C6.07617 444.599 14.5792 453.103 25.0192 453.103C35.4592 453.103 43.9622 444.6 43.9622 434.159V421.683H75.0212V434.159C75.0212 444.599 83.5242 453.103 93.9642 453.103C104.437 453.103 112.907 444.6 112.907 434.159L112.94 402.74C112.94 392.3 104.437 383.796 93.9642 383.796H78.2382V364.196C78.2382 346.073 92.9792 331.365 111.102 331.365H137.925C157.426 423.85 202.996 488.953 255.985 488.953C309.007 488.953 354.576 423.849 374.045 331.365H400.901C419.024 331.365 433.765 346.073 433.765 364.196V383.796H418.006C407.566 383.796 399.063 392.299 399.063 402.74V434.159C399.063 444.599 407.566 453.103 418.006 453.103C428.479 453.103 436.949 444.6 436.949 434.159V421.683H468.04V434.159C468.04 444.599 476.543 453.103 486.983 453.103C497.423 453.103 505.926 444.6 505.926 434.159V402.74C505.926 392.298 497.423 383.795 486.983 383.795ZM421.452 165.733C429.134 165.733 435.372 171.971 435.372 179.62V220.691C435.372 228.373 429.134 234.611 421.452 234.611H410.388C411.931 211.137 406.842 187.663 395.614 166.585C399.685 165.076 400.802 165.995 421.452 165.733ZM101.614 234.612H90.5502C82.8682 234.612 76.6302 228.374 76.6302 220.692V179.621C76.6302 171.971 82.8682 165.734 90.5502 165.734C111.365 165.996 112.35 165.077 116.355 166.587C105.159 187.664 100.071 211.138 101.614 234.612ZM255.985 481.566C198.433 481.566 150.171 397.618 138.155 285.697C167.867 298.731 212.747 304.805 255.985 304.805C299.256 304.805 344.103 298.731 373.848 285.697C361.798 397.617 313.57 481.566 255.985 481.566ZM255.985 297.417C176.928 297.417 117.537 278.802 111.562 252.143C94.3582 175.68 155.719 96.5578 255.985 96.5578C356.546 96.5578 417.579 175.877 400.441 252.144C394.465 278.802 335.074 297.417 255.985 297.417Z"
                    fill="white"
                  />
                  <path
                    d="M255.984 319.84C229.489 319.84 207.887 341.41 207.887 367.937C207.887 394.464 229.49 416.034 255.984 416.034C282.511 416.034 304.114 394.464 304.114 367.937C304.114 341.41 282.511 319.84 255.984 319.84ZM255.984 380.281C249.188 380.281 243.672 374.733 243.672 367.937C243.672 361.141 249.188 355.625 255.984 355.625C262.813 355.625 268.328 361.141 268.328 367.937C268.328 374.733 262.812 380.281 255.984 380.281ZM255.984 119.67C171.379 119.67 120.524 184.183 133.919 246.299C134.018 246.792 134.247 247.218 134.51 247.645C142.028 258.381 185.825 274.304 255.984 274.304C326.176 274.304 369.973 258.381 377.491 247.645C377.754 247.218 377.951 246.792 378.082 246.299C391.345 184.839 341.377 119.67 255.984 119.67ZM371.023 243.902C365.245 250.337 328.638 266.916 255.983 266.916C183.361 266.916 146.755 250.336 140.976 243.902C129.288 187.104 175.941 127.057 255.983 127.057C336.321 127.057 382.645 187.301 371.023 243.902Z"
                    fill="#5158F6"
                  />
                  <path
                    d="M326.079 193.342C326.079 209.002 315.967 221.741 303.59 221.741C291.213 221.741 281.134 209.003 281.134 193.342C281.134 177.681 291.213 164.943 303.59 164.943C315.967 164.943 326.079 177.682 326.079 193.342ZM230.869 193.342C230.869 209.002 220.79 221.741 208.38 221.741C196.003 221.741 185.924 209.003 185.924 193.342C185.924 177.681 196.003 164.943 208.38 164.943C220.79 164.943 230.869 177.682 230.869 193.342ZM288.308 235.777C288.308 233.738 286.654 232.084 284.615 232.084C282.576 232.084 280.922 233.738 280.922 235.777C280.922 241.827 270.686 248.57 256.001 248.57C241.314 248.57 231.078 241.827 231.078 235.777C231.078 233.738 229.424 232.084 227.385 232.084C225.346 232.084 223.692 233.738 223.692 235.777C223.692 247.091 237.884 255.956 256.002 255.956C274.116 255.957 288.308 247.092 288.308 235.777Z"
                    fill="#5158F6"
                  />
                </svg>
                <span className="bg-white/20 text-white text-xs font-satoshi_bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Nuevo
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-satoBold text-white text-left">
                Tu propio agente de IA
              </h3>
              <p className="mt-4 text-brand_ash text-base md:text-lg max-w-lg leading-relaxed text-left">
                Deja que la inteligencia artificial trabaje por ti. Nuestro
                agente responde a tus clientes, agenda citas y actualiza tu
                sitio web las 24 horas, incluso cuando no estás. Atiende más,
                sin esfuerzo extra.
              </p>
            </div>
            <AiChatIllustration className="md:w-[320px] mr-[10%] shrink-0" />
          </div>
        </div>
        {/* Row 4: 2+4+2 */}
        <div className="grid grid-cols-1 md:grid-cols-8 md:h-[840px] gap-8">
          <div className="md:col-span-2 min-h-[240px] h-full p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1 relative">
            <ExpressionSix className="opacity-0 absolute w-20 -left-16 rotate-[-120deg] top-36 group-hover:opacity-100 transition-all" />
            <h3 className="text-2xl font-satoBold text-brand_dark">
              Dashboard de administración
            </h3>
            <p className="mt-3 text-brand_gray text-lg">
              Visualiza todas tus citas, clientes e ingresos en un solo lugar.
              Un panel intuitivo para gestionar tu negocio día a día sin
              complicaciones.
            </p>
            <DashStatsIllustration className="mt-10" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="min-h-[240px] flex-1 p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:-translate-x-1 relative">
              <ExpressionEight className="opacity-0 absolute w-20 -right-10 bottom-1 group-hover:opacity-100 transition-all" />
              <h3 className="text-2xl font-satoBold text-brand_dark">
                Integra tu agenda con tu fanpage en redes sociales
              </h3>
              <p className="mt-3 text-brand_gray text-lg">
                Comparte el link de tu agenda directamente en Instagram,
                Facebook o WhatsApp. Tus seguidores podrán reservar con un solo
                clic sin salir de sus redes favoritas.
              </p>
              <SocialPagesIllustration className="mt-5" />
            </div>
            <div className="min-h-[240px] flex-1 p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 relative">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                className="opacity-0 absolute w-14 -right-10 -top-10 group-hover:opacity-100 transition-all"
              >
                <g clipPath="url(#clip_exp)">
                  <path
                    d="M41.3908 40.3596C41.3608 40.3596 41.3408 40.3596 41.3108 40.3596C40.6308 40.3196 40.0808 39.8196 39.9708 39.1496C38.7008 31.0196 34.2808 25.8196 26.4508 23.2696C25.8108 23.0596 25.4108 22.4396 25.4708 21.7796C25.5308 21.1096 26.0408 20.5796 26.7108 20.4896C34.9708 19.3896 40.1408 14.9796 42.5408 7.00964C42.7408 6.35964 43.3708 5.92964 44.0408 5.99964C44.7208 6.05964 45.2608 6.58964 45.3308 7.26964C46.2608 15.6496 50.6608 20.8096 58.7808 23.0596C59.4408 23.2396 59.8808 23.8696 59.8308 24.5596C59.7708 25.2496 59.2308 25.7896 58.5508 25.8696C50.1308 26.7396 44.9708 31.1296 42.7708 39.3096C42.6008 39.9296 42.0308 40.3596 41.3908 40.3596ZM31.6108 22.3396C36.4908 24.9196 39.8508 28.8296 41.6508 34.0296C44.0608 28.9996 47.9408 25.6396 53.2508 23.9996C48.3508 21.5296 45.0708 17.6496 43.4608 12.3896C40.9008 17.3296 36.9408 20.6596 31.6108 22.3396Z"
                    fill="#5158F6"
                  />
                  <path
                    d="M1.43071 59.7102C1.02071 59.7102 0.620711 59.5402 0.340711 59.2102C-0.169289 58.6102 -0.0992891 57.7002 0.500711 57.1902L35.8207 27.1102C36.4207 26.6002 37.3307 26.6702 37.8407 27.2702C38.3507 27.8702 38.2807 28.7802 37.6807 29.2902L2.36071 59.3702C2.09071 59.5902 1.76071 59.7102 1.43071 59.7102Z"
                    fill="#5158F6"
                  />
                  <path
                    d="M55.8703 49.4404C55.8403 49.4404 55.8103 49.4404 55.7703 49.4404C55.2503 49.4004 54.7903 49.0904 54.5703 48.6104L52.8003 44.7804L49.2503 42.5104C48.8103 42.2304 48.5603 41.7304 48.5903 41.2104C48.6303 40.6904 48.9403 40.2304 49.4203 40.0104L53.2503 38.2404L55.5203 34.6904C55.8003 34.2504 56.3003 34.0004 56.8203 34.0304C57.3403 34.0704 57.8003 34.3804 58.0203 34.8604L59.7903 38.6904L63.3403 40.9604C63.7803 41.2404 64.0303 41.7404 64.0003 42.2604C63.9603 42.7804 63.6503 43.2404 63.1703 43.4604L59.3403 45.2304L57.0703 48.7804C56.8103 49.1904 56.3503 49.4404 55.8703 49.4404ZM52.9903 41.5104L54.6903 42.5904C54.9203 42.7404 55.1103 42.9504 55.2203 43.2004L56.0703 45.0304L57.1503 43.3304C57.3003 43.1004 57.5103 42.9104 57.7603 42.8004L59.5903 41.9504L57.8903 40.8704C57.6603 40.7204 57.4703 40.5104 57.3603 40.2604L56.5103 38.4304L55.4303 40.1304C55.2803 40.3604 55.0703 40.5504 54.8203 40.6604L52.9903 41.5104ZM58.1503 15.9004C58.1203 15.9004 58.0903 15.9004 58.0503 15.9004C57.5303 15.8704 57.0703 15.5504 56.8503 15.0704L55.8803 12.9804L53.9403 11.7404C53.5003 11.4604 53.2503 10.9604 53.2803 10.4404C53.3203 9.92039 53.6303 9.46039 54.1103 9.24039L56.2003 8.27039L57.4403 6.33039C57.7203 5.89039 58.2203 5.64039 58.7403 5.67039C59.2603 5.71039 59.7203 6.02039 59.9403 6.50039L60.9103 8.59039L62.8503 9.83039C63.2903 10.1104 63.5403 10.6104 63.5103 11.1304C63.4803 11.6504 63.1603 12.1104 62.6803 12.3304L60.5903 13.3004L59.3503 15.2404C59.1003 15.6504 58.6403 15.9004 58.1503 15.9004ZM57.6903 10.7304L57.7803 10.7904C58.0103 10.9404 58.2003 11.1504 58.3103 11.4004L58.3503 11.4904L58.4103 11.4004C58.5603 11.1704 58.7703 10.9804 59.0203 10.8704L59.1103 10.8304L59.0203 10.7704C58.7903 10.6204 58.6003 10.4104 58.4903 10.1604L58.4503 10.0704L58.3903 10.1604C58.2403 10.3904 58.0303 10.5704 57.7803 10.6904L57.6903 10.7304Z"
                    fill="#5158F6"
                  />
                  <path
                    d="M17.0095 21.7199C16.9795 21.7199 16.9495 21.7199 16.9095 21.7199C16.3895 21.6799 15.9295 21.3699 15.7095 20.8899L13.6295 16.3899L9.44953 13.7199C9.00953 13.4399 8.75953 12.9399 8.78953 12.4199C8.81953 11.8999 9.13953 11.4399 9.61953 11.2199L14.1195 9.13994L16.7895 4.95993C17.0695 4.51993 17.5695 4.25993 18.0895 4.29993C18.6095 4.33993 19.0695 4.64993 19.2895 5.12993L21.3695 9.62993L25.5495 12.2999C25.9895 12.5799 26.2395 13.0799 26.2095 13.5999C26.1795 14.1199 25.8595 14.5799 25.3795 14.7999L20.8795 16.8799L18.2095 21.0599C17.9495 21.4699 17.4895 21.7199 17.0095 21.7199ZM13.1995 12.7199L15.5195 14.1999C15.7495 14.3499 15.9395 14.5599 16.0495 14.8099L17.2095 17.3099L18.6895 14.9899C18.8395 14.7599 19.0495 14.5699 19.2995 14.4599L21.7995 13.2999L19.4795 11.8199C19.2495 11.6699 19.0595 11.4599 18.9495 11.2099L17.7895 8.70993L16.3095 11.0299C16.1595 11.2599 15.9495 11.4499 15.6995 11.5599L13.1995 12.7199Z"
                    fill="#5158F6"
                  />
                </g>
                <defs>
                  <clipPath id="clip_exp">
                    <rect width="64" height="64" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <h3 className="text-2xl font-satoBold text-brand_dark">
                Crea expedientes para tus clientes
              </h3>
              <p className="mt-3 text-brand_gray text-lg">
                Guarda el historial de citas, notas y preferencias de cada
                cliente. Ofrece un servicio personalizado y profesional con toda
                la información a la mano.
              </p>
              <ClientFolderIllustration className="mt-5" />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-8">
            <div className="flex-1 p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1">
              <h3 className="text-2xl font-satoBold text-brand_dark">
                Recibe soporte prioritario
              </h3>
              <p className="mt-3 text-brand_gray text-lg">
                ¿Tienes dudas o necesitas ayuda? Nuestro equipo está listo para
                asistirte por correo o chat. Tu negocio no puede esperar y
                nosotros tampoco.
              </p>
              <SupportChatIllustration className="mt-16" />
            </div>
            <div className="p-8 text-left rounded-2xl border border-[#EFEFEF] group transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1 relative">
              <ExpressionSeven className="opacity-0 rotate-90 absolute w-20 -right-16 -bottom-16 group-hover:opacity-100 transition-all" />
              <h3 className="text-2xl font-satoBold text-brand_dark">
                Reportes e historial
              </h3>
              <p className="mt-3 text-brand_gray text-lg">
                Consulta el historial completo de citas, ingresos y actividad de
                tu negocio. Toma mejores decisiones con datos claros y
                organizados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
