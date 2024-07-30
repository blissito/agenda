import { type RefObject, useEffect, useRef } from "react";

export const useOutsideClick = <T extends HTMLElement>({
  isActive = true,
  onClickOutside,
  onClickInside,
}: {
  isActive?: boolean;
  onClickInside?: (e: MouseEvent) => void;
  onClickOutside?: (e: MouseEvent) => void;
}): RefObject<T> => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!isActive) return;
    const handleClick = (event: MouseEvent) => {
      ref.current?.contains(event.target as Node) // 🪄
        ? onClickInside?.(event)
        : onClickOutside?.(event);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
  return ref;
};
