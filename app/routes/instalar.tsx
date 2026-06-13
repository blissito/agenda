import { type ReactNode, useEffect, useState } from "react"
import type { MetaFunction } from "react-router"
import { twMerge } from "tailwind-merge"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { Phone } from "~/components/icons/phone"
import { getMetaTags } from "~/utils/getMetaTags"

export const meta: MetaFunction = () =>
  getMetaTags({
    title: "Instala Deník | Guía paso a paso",
    description:
      "Aprende a instalar Deník como aplicación en tu navegador, iPhone (iOS) y Android. Guía paso a paso para tener tu agenda siempre a la mano.",
    url: "https://denik.me/instalar",
  })

export default function Instalar() {
  const [active, setActive] = useState<PlatformId>("navegador")

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

  const platform = PLATFORMS.find((p) => p.id === active) ?? PLATFORMS[0]

  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] pb-[120px]">
        <TopBar />

        <div className="max-w-[90%] xl:max-w-7xl mx-auto pt-[200px] lg:pt-[240px]">
          <Hero />

          {/* Tabs por plataforma */}
          <nav
            role="tablist"
            aria-label="Plataformas"
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={p.id === active}
                onClick={() => setActive(p.id)}
                className={twMerge(
                  "px-5 py-2 rounded-full border font-satoMedium transition-colors cursor-pointer",
                  p.id === active
                    ? "bg-brand_dark text-white border-brand_dark"
                    : "border-brand_stroke text-brand_dark hover:bg-brand_light_gray",
                )}
              >
                {p.tab}
              </button>
            ))}
          </nav>

          <Platform platform={platform} />
        </div>
      </div>
      <Footer />
    </main>
  )
}

// ==================== HERO ====================

const Hero = () => (
  <header className="text-center max-w-3xl mx-auto">
    <h1 className="group text-4xl lg:text-6xl font-satoBold text-brand_dark leading-tight flex flex-wrap items-center justify-center gap-3">
      <span>Instala</span>
      <Phone className="w-10 h-10 lg:w-14 lg:h-14 text-brand_blue group-hover:animate-vibration-effect cursor-pointer" />
      <span>Deník</span>
    </h1>
    <p className="text-brand_gray text-lg lg:text-xl font-satoshi mt-6">
      Deník es una PWA: puedes instalarla como una app sin pasar por ninguna
      tienda. Ocupa casi nada de espacio y se actualiza sola. Elige tu
      dispositivo y sigue los pasos.
    </p>
  </header>
)

// ==================== PLATFORM SECTION ====================

const Platform = ({ platform }: { platform: PlatformData }) => (
  <section
    role="tabpanel"
    aria-label={platform.title}
    className="mt-12 max-w-4xl mx-auto"
  >
    <div className="text-center">
      <h2 className="text-3xl lg:text-4xl font-satoBold text-brand_dark">
        {platform.title}
      </h2>
      <p className="text-brand_gray text-lg font-satoshi mt-4">
        {platform.description}
      </p>
    </div>

    <ol className="mt-10 flex flex-col gap-10">
      {platform.steps.map((step, i) => (
        <Step
          key={step.title}
          index={i + 1}
          step={step}
          isPhone={platform.id === "ios" || platform.id === "android"}
        />
      ))}
    </ol>
  </section>
)

type StepItem = { title: string; description: string; image?: string }

const Step = ({
  index,
  step,
  isPhone,
}: {
  index: number
  step: StepItem
  isPhone: boolean
}) => (
  <li className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
    {/* Texto del paso */}
    <div className="flex gap-4">
      <span className="shrink-0 w-10 h-10 rounded-full bg-brand_blue text-white font-satoBold flex items-center justify-center">
        {index}
      </span>
      <div>
        <h3 className="text-xl font-satoBold text-brand_dark">{step.title}</h3>
        <p className="text-brand_gray text-lg font-satoshi mt-2">
          {step.description}
        </p>
      </div>
    </div>

    {/* Espacio para imagen / captura.
        En iOS/Android las capturas son verticales (de teléfono): ocupan el
        alto con width auto, sin recortar (nada de object-cover). En navegador
        son landscape, así que llenan el ancho con aspect 16/10. */}
    {step.image ? (
      isPhone ? (
        <div className="w-full aspect-[16/10] flex items-center justify-center">
          <img
            src={step.image}
            alt={step.title}
            className="h-full w-auto rounded-2xl object-contain border border-gray-100"
          />
        </div>
      ) : (
        <img
          src={step.image}
          alt={step.title}
          className="w-full aspect-[16/10] rounded-2xl object-cover border border-gray-100"
        />
      )
    ) : (
      <ImagePlaceholder index={index} title={step.title} />
    )}
  </li>
)

