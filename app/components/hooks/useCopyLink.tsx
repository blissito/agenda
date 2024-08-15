import { useRef } from "react";

export const useCopyLink = (link: string, onClick?: () => void) => {
  const ref = useRef<HTMLDivElement>();

  // @TODO: make this JSX to receive Tailwind classNames 🤡
  const setPop = () => {
    // Se comprueba que el elemento está presente en el ref y se obtienen su coordenadas
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Se calculan left y top
    const top = Math.floor(rect.top + rect.height - 42);
    const left = Math.floor(rect.left + rect.width + 4);
    // Estilos
    const styleString = `position:absolute;z-index:10;top:${top}px;left:${left}px;background-color:gray;color:white;padding:4px;border-radius:9px;opacity:0.8;`;
    // Se crea elelemento HTML, se modifica y se agrega al DOM
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
