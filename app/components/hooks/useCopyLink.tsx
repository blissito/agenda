import { useRef } from "react";

export const useCopyLink = (link: string, onClick?: () => void) => {
  const ref = useRef<HTMLDivElement>();

  // @TODO: make this JSX to receive className 🤡
  const setPop = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const styleString = `position:absolute;z-index:10;top:${Math.floor(
      rect.top + rect.height - 40
    )}px;left:${Math.floor(
      rect.left + rect.width + 16
    )}px;background-color:gray;color:white;padding:4px;border-radius:9px;opacity:0.8;`;
    const p = document.createElement("p");
    p.textContent = "Copiado ✅";
    console.log("Aqui", styleString, p, rect);
    p.style = styleString;
    console.log(p);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  };

  return {
    ref,
    setLink: () => {
      setPop();
      navigator.clipboard.writeText(link);
      onClick?.();
    },
  };
};
