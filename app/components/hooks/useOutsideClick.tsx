import { type RefObject, useEffect, useRef } from "react";

export const useOutsideClick = <T extends HTMLElement>({
  isActive = true,
  onClickOutside,
  onClickInside,
  keyboardListener,
}: {
  keyboardListener?: boolean;
  isActive?: boolean;
  onClickInside?: (e: MouseEvent) => void;
  onClickOutside?: (e: MouseEvent | KeyboardEvent) => void;
}): RefObject<T> => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!isActive) return;
    const handleClick = (event: MouseEvent) => {
      ref.current?.contains(event.target as Node) // 🪄
        ? onClickInside?.(event)
        : onClickOutside?.(event);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClickOutside?.(event);
      }
    };
    document.addEventListener("click", handleClick);
    keyboardListener && document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      keyboardListener &&
        document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
  return ref;
};
