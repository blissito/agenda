import type { ReactNode } from "react";

export const ItemClient = ({
  icon,
  text,
  link,
}: {
  icon: ReactNode;
  text: string;
  link?: string;
}) => {
  return (
    <a href={link}>
      <div className="flex items-center gap-2 text-brand_gray mb-2">
        <span>{icon}</span>
        <p>{text}</p>
      </div>
    </a>
  );
};
