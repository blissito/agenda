export const usePluralize = () => (word: string, number: number) =>
  word + (number === 1 ? "" : "s");
