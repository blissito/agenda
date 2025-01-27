import type { ReactNode } from "react";

export const InfoBox = ({
  title,
  value,
}: {
  title: ReactNode;
  value?: ReactNode;
}) => {
  return (
    <section className="grid grid-cols-8 gap-6 my-4 ">
      <div className="col-span-3 text-brand_dark font-satoshi">
        {" "}
        <strong>{title}</strong>
      </div>
      <div className="col-span-5 md:col-span-3 text-brand_gray font-satoshi">
        {value ? value : "---"}
      </div>
    </section>
  );
};
