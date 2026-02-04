import { useRef, type RefObject } from "react";

export const useCopyLink = <T extends HTMLElement = HTMLElement>(
  link: string,
  onClick?: () => void
): { ref: RefObject<T | null>; setLink: () => void } => {
  const ref = useRef<T | null>(null);

  const setPop = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const styleString = `position:absolute;z-index:10;top:${Math.floor(
      rect.top + rect.height - 40
    )}px;left:${Math.floor(
      rect.left + rect.width + 16
    )}px;background-color:#11151A;color:white;padding:4px 12px;border-radius:9px;`;
    const p = document.createElement("p");
    p.textContent = "Copiado ✅";
    p.style.cssText = styleString;
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