// Espacio reservado para la captura de cada paso. Reemplazar el contenido
// interno por un <img src="..." /> cuando estén listas las imágenes.
const ImagePlaceholder = ({
  index,
  title,
}: {
  index: number
  title: string
}) => (
  <div className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-brand_stroke bg-brand_light_gray flex flex-col items-center justify-center text-center px-6">
    <Phone className="w-8 h-8 text-brand_gray/60" />
    <p className="text-brand_gray font-satoMedium mt-3">Imagen del paso {index}</p>
    <p className="text-brand_gray/70 text-sm mt-1">{title}</p>
  </div>
)

// ==================== CONTENIDO DE LAS PLATAFORMAS ====================

type PlatformId = "navegador" | "ios" | "android"

type PlatformData = {
  id: PlatformId
  tab: string
  title: string
  description: string
  steps: StepItem[]
}

const PLATFORMS: PlatformData[] = [
  {
    id: "navegador",
    tab: "Navegador",
    title: "Navegador (Chrome / Edge)",
    description:
      "Instala Deník como app de escritorio para abrirla en su propia ventana, sin pestañas ni barra de navegación.",
    steps: [
      {
        title: "Abre Deník en Chrome o Edge",
        description:
          "Entra a denik.me e inicia sesión en tu cuenta. La instalación se hace desde el dashboard (www.denik.me/dash).",
        image: "/images/pwa-1.webp",
      },
      {
        title: "Busca el ícono de instalar",
        description:
          "En la barra de direcciones, del lado derecho, aparece un ícono de instalar (una pantalla con una flecha). Haz clic en él.",
                      image: "/images/pwa-2.webp",
      },
      {
        title: "Confirma “Instalar”",
        description:
          "Se abrirá un cuadro de diálogo. Presiona “Instalar” y Deník se agregará como una app de escritorio.",
                      image: "/images/pwa-3.webp",
      },
      {
        title: "Ábrela como app",
        description:
          "Deník aparecerá en tu menú de aplicaciones y se abrirá en su propia ventana, sin barra del navegador.",
        image: "/images/pwa-4.webp",
      },
    ],
  },
  {
    id: "ios",
    tab: "iOS",
    title: "iOS (Safari o Chrome)",
    description:
      "En iPhone y iPad la instalación se hace con la opción “Agregar a inicio”. Funciona tanto en Safari como en Chrome.",
    steps: [
      {
        title: "Abre Deník en tu navegador",
        description:
          "Entra a denik.me desde Safari o Chrome en tu iPhone o iPad e inicia sesión.",
                  image: "/images/pwa-5.webp",
      },
      {
        title: "Toca el botón Compartir",
        description:
          "Toca el ícono de compartir (un cuadro con una flecha hacia arriba). En Safari está en la barra inferior; en Chrome, dentro del menú o junto a la barra de direcciones.",
             image: "/images/pwa-6.webp",
        },
      {
        title: "Elige “Agregar a inicio”",
        description:
          "Desliza el menú y selecciona “Agregar a pantalla de inicio”. Puedes editar el nombre antes de confirmar.",
        image: "/images/pwa-7.webp",
      },
      {
        title: "Confirma con “Agregar”",
        description:
          "Toca “Agregar” en la esquina superior derecha. El ícono de Deník aparecerá en tu pantalla de inicio como una app más.",
        image: "/images/pwa-8.webp",
      },
    ],
  },
  {
    id: "android",
    tab: "Android",
    title: "Android (Chrome)",
    description:
      "En Android, Chrome detecta Deník como app instalable y te ofrece agregarla a tu pantalla de inicio en un par de toques.",
    steps: [
      {
        title: "Abre Deník en Chrome",
        description:
          "Entra a denik.me desde Chrome en tu Android e inicia sesión. Verás tu dashboard (denik.me/dash) con tu agenda y tus métricas.",
        image: "/images/pwa-9.webp",
      },
      {
        title: "Toca “Instalar app” en el aviso de Chrome",
        description:
          "Chrome muestra abajo un aviso “Instala Deník como app”. Toca el botón azul “Instalar app”. Si no aparece, ábrelo desde el menú de tres puntos (⋮) → “Instalar app”.",
        image: "/images/pwa-10.webp",
      },
      {
        title: "Confirma con “Instalar”",
        description:
          "Se abre el cuadro “Instalar aplicación” con el ícono de Deník. Toca “Instalar” para agregarla a tu teléfono.",
        image: "/images/pwa-11.webp",
      },
      {
        title: "Abre Deník desde tu pantalla de inicio",
        description:
          "El ícono de Deník quedará en tu pantalla de inicio y en el cajón de apps, listo para abrirse a pantalla completa, sin barra del navegador.",
        image: "/images/pwa-12.webp",
      },
    ],
  },
]
