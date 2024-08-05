import { ChangeEvent, useMemo, useState } from "react";

export const addMinutesToString = (minutes: number, string: string) =>
  getStringFromMinutes(getMinutesFromString(string) + minutes);

export const getHourNumberFromString = (string: string) =>
  Number(string.split(":")[0]);
export const getMinutesFromString = (string: string) => {
  const h = Number(string.split(":")[0]);
  const m = Number(string.split(":")[1]);
  return m + h * 60;
};

export const getStringFromMinutes = (number: number) => {
  const h =
    Math.floor(number / 60) > 23 ? number % 24 : Math.floor(number / 60);
  // console.log("HH: ", h);
  const m = number % 60;
  return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
};

export const TimePicker = ({
  all,
  selected,
  startTime = "06:00",
  onChange,
}: {
  selected?: string;
  all?: Boolean;
  startTime?: string;
  onChange?: (startTime: string, endTime: string) => void;
}) => {
  const [value, set] = useState(startTime);
  const hourNumber = getHourNumberFromString(startTime) + 1;
  const hours = [...Array(all ? 24 : 24 - hourNumber).keys()].map(
    (index) => (hourNumber + index - 1) % 24 // (-) because is better to start at the top
  );

  const quarters: string[] = [];
  hours.forEach((hour) => {
    const h = hour > 9 ? `${hour}` : `0${hour}`;
    quarters.push(`${h}:00`);
    // quarters.push(`${h}:15`);
    quarters.push(`${h}:30`);
    // quarters.push(`${h}:45`);
  });
  const options = quarters;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    const minutes = getMinutesFromString(v);
    set(v);
    onChange?.(v, getStringFromMinutes(minutes + 60));
  };
  // console.log("OPTIONS?", options);
  return (
    <>
      <select
        value={selected ?? (value || startTime)}
        onChange={handleChange}
        className="border-gray-200 rounded-xl text-gray-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </>
  );
};

{
  /* <input
type="time"
className="border border-gray-200 rounded-xl text-gray-600"
/> */
}
