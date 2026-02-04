import { useScroll, useSpring, useTransform, useVelocity } from "motion/react"

export const useScrollVelocityFactor = (
  mode: "fast" | "normal" | "slow" = "fast",
) => {
  const velocityFactor = useTransform(
    useVelocity(
      useSpring(useScroll().scrollY, {
        damping: 50,
        stiffness: 400,
      }),
    ),
    [0, 1000],
    [1, mode === "fast" ? 20 : mode === "slow" ? 5 : 10],
    {
      clamp: false,
    },
  )

  return velocityFactor
}
