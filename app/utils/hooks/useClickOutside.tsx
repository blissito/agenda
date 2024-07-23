import { useEffect, useRef } from "react";

export const useClickOutside = <T,>(callback: () => void) => {
  const ref = useRef<T>(null);

  const handleClick = (e: Event) =>
    ref.current && !ref.current.contains(e.target as Node) && callback();

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
};
