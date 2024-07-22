import { useEffect, useRef } from "react";

export const useClickOutside = (callback: () => void) => {
  const ref = useRef<HTMLElement>(null);

  const handleClick = (e: Event) =>
    ref.current && !ref.current.contains(e.target as Node) && callback();

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  return ref;
};
