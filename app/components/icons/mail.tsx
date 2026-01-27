export const Mail = ({
  stroke = "currentColor",
  className,
}: {
  className?: string;
  stroke?: string;
}) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_mail)">
      <path
        d="M0.416992 10.332L9.75033 11.582C10.2503 11.582 10.667 11.332 10.917 10.9154L14.0003 2.08203"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.41631 17.9186L18.9996 12.3353C19.583 12.0019 19.7496 11.2519 19.4163 10.6686L14.833 2.66859C14.4996 2.08525 13.7496 1.91859 13.1663 2.25192L0.999642 9.33525C0.416309 9.66859 0.249642 10.4186 0.582975 11.0019L4.49964 17.9186M2.08298 17.9186H17.9163"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_mail">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
