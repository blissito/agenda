import { motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { FaArrowLeft, FaArrowRight, FaLinkedin } from "react-icons/fa"
import { twMerge } from "tailwind-merge"
import { generatePics } from "~/utils/generatePics"

export type Pic = {
  src: string
  name: string
  text: string
  title: string
  link: string
}
export type SimpeAnimatedGalleryProps = {
  pics?: Pic[] // Should be 8 minimum
  delay?: number
}

export const SimpleAnimatedGallery = ({
  pics = generatePics(),
  delay = 5,
}: SimpeAnimatedGalleryProps) => {
  const [gallery, setGallery] = useState<Pic[]>(pics)
  const saved = useRef<Pic | null | undefined>(null)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleNext = () => {
    setGallery((prev) => {
      const cloned = [...prev]
      saved.current && cloned.unshift(saved.current)
      saved.current = cloned.pop()
      return cloned
    })
  }

  const handlePrev = () => {
    const cloned = [...gallery]
    saved.current && cloned.push(saved.current)
    saved.current = cloned.shift()
    setGallery(cloned)
  }

  const removeInterval = () => {
    if (interval.current) clearInterval(interval.current)
  }

  const placeInterval = () => {
    removeInterval()
    interval.current = setInterval(handleNext, delay * 1000)
    return removeInterval
  }

  useEffect(() => {
    placeInterval()
    return removeInterval
  }, [delay])

  const handlePicClick = (index: number) => {
    const cloned = [...gallery]
    saved.current = cloned.splice(index, 1)[0]
    cloned.splice(gallery.length - 2, 0, saved.current)
    setGallery(cloned)
  }

  const active = useMemo(() => gallery[gallery.length - 2], [gallery])

  return (
    <main
      className="bg-white block box-content max-w-5xl overflow-hidden rounded-2xl"
      onMouseLeave={placeInterval}
      onFocus={removeInterval}
      onMouseOver={removeInterval}
    >
      <article className="flex justify-center items-center h-[40vh]">
        <section className="flex gap-2 justify-end w-[60%] items-end h-full translate-x-[117px] z-10 relative">
          {gallery.map((pic, i) => {
            const isActive = i === gallery.length - 2
            return (
              <Image
                id={pic.text}
                link={pic.link}
                src={pic.src}
                key={pic.text}
                isActive={isActive}
                onClick={() => handlePicClick(i)}
              />
            )
          })}
        </section>

        <section className="w-[40%] pl-8 pr-4 h-full relative z-20 bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            key={active.text}
            className="absolute inset-0 flex flex-col px-8 justify-center box-border"
          >
            <h2 className="font-bold text-sm"> {active.name}</h2>
            <p className="font-thin text-xs mb-6"> {active.title}</p>
            <strong className="text-5xl">"</strong>
            <p className="text-xs pr-8 text-center">{active.text}</p>
            <br />
            <strong className="text-5xl block text-right pr-12">" </strong>
          </motion.div>
        </section>
      </article>

      <section className="flex justify-center items-center gap-8 my-2 relative z-10">
        <NavigationButton onClick={handlePrev}>
          <FaArrowLeft />
        </NavigationButton>
        <NavigationButton onClick={handleNext}>
          <FaArrowRight />
        </NavigationButton>
      </section>
    </main>
  )
}

const NavigationButton = ({
  onClick,
  className,
  ...props
}: {
  className?: string
  onClick: () => void
  [x: string]: unknown
}) => (
  <button
    {...props}
    onClick={onClick}
    className={twMerge(
      "hover:scale-105 active:scale-100 rounded-full h-12 w-12 box-border bg-gray-200 grid place-content-center text-gray-800 transition-all",
      className,
    )}
  />
)

const Image = ({
  onClick,
  isActive,
  link,
  src,
  className,
  id,
}: {
  id?: string
  index?: string | number
  onClick?: () => void
  isActive?: boolean
  link?: string
  className?: string
  src: string
}) => {
  return (
    <motion.button
      key={id}
      layout
      transition={{ type: "spring", bounce: 0.3 }}
      onClick={onClick}
      className={twMerge(
        "relative h-44 min-w-28 rounded-lg",
        isActive && "h-[95%] min-w-40",
        className,
      )}
      whileHover={{ scaleY: 1.03, top: -2 }}
    >
      <img
        className={twMerge("w-full h-full object-cover rounded-xl")}
        src={src}
        alt="gallery pic"
      />
      {isActive && (
        <a
          rel="noreferrer"
          target="_blank"
          href={link}
          className="absolute bottom-0 right-2 text-4xl bg-white py-3 px-2 hover:scale-105 transition-all active:scale-100"
          style={{ borderTopRightRadius: 9, borderTopLeftRadius: 9 }}
        >
          <FaLinkedin />
        </a>
      )}
    </motion.button>
  )
}
