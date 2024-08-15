import { twMerge } from "tailwind-merge";

export const Camera = ({
  fill = "#D4D6DA",
  className = "className",
}: {
  fill?: string;
  props?: unknown;
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
      d="M28.5713 7H23.7141L22.557 3.75714C22.4771 3.53524 22.3306 3.34344 22.1375 3.20792C21.9445 3.0724 21.7143 2.99979 21.4784 3H10.5213C10.0391 3 9.607 3.30357 9.44629 3.75714L8.28557 7H3.42843C1.84986 7 0.571289 8.27857 0.571289 9.85714V26.1429C0.571289 27.7214 1.84986 29 3.42843 29H28.5713C30.1499 29 31.4284 27.7214 31.4284 26.1429V9.85714C31.4284 8.27857 30.1499 7 28.5713 7ZM15.9999 23.2857C12.8427 23.2857 10.2856 20.7286 10.2856 17.5714C10.2856 14.4143 12.8427 11.8571 15.9999 11.8571C19.157 11.8571 21.7141 14.4143 21.7141 17.5714C21.7141 20.7286 19.157 23.2857 15.9999 23.2857ZM12.5713 17.5714C12.5713 18.4807 12.9325 19.3528 13.5755 19.9958C14.2185 20.6388 15.0905 21 15.9999 21C16.9092 21 17.7812 20.6388 18.4242 19.9958C19.0672 19.3528 19.4284 18.4807 19.4284 17.5714C19.4284 16.6621 19.0672 15.79 18.4242 15.1471C17.7812 14.5041 16.9092 14.1429 15.9999 14.1429C15.0905 14.1429 14.2185 14.5041 13.5755 15.1471C12.9325 15.79 12.5713 16.6621 12.5713 17.5714Z"
      fill={fill}
      fill-opacity="0.24"
    />
  </svg>
);
