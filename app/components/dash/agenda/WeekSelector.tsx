import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";

export default function WeekSelector() {
  return (
    <nav className="flex mb-6 ">
      <h3 className="capitalize text-base text-brand_gray font-satoMiddle">
        {/* {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} */}
        1 - 7 de Agosto
      </h3>
      <button
        // disabled={isCurrentMonth()}
        // onClick={() => monthNavigate(-1)}
        className="disabled:text-gray-500 ml-2"
      >
        <IoChevronBackOutline />
      </button>

      <button
        // disabled={maxDate && currentDate > maxDate}
        className="disabled:text-gray-500 ml-2"
        // onClick={() => monthNavigate(1)}
      >
        <IoChevronForward />
      </button>
    </nav>
  );
}
