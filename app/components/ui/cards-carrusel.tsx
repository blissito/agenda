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
        <div className="flex justify-end gap-2 mr-10">
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30 hover:bg-gray-200 transition-colors"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Anterior"
          >
            <ArrowRight className="h-6 w-6 text-gray-500 rotate-180" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30 hover:bg-gray-200 transition-colors"
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
              className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative"
            >
              <button
                className="sticky top-4 h-8 w-8 right-0 ml-auto bg-black dark:bg-white rounded-full flex items-center justify-center"
                onClick={handleClose}
              >
                <BiCloset className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-black dark:text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="text-2xl md:text-5xl font-semibold text-neutral-700 mt-4 dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-56 md:h-[40rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10"
      >
        <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
        <div className="relative z-40 p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-white text-sm md:text-base font-medium font-sans text-left"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans mt-2"
          >
            {card.title}
          </motion.p>
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
  const [isLoading, setLoading] = useState(true)
  return (
    <img
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
