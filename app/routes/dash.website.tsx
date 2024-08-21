import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ReactNode, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { IoQrCodeOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Edit } from "~/components/icons/edit";
import { Facebook } from "~/components/icons/facebook";
import { Instagram } from "~/components/icons/insta";
import { Anchor } from "~/components/icons/link";
import { Linkedin } from "~/components/icons/linkedin";
import { Tiktok } from "~/components/icons/tiktok";
import { Twitter } from "~/components/icons/twitter";
import { Youtube } from "~/components/icons/youtube";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import Modal from "~/components/ui/dialog";
import { getUserAndOrgOrRedirect } from "~/db/userGetters";
import qrcode from "qrcode";
import { Org, Service } from "@prisma/client";

export const getQRImageURL = (urlString: string): Promise<string> => {
  // qrcode.toString(url.toString(), { type: "terminal" }, (_, link) => {
  //   console.log("URL : ", link);
  // });
  return new Promise((res) => {
    // @TODO: make a file and upload to s3?
    qrcode.toDataURL(
      urlString,
      {
        scale: 20,
      },
      (_, link) => {
        res(link);
      }
    );
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const { org } = await getUserAndOrgOrRedirect(request);
  url.pathname = `/${org.slug}/agenda`;
  const qr = await getQRImageURL(url.toString());

  return { url: url.toString(), qr, org };
};

export default function Website() {
  const { url, qr, org } = useLoaderData<typeof loader>();
  return (
    <main className=" ">
      <RouteTitle>Mi sitio web </RouteTitle>
      <section className=" grid grid-cols-6 gap-6">
        <CompanyInfo org={org} />
        <Template url={url} qr={qr} />
      </section>
    </main>
  );
}

export const Template = ({ url, qr }: { qr: string; url: string }) => {
  const [pop, set] = useState(false);

  return (
    <section className="col-span-6 xl:col-span-2 ">
      <div className="bg-white rounded-2xl overflow-hidden sticky top-8">
        <div className="bg-schedule w-full h-20 flex items-center justify-center px-6 text-white text-xl font-satoMiddle">
          Tu agenda esta lista... ¡Compártela!
        </div>
        <div className="flex justify-between px-4 py-6 items-center">
          <div>
            <p className="text-base text-brand_dark font-satoMiddle">
              Link de tu agenda en línea
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-brand_blue font-satoMiddle"
            >
              {url}
            </a>
          </div>
          <div className="flex gap-4 text-[20px] text-brand_gray">
            <Modal>
              {" "}
              <Edit className="hover:opacity-50 cursor-pointer" />
            </Modal>
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                set(true);
                setTimeout(() => set(false), 1000);
              }}
            >
              <FiCopy className="hover:opacity-50 cursor-pointer" />
            </button>
            <p
              id="pop"
              className={twMerge(
                "bg-brand_dark text-white text-xs min-w-fit p-2 rounded-lg absolute right-0 top-[15%]",
                pop ? "block" : "hidden"
              )}
            >
              Copiado ✅
            </p>
            <a download="código_qr" href={qr} target="_blank" rel="noreferrer">
              <IoQrCodeOutline className="hover:opacity-50 cursor-pointer" />
            </a>
          </div>
        </div>
        <hr className="bg-brand_stroke h-[1px] w-[94%] mx-auto border-none " />
        <div className="px-4 mt-4 pb-6">
          <p className="text-base text-brand_dark font-satoMiddle mb-3">
            Plantilla
          </p>
          <img
            className="w-full object-cover rounded-2xl"
            alt="template selected"
            src="https://i.imgur.com/Q7vLmZ0.png"
          />
        </div>
      </div>
    </section>
  );
};

