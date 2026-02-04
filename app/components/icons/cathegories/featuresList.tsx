export const FeaturesList = ({
  fill = "#11151A",
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.146 8.54391L3.584 9.89091L4.074 7.03791L2 5.01691L4.865 4.59991L6.146 2.00391L7.427 4.59991L10.292 5.01691L8.219 7.03691L8.709 9.89091L6.146 8.54391ZM6.146 19.6549L3.584 21.0019L4.074 18.1489L2 16.1279L4.865 15.7119L6.146 13.1149L7.427 15.7119L10.292 16.1279L8.219 18.1479L8.71 21.0019L6.146 19.6549Z"
      stroke={fill}
      strokeLinejoin="round"
    />
    <path
      d="M13.6553 5.80372L16.3483 8.13672L20.4793 3.63672"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13.7461 18.2227H20.5001" stroke={fill} strokeLinecap="round" />
  </svg>
)
