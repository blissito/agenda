export const Facebook = ({
  fill = "currentColor",
  className,
}: {
  fill?: string
  className?: string
}) => (
  <svg
    className={className}
    width="18"
    height="30"
    viewBox="0 0 18 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.9883 17.9688L16.875 12.1875H11.3281V8.43583C11.3281 6.85417 12.1029 5.3125 14.5874 5.3125H17.1094V0.390625C17.1094 0.390625 14.8206 0 12.6324 0C8.064 0 5.07812 2.76874 5.07812 7.78125V12.1875H0V17.9688H5.07812V31.9444C7.14886 32.2685 9.25739 32.2685 11.3281 31.9444V17.9688H15.9883Z"
      fill={fill}
    />
  </svg>
)