import { nanoid } from "nanoid";
import { useState } from "react";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";
import {
  convertDayToString,
  getDaysInMonth,
  isToday,
} from "~/components/dash/agenda/agendaUtils";
import { cn } from "~/utils/cd";
import { WeekDaysType } from "../form_handlers/aboutYourCompanyHandler";

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

export const MonthView = ({
  defaultDate = new Date(),
  weekDays,
  maxDate,
}: // @TODO: limit prev month and next month (if dates not available?) min, max dates?
// currentDate = new Date(),
{
  weekDays: WeekDaysType[];
  maxDate?: Date;
}) => {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const activatedDays = Object.keys(weekDays);

  const getIsDisabled = (_date: Date) => {
    if (!_date) return false;
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    // is yesterday or before
    if (_date < today) {
      return true;
    }
    // is bigger than max
    if (maxDate && _date > maxDate) {
      return true;
    }
    // is not part of the activated days
    if (!activatedDays.includes(convertDayToString(_date.getDay()))) {
      return true;
    }
    return false;
  };

  const handleClick = () => {
    onDayPress?.(_date);
  };

  const getNodes = (monthDate: Date) =>
    getDaysInMonth(monthDate).map((_date: Date) => {
      const isPartOfTheMonth =
        new Date(_date).getMonth() == monthDate.getMonth();

      const isDisabled = getIsDisabled(_date);
      // const isSelected = areSameDates(_date, selectedDate);
      const isAvailable = activatedDays.includes(
        convertDayToString(_date.getDay())
      );
      return (
        <button
          // onClick={handleClick}
          disabled={isDisabled}
          key={nanoid()}
          className={cn(
            "text-base italic text-neutral-400 rounded-full md:px-2 py-1 m-1 h-9 transition-all flex justify-center items-center hover:bg-brand_blue hover:text-white",
            isPartOfTheMonth && "text-brand_dark", // styles when part of the current month
            {
              "text-brand_gray bg-[#D2E2FF]": isAvailable,
              "bg-[#E7EFFD] text-brand_blue disabled:text-white":
                isToday(_date),
              // "bg-brand_blue text-white": isSelected,
              "disabled:text-brand_iron/30 disabled:line-through disabled:pointer-events-none disabled:bg-transparent":
                isDisabled,
            }
          )}
        >
          {_date.getDate()}
        </button>
      );
    });

  const [nodes, setNodes] = useState(getNodes(new Date()));

  const updateNodes = (_date: Date) => {
    setNodes(getNodes(_date));
  };

  const monthNavigate = (direction = 1) => {
    const d = new Date(currentDate);
    d.setMonth(currentDate.getMonth());
    if (direction > 0) {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
    updateNodes(d);
  };

  const isCurrentMonth = () =>
    currentDate.getFullYear() === new Date().getFullYear() &&
    currentDate.getMonth() === new Date().getMonth();

  return (
    <div className="min-w-60">
      <nav className="flex justify-between items-center mb-6">
        <button
          disabled={isCurrentMonth()}
          onClick={() => monthNavigate(-1)}
          className="ml-auto disabled:text-gray-500"
        >
          <IoChevronBackOutline />
        </button>
        <h3 className="capitalize text-base text-brand_dark font-satoMiddle mx-8">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          disabled={maxDate && currentDate > maxDate}
          className="mr-auto disabled:text-gray-500"
          onClick={() => monthNavigate(1)}
        >
          <IoChevronForward />
        </button>
      </nav>
      <div className="grid grid-cols-7 text-center font-thin italic text-sm">
        {dayNames.map((dayName) => (
          <span className="text-gray-600 text-base " key={nanoid()}>
            {dayName}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-sm font-satoshi mt-2">{nodes}</div>
    </div>
  );
};
