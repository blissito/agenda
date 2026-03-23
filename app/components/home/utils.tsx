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
  <Item key="barberia" icon={<Barbershop />} title="Barbería" />,
  <Item key="spa" icon={<Spa />} title="Spa" />,
  <Item key="deportivo" icon={<Sports />} title="Centro deportivo" />,
  <Item key="clinicos" icon={<Clinic />} title="Estudios clínicos" />,
  <Item key="idiomas" icon={<Courses />} title="Centro de idiomas" />,
  <Item key="crossfit" icon={<Crossfit />} title="Crossfit" />,
  <Item key="belleza" icon={<Beauty />} title="Salón de belleza" />,
  <Item key="nutriologo" icon={<Apple />} title="Nutriólogo" />,
  <Item key="psicologo" icon={<Brain />} title="Psicólogo" />,
  <Item key="clases" icon={<Class />} title="Clases" />,
  <Item key="danza" icon={<Dance />} title="Danza / Baile" />,
  <Item key="gimnasio" icon={<Gym />} title="Gimnasio" />,
  <Item key="estetica" icon={<Hair />} title="Estética" />,
  <Item key="terapia" icon={<Massage />} title="Terapia física" />,
  <Item key="yoga" icon={<Mat />} title="Yoga / meditación" />,
  <Item key="medico" icon={<Equipment />} title="Consultorio médico" />,
  <Item key="coaching" icon={<Couch />} title="Coaching" />,
  <Item key="veterinaria" icon={<Pet />} title="Veterinaria" />,
  <Item key="turismo" icon={<Tourism />} title="Experiencias turísticas" />,
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
