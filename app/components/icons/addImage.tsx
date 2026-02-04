export const AddImage = ({
  fill = "#4B5563",
  className,
}: {
  fill?: string
  className?: string
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4C2.90694 4 2 4.90694 2 6V18C2 19.0931 2.90694 20 4 20H12V18H4V6H20V12H22V6C22 4.90694 21.0931 4 20 4H4ZM14.5 11L11 15L8.5 12.5L5.77734 16H16V13L14.5 11ZM18 14V18H14V20H18V24H20V20H24V18H20V14H18Z"
      fill={fill}
    />
  </svg>
)
