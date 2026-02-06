import type { Service } from "@prisma/client"
import { CiStopwatch } from "react-icons/ci"
import { IoLocationOutline, IoMailOutline } from "react-icons/io5"
import { Denik } from "~/components/icons/denik"
import { Facebook } from "~/components/icons/facebook"
import { Instagram } from "~/components/icons/insta"
import { Linkedin } from "~/components/icons/linkedin"
import { Website } from "~/components/icons/menu/webiste"
import { Tiktok } from "~/components/icons/tiktok"
import { Twitter } from "~/components/icons/twitter"
import { getPublicImageUrl } from "~/utils/urls"
import { ItemClient } from "./ItemClient"
import { ServiceCardClient } from "./ServiceCardClient"
import { SocialMedia } from "./SocialMedia"
import { type TemplateOrg, WorkHour } from "./TemplateTwo"

export default function TemplateOne({
  services = [],
  isPublic,
  org,
  link,
}: {
  link?: string
  isPublic?: boolean
  services?: Service[]
  org?: TemplateOrg
}) {
  return (
    <div className="p-0 m-0 bg-[#FDFEFF] min-h-screen ">
      <div
        className="h-[300px] w-full"
        style={{
          backgroundImage:
            'url( "https://images.pexels.com/photos/2346216/pexels-photo-2346216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
        }}
      ></div>
      <section className=" -mt-[120px] px-[5%] grid  grid-cols-6 gap-8 pb-12 md:pb-12 z-30 ">
        <div className=" col-span-6 xl:col-span-4">
          <div className="bg-white  mx-auto rounded-2xl p-8 w-full border-[1px] border-[#EFEFEF]">
            <img
              alt="company logo"
              className="w-[120px] h-[120px] rounded-full mb-6 object-cover"
              src={
                getPublicImageUrl(org?.logo) ||
                "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              }
            />
            <h1 className="text-2xl font-title font-bold">{org?.name}</h1>
            <p className="mt-4 text-brand_gray">
              {org?.description ? org.description : null}
            </p>
            <div className="mt-6 block xl:hidden">
              {org?.email && (
                <ItemClient icon={<IoMailOutline />} text={org.email} />
              )}
              <WorkHour status="Abierto" icon={<CiStopwatch />} org={org} />
              {org?.address && (
                <ItemClient icon={<IoLocationOutline />} text={org.address} />
              )}
            </div>
            <div className="mt-8 flex gap-3">
              <SocialMedia
                icon={<Facebook fill="#ffffff" />}
                className="bg-[#405A94]"
              />
              <SocialMedia
                icon={<Linkedin fill="#ffffff" />}
                className="bg-[#3077AF]"
              />
              <SocialMedia
                icon={<Instagram fill="#ffffff" />}
                className="bg-[#E84187]"
              />
              <SocialMedia
                icon={<Twitter fill="#ffffff" />}
                className="bg-[#4AA1EC]"
              />
              <SocialMedia
                icon={<Tiktok fill="#ffffff" />}
                className="bg-[#020003]"
              />
              <SocialMedia
                icon={<Website fill="#ffffff" />}
                className="bg-[#5A51F0]"
              />
            </div>
          </div>
          <div className="bg-white  mx-auto rounded-2xl p-8 w-full border-[1px] border-[#EFEFEF] mt-8 bg-[#f8f8f">
            <h2 className="text-xl">Servicios</h2>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 mt-6 gap-4 gap-y-6">
              {services.map((service) => (
                <ServiceCardClient
                  serviceSlug={service.slug}
                  orgSlug={org?.slug}
                  key={service.id}
                  title={service.name}
                  duration={service.duration}
                  price={service.price}
                  image={service.photoURL}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden xl:block xl:col-span-2 mt-[164px]">
          {org?.email && (
            <ItemClient icon={<IoMailOutline />} text={org.email} />
          )}
          <WorkHour status="Abierto" icon={<CiStopwatch />} org={org} />
          {org?.address && (
            <ItemClient icon={<IoLocationOutline />} text={org.address} />
          )}
        </div>
      </section>
      <section className="  w-full h-10 flex items-center z-0 justify-center ">
        <p className="text-brand_blue text-sm">Powered by</p>
        <Denik className="h-8 -ml-5" />
      </section>
    </div>
  )
}
