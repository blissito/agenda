import { stagger, useAnimate, useSpring } from "motion/react"
import { nanoid } from "nanoid"
import { Children, type ReactNode, useState } from "react"

//@TODO: STILL A WIP, HOW TO STAGGER PAIR LETTERS ??

interface WordNodeElement {
  props?: {
    children?: string
  }
}

export const FlipWordsThree = ({
  delay: _delay = 0.03,
  children,
}: {
  delay?: number
  children: ReactNode
}) => {
  const wordNode = Children.toArray(children)[0] as WordNodeElement
  const [letters] = useState<string[]>(
    (wordNode?.props?.children ?? "").split(""),
  )

  // Unused springs for future implementation
  const _rotateX = useSpring(0, { bounce: 0 })
  const _y = useSpring(0, { bounce: 0 })

  return <BoxLetters letters={letters} />
}

export const BoxLetters = ({
  children: _children,
  letters,
}: {
  children?: ReactNode
  letters: string[]
}) => {
  const [scope, animate] = useAnimate<HTMLUListElement>()

  const handleEnter = () => {
    animate("li", { y: "50%" }, { delay: stagger(0.1) })
  }

  return (
    <ul
      ref={scope}
      className="flex gap-px"
      style={{
        perspective: 800,
        transformStyle: "preserve-3d",
      }}
    >
      {letters.map((letter, i) => (
        <section key={i}>
          {" "}
          <li key={nanoid()} onMouseEnter={handleEnter}>
            <div className="flex flex-col h-12 w-min overflow-hidden">
              <span key={nanoid()}> {letter}</span>
              <span key={nanoid()}> {letter}</span>
            </div>
          </li>
        </section>
      ))}
    </ul>
  )
}
