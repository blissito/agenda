import { useEffect } from "react";
import JSConfetti from "js-confetti";

const sleep = (t = 1) => new Promise((r) => setTimeout(r, t * 1000));

export const EmojiConfetti = ({
  mode = "default",
  emojis = ["🎉", "👾", "🎊", "🚀", "🥳", "🎈", "🪅"],
  confettiColors = [
    "#ff0a54",
    "#ff477e",
    "#ff7096",
    "#ff85a1",
    "#fbb1bd",
    "#f9bec7",
  ],
}: {
  mode?: "default" | "emojis";
  emojis?: string[];
  confettiColors?: string[];
}) => {
  useEffect(() => {
    const jsConfetti = new JSConfetti();

    const start = async () => {
      if (mode === "emojis") {
        jsConfetti.addConfetti({
          emojis,
        });
        await sleep(2);
        jsConfetti.addConfetti({
          emojis,
        });
        return;
      }
      jsConfetti.addConfetti();
      await sleep(2);
      jsConfetti.addConfetti();
    };
    start();
    /* eslint-disable */
  }, []);
  return null;
};
