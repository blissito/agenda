export const Tiktok = ({
  fill = "#11151A",
  className = "className",
}: {
  fill?: string;
  className?: string;
}) => (
  <svg
    className={className}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16 5C15.4477 5 15 5.44772 15 6V20C15 21.1046 14.1046 22 13 22C11.8954 22 11 21.1046 11 20C11 18.8954 11.8954 18 13 18C13.5523 18 14 17.5523 14 17V14C14 13.4477 13.5523 13 13 13C9.13401 13 6 16.134 6 20C6 23.866 9.13401 27 13 27C16.866 27 20 23.866 20 20V14.6619C21.471 15.5127 23.1792 16 25 16C25.5523 16 26 15.5523 26 15V12C26 11.4477 25.5523 11 25 11C22.2386 11 20 8.76142 20 6C20 5.44772 19.5523 5 19 5H16Z"
      fill={fill}
    />
  </svg>
);
