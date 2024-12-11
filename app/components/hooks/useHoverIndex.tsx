export const useHoverIndex = () => {
  return {
    getIndex(event: DragEvent, options: { grabbingIndex: number }) {
      const { grabbingIndex } = options || {};
      const overs = document.elementsFromPoint(event.clientX, event.clientY);
      if (!overs || !Array.isArray(overs)) return null;
      const cell = overs.find(
        (ele) =>
          !!ele.dataset.index && Number(ele.dataset.index) !== grabbingIndex
      );
      if (!cell) return null;

      return Number(cell.dataset.index);
    },
  };
};
