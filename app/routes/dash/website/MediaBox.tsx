import type { ReactNode } from "react";

export const MediaBox = ({
  icon,
  link,
}: {
  link?: string | null;
  icon: ReactNode;
}) => {
  return (
    <section className="flex gap-6 my-4 items-center font-satoshi">
      <span>{icon}</span>
      <p className=" text-brand_gray">{link ? link : "---"}</p>
    </section>
  );
};
