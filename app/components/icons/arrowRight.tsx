export const ArrowRight = ({
  fill = "#ffffff",
}: {
  fill?: string;
  props?: unknown;
}) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_472_1604)">
      <path
        d="M1.33467 19.7445C-0.0468507 17.3963 1.20449 12.808 4.52109 12.9831C8.35706 13.3471 9.80903 17.3053 12.4622 19.3664C14.0098 20.5687 15.4751 19.7119 16.4645 17.1672C16.9821 15.6896 17.2696 13.9851 18.555 12.9535C23.5257 8.96416 24.8254 20.4183 30.4388 16.8111"
        stroke={fill}
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M27.3174 15.2197L30.3007 16.3054C30.8116 16.4913 31.0803 17.0513 30.9058 17.5662L29.8491 20.6831"
        stroke={fill}
        strokeMiterlimit="10"
      />
    </g>
    <defs>
      <clipPath id="clip0_472_1604">
        <rect width="32" height="32" fill={fill} />
      </clipPath>
    </defs>
  </svg>
);
