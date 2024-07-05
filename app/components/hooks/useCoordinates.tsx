import { useContext } from "react";
import { GridContext } from "../dash/agenda/calendarGrid.client";

export type HourOrDay = {
  number: number;
  string: string;
};

export const useCoordinates = ({ date }: { date: Date }) => {
  const { hours, days } = useContext(GridContext);
  const day = new Date(date).getDay();
  const hour = new Date(date).getHours() === 0 ? 24 : new Date(date).getHours();
  const y = hours.findIndex((h) => h.number === hour) + 1;
  const x = days.findIndex((d) => d.number === day) + 1;

  return {
    x,
    y,
  } as { x: number; y: number };
};
