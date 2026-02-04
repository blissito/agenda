import { useEffect, useRef } from "react";

export const useTimeout = (
  secs: number
): { placeTimeout: (cb: () => void) => void; removeTimeout: () => void } => {
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const placeTimeout = (cb: () => void) => {
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(cb, secs);
  };
  const removeTimeout = () => {
    timeout.current && clearTimeout(timeout.current);
  };
  useEffect(() => timeout.current && clearTimeout(timeout.current), []);
  return { placeTimeout, removeTimeout };
};
