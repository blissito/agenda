import { MouseEvent } from "react";
// @todo: tolerate same index
export const useHoverIndex = () => {
  return {
    getIndex<T extends HTMLDivElement>(
      event: MouseEvent<T>,
      options: { grabbingIndex: number }
    ) {
      const { grabbingIndex } = options || {};
      const nodes = document.elementsFromPoint(event.clientX, event.clientY);
      if (!nodes || !Array.isArray(nodes)) return null;
      const cell = nodes.find(
        (ele) =>
          !!ele.dataset.index && Number(ele.dataset.index) !== grabbingIndex
      );
      if (!cell) return null;

      return Number(cell.dataset.index);
    },
  };
};
