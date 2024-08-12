export const Clook = ({
  fill = "#4B5563",
}: {
  fill?: string;
  props?: unknown;
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 11.874V7C12.5 6.72388 12.2761 6.5 12 6.5C11.7239 6.5 11.5 6.72388 11.5 7V12C11.5001 12.0825 11.5206 12.1636 11.5596 12.2363L13.0596 15.0352C13.1465 15.1975 13.3158 15.2989 13.5 15.2988C13.5825 15.2991 13.6638 15.2786 13.7363 15.2393C13.7361 15.2394 13.7366 15.2391 13.7363 15.2393C13.9792 15.1086 14.071 14.8054 13.9404 14.5625L12.5 11.874ZM12 2C6.47717 2 2 6.47717 2 12C2 17.5228 6.47717 22 12 22C17.5201 21.9935 21.9935 17.5201 22 12C22 6.47717 17.5228 2 12 2ZM12 21C7.02942 21 3 16.9706 3 12C3 7.02942 7.02942 3 12 3C16.9683 3.00543 20.9946 7.03168 21 12C21 16.9706 16.9706 21 12 21Z"
      fill={fill}
    />
  </svg>
);