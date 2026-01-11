// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { useContext } from "react";
import { GridContext } from "../dash/agenda/calendarGrid";

export type HourOrDay = {
  number: number;
  string: string;
};

export const useCoordinates = ({ date }: { date: Date }) => {
  // @TODO: add year to guard
  const { hours, days, week } = useContext(GridContext);
  const monthWeek = new Date(date).getMonth();
  const dateMonth = new Date(week[4].date).getMonth(); // @TODO maybe week need to know the months?
  const day = new Date(date).getDate();
  const hour = new Date(date).getHours() === 0 ? 24 : new Date(date).getHours();
  const y = hours.findIndex((h) => h.number === hour) + 1;
  const x = days.findIndex((d) => d.number === day) + 1;

  const isVisible = monthWeek === dateMonth && y > 0 && x > 0;

  return {
    isVisible,
    x,
    y,
  } as { x: number; y: number; isVisible: boolean };
};
