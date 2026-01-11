// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { useEffect, useRef } from "react";

export const useTimeout = (secs: number) => {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
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
