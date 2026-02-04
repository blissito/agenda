import { type ReactNode } from "react"
import { Apple } from "../icons/business/apple"
import { Barbershop } from "../icons/business/barbershop"
import { Beauty } from "../icons/business/beauty"
import { Brain } from "../icons/business/brain"
import { Class } from "../icons/business/class"
import { Clinic } from "../icons/business/clinic"
import { Crossfit } from "../icons/business/corssfit"
import { Couch } from "../icons/business/couch"
import { Courses } from "../icons/business/courses"
import { Dance } from "../icons/business/dance"
import { Equipment } from "../icons/business/equipment"
import { Gym } from "../icons/business/gym"
import { Hair } from "../icons/business/hair"
import { Massage } from "../icons/business/massage"
import { Mat } from "../icons/business/mat"
import { Pet } from "../icons/business/pet"
import { Reformer } from "../icons/business/reformer"
import { Spa } from "../icons/business/spa"
import { Sports } from "../icons/business/sports"
import { Tourism } from "../icons/business/tourism"
export const Item = ({ icon, title }: { icon: ReactNode; title?: string }) => (
  <section className="flex gap-3 text-brand_iron w-[240px] ">
    {icon}
    <p>{title}</p>
  </section>
)

export const icons = [
  <Item icon={<Barbershop />} title="Barbería" />,
  <Item icon={<Spa />} title="Spa" />,
  <Item icon={<Sports />} title="Centro deportivo" />,
  <Item icon={<Clinic />} title="Estudios clínicos" />,
  <Item icon={<Courses />} title="Centro de idiomas" />,
  <Item icon={<Crossfit />} title="Crossfit" />,
  <Item icon={<Beauty />} title="Salón de belleza" />,
  <Item icon={<Apple />} title="Nutriólogo" />,
  <Item icon={<Brain />} title="Psicólogo" />,
  <Item icon={<Class />} title="Clases" />,
  <Item icon={<Dance />} title="Danza / Baile" />,
  <Item icon={<Gym />} title="Gimnasio" />,
  <Item icon={<Hair />} title="Estética" />,
  <Item icon={<Massage />} title="Terapia física" />,
  <Item icon={<Mat />} title="Yoga / meditación" />,
  <Item icon={<Equipment />} title="Consultorio médico" />,
  <Item icon={<Couch />} title="Coaching" />,
  <Item icon={<Pet />} title="Veterinaria" />,
  <Item icon={<Tourism />} title="Experiencias turísticas" />,
  <Item icon={<Reformer />} title="Pilates" />,
]

// export const muchos = Array.from({ length: 80 }).map(() => (
//   <Item icon={<Barbershop />} title="Barbería" />
// ));

export const muchos: ReactNode[] = icons
  .concat(icons)
  .concat(icons) as ReactNode[]

export const pocos: ReactNode[] = icons.concat(icons) as ReactNode[]

// .concat(icons.slice(0, 20));
