import type { ReactNode } from "react"

const sleep = (s: number) => new Promise((r) => setTimeout(r, s * 1000))

export const useToast = () => {
  const setInitial = (toast: HTMLElement) => {
    toast.style.transition = "all .3s ease"
    toast.style.position = "fixed"
    toast.style.top = "64px"
    toast.style.right = "40px"
    toast.style.transform = "translateY(20px)"
    toast.style.opacity = "0"
  }

  const setAnimate = (toast: HTMLElement) => {
    toast.style.transform = "translateY(0px)"
    toast.style.opacity = "1"
  }

  const setExit = (toast: HTMLElement) => {
    toast.style.transform = "translateY(-20px)"
    toast.style.opacity = "0"
  }

  const success = async ({
    text,
    icon = "✅",
  }: {
    text: ReactNode
    icon?: ReactNode
  }) => {
    const toast = document.createElement("section")
    setInitial(toast)
    toast.innerHTML = `
    <div class="pl-4 pr-4 py-4 h-16 bg-[#ECF2EB]  rounded-full text-green-800 flex items-center justify-center " >
    <div class="flex items-center gap-3"><span class="w-12 h-12 text-4xl flex items-center justify-center rounded-full">${icon}</span>
    <p class="text-xl text-[#32472F] "> ${text}</p></div>
    </div>
    `
    document.body.appendChild(toast)
    await sleep(0.01)
    setAnimate(toast)
    setTimeout(async () => {
      setExit(toast)
      await sleep(0.3)
      toast.remove()
    }, 3000)
  }
  return {
    success,
  }
}
