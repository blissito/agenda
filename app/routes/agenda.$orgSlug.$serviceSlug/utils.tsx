export const weekDictionary = {
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábado",
  0: "domingo",
};

export const getMaxDate = (initialDate: Date) => {
  initialDate.setMonth(initialDate.getMonth() + 2);
  return new Date(initialDate);
};

const getAvailableDays = (weekDays: WeekDaysType) => {
  // 1.- Map over the month?
  let days = getDaysInMonth(new Date()); // @TODO: better get grid?
  const daysInNextMonth = getDaysInMonth(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1)
  );
  const daysInAnotherMonth = getDaysInMonth(
    new Date(new Date().getFullYear(), new Date().getMonth() + 2)
  );
  // @TODO: Re-visit this, including just 3 months...
  days = days.concat(daysInNextMonth).concat(daysInAnotherMonth);
  const availableDays = days
    .filter((day) => {
      const date = new Date(day);
      const includedDays = Object.keys(weekDays);
      const today = new Date();
      if (
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime() <
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ).getTime()
      ) {
        return false; // not yesterday ✅
      }
      return includedDays.includes(weekDictionary[date.getDay()]);
    })
    .map((d) => `${d.getMonth()}/${d.getDate()}`);
  // console.log("Available", availableDays.length);
  // console.log("DAYS: ", days);

  // 2.- group them up
  // console.log("Dates: ", availableDays);
  // 3.- if week includes day:
  // 3.1.- save in available
  // 3.2.- ^ this with days for now. 👷🏼‍♂️
  return availableDays;
};

const getScheduledDates = (events: Event[]) => {
  if (!events || !events.length) return [];
  const obj: { [x: string]: Record<string, string[]> } = { "0": { "1": [] } };
  events.forEach((e) => {
    // @TODO: get locale from client

    // const month = new Date(e.start).toLocaleString("es-MX").split("/")[1];
    const month = Number(e.dateString.split("/")[1]) - 1; // @TODO: improve please

    const date = Number(e.dateString.split("/")[0]);

    // {date,strings}
    // const timeString = fromDateToTimeString(e.start);
    const timeString = e.dateString.split(",")[1].trim();
    obj[month] ||= { "1": [] };
    obj[month][date] ||= [];
    obj[month][date] = [...new Set([...obj[month][date], timeString])]; // Avoiding repeatition
  });
  return obj;
}; // r
