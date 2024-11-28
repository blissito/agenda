import { RefObject, useEffect, useState } from "react";

export const useMeasure = (ref: RefObject<HTMLElement>) => {
  const [state, setState] = useState<DOMRect>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    toJSON() {},
  });

  const setMeasure = (node: HTMLElement) => {
    setState(node.getBoundingClientRect());
  };

  useEffect(() => {
    if (ref?.current) {
      setMeasure(ref.current);
    }
  }, [ref]);

  return state;
};