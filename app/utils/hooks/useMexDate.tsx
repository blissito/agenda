export const useMexDate = (date: Date | string, timeZone?: string) => {
  return new Date(date).toLocaleDateString("es-MX", {
    timeZone: timeZone ? timeZone : undefined,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    hour12: true,
  });
};
