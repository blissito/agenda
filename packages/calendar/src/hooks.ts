import { useRef, useEffect, type RefObject } from "react";

/**
 * Hook that detects clicks outside of a referenced element
 */
export function useClickOutside<T extends HTMLElement>({
  isActive,
  onOutsideClick,
}: {
  isActive?: boolean;
  onOutsideClick: () => void;
}): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActive, onOutsideClick]);

  return ref;
}

/**
 * Format a date using locale (replacement for useMexDate)
 */
export function formatDate(date: Date, locale: string = "es-MX"): string {
  return new Date(date).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
