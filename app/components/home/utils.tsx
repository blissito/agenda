import { ReactNode } from "react";
import { Barbershop } from "../icons/business/barbershop";
import { Spa } from "../icons/business/spa";
export const Item = ({ icon, title }: { icon: ReactNode; title?: string }) => (
  <section className="flex gap-3 text-brand_iron w-[240px] justify-center">
    {icon}
    <p>{title}</p>
  </section>
);

export const icons = [
  <Item icon={<Barbershop />} title="Barbería" />,
  <Item icon={<Spa />} title="Spa" />,
];

export const muchos = Array.from({ length: 80 }).map(() => (
  <Item icon={<Barbershop />} title="Barbería" />
));

// export const muchos = Array.from({ length: 1 })
//   .concat(icons)
//   .concat(icons)
//   .concat(icons.slice(0, 20));
