import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CiStopwatch } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { IoLocationOutline, IoMailOutline } from "react-icons/io5";
import { PiPhone } from "react-icons/pi";
import { twMerge } from "tailwind-merge";
import { Facebook } from "~/components/icons/facebook";
import { Instagram } from "~/components/icons/insta";
import { Linkedin } from "~/components/icons/linkedin";
import { Tiktok } from "~/components/icons/tiktok";
import { Twitter } from "~/components/icons/twitter";
import { ReactNode, useState } from "react";
import { Website } from "~/components/icons/menu/webiste";
import { Denik } from "~/components/icons/denik";
import { ServiceListCard } from "./ServiceListCard";
import { SocialMedia } from "./SocialMedia";
import { ItemClient } from "./ItemClient";

const week = [
  { id: 1, name: "Lun 9:00 a 5:00pm" },
  { id: 2, name: "Mar 9:00 a 5:00pm" },
  { id: 3, name: "Mie 9:00 a 5:00pm" },
  { id: 4, name: "Jue 9:00 a 5:00pm" },
  { id: 5, name: "Vie 9:00 a 5:00pm" },
];

export default function TemplateTwo({
  services = [],
  isPublic,
  org,
}: {
  isPublic?: boolean;
  services?: Service[];
  org?: Org;
}) {
  return (
    <section className="w-full h-auto min-h-screen bg-white">
      <div
        className="h-[300px] w-full"
        style={{
          backgroundImage:
            'url( "https://images.pexels.com/photos/2346216/pexels-photo-2346216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
        }}
      ></div>
      <img
        alt="company logo"
        className="w-[160px] h-[160px] rounded-full border-[8px] border-white ml-[5%] -mt-[60px]"
        src="https://images.pexels.com/photos/820735/pexels-photo-820735.jpeg?auto=compress&cs=tinysrgb&w=800"
      />
      <section className="grid grid-cols-6 px-[5%] mt-6 gap-10 pb-12 md:pb-20  ">
        <div className="col-span-6 lg:col-span-2">
          <h1 className="text-2xl font-title font-bold">{org.name}</h1>
          <p className="mt-4 text-brand_gray">
            {org.description ? org.description : null}
          </p>
          <div className="mt-6 ">
            <ItemClient icon={<PiPhone />} text="+52 775 728 11 23" />
            <ItemClient icon={<IoMailOutline />} text="estudioml@gmail.com" />
            <WorkHour status="Abierto" icon={<CiStopwatch />} org={org} />
            <ItemClient icon={<IoLocationOutline />} text={org.address} />
          </div>
          <div className="mt-8 flex gap-3">
            <SocialMedia icon={<Facebook />} />
            <SocialMedia icon={<Linkedin />} />
            <SocialMedia icon={<Instagram />} />
            <SocialMedia icon={<Twitter />} />
            <SocialMedia icon={<Tiktok />} />
            <SocialMedia icon={<Website />} />
          </div>
        </div>
        <div className="col-span-6 lg:col-span-4">
          <div className="bg-white  mx-auto rounded-2xl p-4 sm:p-8 w-full border-[1px] border-[#EFEFEF] bg-[#f8f8f">
            <h2 className="text-xl">Servicios</h2>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-1 mt-6 gap-4 gap-y-6">
              <ServiceListCard
                title="Clase de canto"
                duration={60}
                price="300.00"
              />
              <ServiceListCard
                title="Clase de canto"
                duration={60}
                price="300.00"
              />
              <ServiceListCard
                title="Clase de canto"
                duration={60}
                price="300.00"
              />
              <ServiceListCard
                title="Clase de canto"
                duration={60}
                price="300.00"
              />
              <ServiceListCard
                title="Clase de canto"
                duration={60}
                price="300.00"
              />
              <ServiceListCard
                title="Clase de canto"
                duration={60}
                price="300.00"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="  w-full h-10 flex items-center z-0 justify-center ">
        <p className="text-brand_blue text-sm">Powered by</p>
        <Denik className="h-8 -ml-5" />
      </section>
    </section>
  );
}

export const WorkHour = ({
  icon,
  text,
  status,
  org,
}: {
  icon: ReactNode;
  text?: string;
  status?: string;
  org?: Org;
}) => {
  const [selected, setSelected] = useState(week[1]);

  return (
    <section className="flex items-center my-2">
      {icon}
      <Listbox value={selected} onChange={setSelected}>
        <ListboxButton
          className={twMerge(
            "relative block w-auto rounded-lg  pr-8 pl-3 text-left text-sm/6 text-brand_gray",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          )}
        >
          <span className="mr-2 text-[#8AAA35]">Abierto</span>
          {selected.name}
          <IoIosArrowDown
            className="group pointer-events-none absolute top-1.5 right-2.5 size-4 fill-brand_gray"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={twMerge(
            "w-[var(--button-width)] rounded-xl shadow z-40 bg-white p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
            "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
          )}
        >
          {week.map((day) => (
            <ListboxOption
              key={day.name}
              value={day}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
              <div className="text-sm/6 text-brand_gray">{day.name}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </section>
  );
};