export const CompanyInfo = ({
  services = [],
  isPublic,
  org,
}: {
  isPublic?: boolean;
  services?: Service[];
  org?: Org;
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 col-span-6 xl:col-span-4 order-last xl:order-first">
      {/* <div className=" relative mb-20">
        {" "}
        <img
          alt="service"
          className="w-full object-cover h-[160px] rounded-2xl "
          src="/images/serviceDefault.png"
        />
        <img
          alt="service"
          className="ml-6 -mt-16 border-[4px] border-white absolute rounded-full h-[120px] w-[120px] object-cover"
          src="/images/serviceDefault.png"
        />
      </div> */}
      <div className="">
        <div className="flex justify-between items-center">
          {" "}
          <h2 className="text-2xl font-bold">{org?.name} </h2>
          {!isPublic && (
            <SecondaryButton
              as="Link"
              to="/dash/website/general"
              className="h-10"
            >
              {" "}
              Editar
            </SecondaryButton>
          )}
        </div>

        <InfoBox title="Encargad@" value={org?.shopKeeper} />
        <InfoBox title="Teléfono" value="55 662 66 66" />
        <InfoBox title="Dirección" value={org?.address} />
        <InfoBox title="Descripción" />
        <hr className="bg-brand_stroke my-6" />

        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Horario</h3>
          {!isPublic && (
            <SecondaryButton
              as="Link"
              to="/dash/website/horario"
              className="h-10"
            >
              {" "}
              Editar
            </SecondaryButton>
          )}
        </div>
        <InfoBox title="Lunes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Martes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Miércoles" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Jueves" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Viernes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Sábado" value="Cerrado" />
        <InfoBox title="Domingo" value="Cerrado" />
        <hr className="bg-brand_stroke my-6" />
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Servicios</h3>
          {!isPublic && (
            <SecondaryButton
              as="Link"
              to="/dash/website/servicios"
              className="h-10"
            >
              {" "}
              Editar
            </SecondaryButton>
          )}
        </div>

        <div className="flex gap-x-6 flex-wrap pr-[10%]">
          {services.map((s) => (
            <InfoService
              key={s.id}
              title={s.name}
              link={`/agenda/${org?.slug}/${s.slug}`}
            />
          ))}
        </div>
        <hr className="bg-brand_stroke my-6" />
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Redes sociales</h3>
          {!isPublic && (
            <SecondaryButton
              as="Link"
              to="/dash/website/socialmedia"
              className="h-10"
            >
              {" "}
              Editar
            </SecondaryButton>
          )}
        </div>

        <MediaBox
          icon={<Facebook />}
          link="https://dribbble.com/search/image-empty-state"
        />

        <MediaBox
          icon={<Instagram />}
          link="https://dribbble.com/search/image-empty-state"
        />
        <MediaBox
          icon={<Twitter />}
          link="https://dribbble.com/search/image-empty-state"
        />

        <MediaBox
          icon={<Tiktok />}
          link="https://dribbble.com/search/image-empty-state"
        />
        <MediaBox
          icon={<Youtube />}
          link="https://dribbble.com/search/image-empty-state"
        />
        <MediaBox
          icon={<Linkedin />}
          link="https://dribbble.com/search/image-empty-state"
        />

        <MediaBox
          icon={<Anchor />}
          link="https://dribbble.com/search/image-empty-state"
        />
      </div>
    </div>
  );
};

export const MediaBox = ({
  icon,
  link,
}: {
  link?: string;
  icon: ReactNode;
}) => {
  return (
    <section className="flex gap-6 my-4 items-center font-satoshi">
      <span>{icon}</span>
      <p className=" text-brand_gray">{link ? link : "---"}</p>
    </section>
  );
};

export const InfoService = ({
  image,
  title,
  link,
}: {
  image?: string;
  title: string;
  link: string;
}) => {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={link}
      className="flex gap-4 my-4 items-center font-satoshi"
    >
      <img
        alt="service"
        className="w-16 h-12 rounded object-cover"
        src={image ? image : "/images/serviceDefault.png"}
      />
      <p>{title}</p>
    </a>
  );
};

export const InfoBox = ({
  title,
  value,
}: {
  title: string;
  value?: ReactNode;
}) => {
  return (
    <section className="grid grid-cols-8 gap-6 my-4 ">
      <p className="col-span-3 text-brand_dark font-satoshi">
        {" "}
        <strong>{title}</strong>
      </p>
      <p className="col-span-5 md:col-span-3 text-brand_gray font-satoshi">
        {value ? value : "---"}
      </p>
    </section>
  );
};
