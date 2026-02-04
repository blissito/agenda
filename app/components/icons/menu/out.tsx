export const Out = ({
  fill = "#11151A",
  className,
}: {
  fill?: string
  className?: string
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.6382 19.7163H6.48115C5.90158 19.7163 5.34576 19.486 4.93595 19.0762C4.52614 18.6664 4.29591 18.1106 4.2959 17.531V6.49196C4.2959 5.91238 4.52614 5.35653 4.93596 4.94671C5.34579 4.53688 5.90163 4.30664 6.48122 4.30664H12.6383"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.03711 12H18.9076"
      stroke={fill}
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M16.0381 8.33203L19.7042 12.0192L16.0303 15.693"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
