import JSConfetti from "js-confetti"
import { useEffect } from "react"

const sleep = (t = 1): Promise<void> =>
  new Promise((r) => setTimeout(r, t * 1000))

const shotBlueConfetti = (trigger: JSConfetti): void => {
  trigger.addConfetti({
    confettiRadius: 6,
    confettiColors: ["rgb(81 88 246)"],
  })
}

export const EmojiConfetti = ({
  mode = "default",
  emojis = ["🎉", "👾", "🎊", "🚀", "🥳", "🎈", "🪅"],
  repeat = 2,
  confettiColors = [
    "#ff0a54",
    "#ff477e",
    "#ff7096",
    "#ff85a1",
    "#fbb1bd",
    "#f9bec7",
  ],
}: {
  repeat?: number
  mode?: "default" | "emojis"
  emojis?: string[]
  confettiColors?: string[]
}) => {
  useEffect(() => {
    const jsConfetti = new JSConfetti()

    const start = async () => {
      if (mode === "emojis") {
        jsConfetti.addConfetti({
          emojis,
        })
        await sleep(2)
        jsConfetti.addConfetti({
          emojis,
        })
        return
      }
      let counter = 0
      while (counter < repeat) {
        counter++
        await sleep(1)
        shotBlueConfetti(jsConfetti)
        await sleep(1)
      }

      // await sleep(2);
      // jsConfetti.addConfetti();
      // shotBlueConfetti(jsConfetti);
    }
    start()
    /* eslint-disable */
  }, [emojis, mode, repeat])
  return null
}
