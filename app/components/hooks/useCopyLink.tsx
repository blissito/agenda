// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { useRef } from "react";

export const useCopyLink = (link: string, onClick?: () => void) => {
  const ref = useRef<HTMLDivElement>();

  // @TODO: make this JSX to receive Tailwind classNames 🤡
  const setPop = () => {
    // Se comprueba que el elemento está presente en el ref y se obtienen su coordenadas
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const styleString = `position:absolute;z-index:10;top:${Math.floor(
      rect.top + rect.height - 40
    )}px;left:${Math.floor(
      rect.left + rect.width + 16
    )}px;background-color:#11151A;color:white;padding:4px 12px;border-radius:9px;`;
    const p = document.createElement("p");
    p.textContent = "Copiado ✅";
    p.style = styleString;
    document.body.appendChild(p);
    // Se agenda la remoción del elemento después de 2s
    setTimeout(() => p.remove(), 2000);
  };

  // API:
  return {
    ref,
    setLink: () => {
      setPop();
      navigator.clipboard.writeText(link);
      onClick?.();
    },
  };
};
