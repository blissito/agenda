import { AnimatePresence, motion } from "motion/react"
import React, {
  createContext,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { BiCloset } from "react-icons/bi"
import { cn } from "~/utils/cn"
import { useOutsideClick } from "~/utils/hooks/use-outside-click"
import { PrimaryButton } from "../common/primaryButton"
import { SecondaryButton } from "../common/secondaryButton"
import { ArrowRight } from "../icons/arrowRight"

interface CarouselProps {
  items: ReactElement[]
  initialScroll?: number
  autoplayInterval?: number
}

type CardType = {
  src: string
  title: string
  category: string
  content: ReactNode
  titleAside?: ReactNode
}

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean
}

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void
  currentIndex: number
}>({
  onCardClose: () => {},
  currentIndex: 0,
})

export const Carousel = ({
  items,
  initialScroll = 0,
  autoplayInterval = 3000,
}: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll
      checkScrollability()
    }
  }, [initialScroll])

  const getCardWidth = useCallback(() => {
    return (typeof window !== "undefined" && window.innerWidth < 768)
      ? 230
      : 384
  }, [])

  const scrollLeft = useCallback(() => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth()
      carouselRef.current.scrollBy({ left: -(cardWidth + 16), behavior: "smooth" })
    }
  }, [getCardWidth])

  const scrollRight = useCallback(() => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth()
      carouselRef.current.scrollBy({ left: cardWidth + 16, behavior: "smooth" })
    }
  }, [getCardWidth])

  // Autoplay — se detiene al llegar al final
  useEffect(() => {
    if (isPaused || !canScrollRight) return

    const timer = setInterval(() => {
      if (!carouselRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      const remaining = scrollWidth - clientWidth - scrollLeft
      if (remaining <= 10) return // ya llegó al final, no seguir
      const cardWidth = getCardWidth() + 16
      // Si queda menos de una card, scrollear solo lo que falta
      const scrollAmount = remaining < cardWidth ? remaining : cardWidth
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }, autoplayInterval)

    return () => clearInterval(timer)
  }, [isPaused, canScrollRight, scrollRight, autoplayInterval, getCardWidth])

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth()
      const gap = 16
      const scrollPosition = (cardWidth + gap) * (index + 1)
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
      setCurrentIndex(index)
    }
  }

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-10 md:py-20 scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              "mx-auto",
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  },
                }}
                key={`card${index}`}
                className="rounded-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-brand_dark flex items-center justify-center disabled:opacity-30 hover:bg-brand_dark/80 transition-colors"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Anterior"
          >
            <ArrowRight className="h-6 w-6 text-gray-500 rotate-180" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-brand_dark flex items-center justify-center disabled:opacity-30 hover:bg-brand_dark/80 transition-colors"
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Siguiente"
          >
            <ArrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: CardType
  index: number
  layout?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { onCardClose } = useContext(CarouselContext)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    onCardClose(index)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  useOutsideClick(containerRef, handleClose)

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-50 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#D3D3D3]/30 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-5xl mx-auto bg-white h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative"
            >
              <button
                className="sticky top-4 h-8 w-8 right-0 ml-auto bg-gray-100 hover:bg-gray-200 transition-colors rounded-full flex items-center justify-center"
                onClick={handleClose}
              >
                <BiCloset className="h-6 w-6 text-gray-600" />
              </button>
              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <motion.p
                  layoutId={layout ? `title-${card.title}` : undefined}
                  className="text-2xl md:text-5xl font-satoBold text-brand_dark"
                >
                  {card.title}
                </motion.p>
                {card.titleAside}
              </div>
              <div className="py-10 text-lg text-brand_gray leading-relaxed">{card.content}</div>
              <div className="flex flex-col md:flex-row gap-4 pt-2">
                <PrimaryButton as="Link" to="/signin" className="w-full md:w-auto">
                  Crear cuenta <ArrowRight />
                </PrimaryButton>
                <SecondaryButton
                  as="a"
                  href="https://wa.me/525539111285?text=¡Hola!%20Quiero%20agendar%20un%20demo%20de%20Deník."
                  className="w-full md:w-auto"
                >
                  Agendar demo
                </SecondaryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="group/card rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-56 md:h-[40rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10"
      >
        {/* Bottom gradient */}
        <div className="absolute h-1/2 bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent z-30 pointer-events-none" />

        {/* Content — name centered at bottom, shifts up on hover */}
        <div className="absolute inset-x-0 bottom-0 z-40 p-8 flex flex-col items-center text-center">
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="text-white text-xl md:text-3xl font-semibold [text-wrap:balance] font-sans transition-transform duration-300 group-hover/card:-translate-y-14"
          >
            {card.title}
          </motion.p>
          <span className="absolute bottom-8 border border-white text-white text-xs md:text-sm px-5 py-2 rounded-full opacity-0 translate-y-3 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
            Ver más
          </span>
        </div>

        <BlurImage
          src={card.src}
          alt={card.title}
          fill
          className="object-cover absolute z-10 inset-0"
        />
      </motion.button>
    </>
  )
}

export const BlurImage = ({
  src,
  className,
  alt,
  fill,
  ...rest
}: ImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoading, setLoading] = useState(true)

  // Si la imagen ya está en caché del navegador, `onLoad` puede dispararse
  // antes de que React adjunte el listener. Verificamos `complete` al montar
  // para revelar las imágenes cacheadas.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoading(false)
    }
  }, [src])

  return (
    <img
      ref={imgRef}
      className={cn(
        "transition duration-300 object-cover w-full h-full ",
        isLoading ? "opacity-0" : "opacity-100",
        className,
      )}
      onLoad={() => setLoading(false)}
      src={src}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  )
}
