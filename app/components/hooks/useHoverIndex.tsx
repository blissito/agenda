import { type MouseEvent } from "react";

export const useHoverIndex = (): {
  getIndex: <T extends HTMLDivElement>(
    event: MouseEvent<T>,
    options: { grabbingIndex: number }
  ) => number | null;
} => {
  return {
    getIndex<T extends HTMLDivElement>(
      event: MouseEvent<T>,
      options: { grabbingIndex: number }
    ): number | null {
      const { grabbingIndex } = options || {};
      const nodes = document.elementsFromPoint(event.clientX, event.clientY);
      if (!nodes || !Array.isArray(nodes)) return null;
      const cell = nodes.find(
        (ele) =>
          !!(ele as HTMLElement).dataset.index &&
          Number((ele as HTMLElement).dataset.index) !== grabbingIndex
      );
      if (!cell) return null;

      return Number((cell as HTMLElement).dataset.index);
    },
  };
};
